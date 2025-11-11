<?php
// Import produk dari JSON legacy ke Supabase (upload gambar + create/update)
// Jalankan via CLI: php api/import_json_to_supabase.php
// Menggunakan SERVICE ROLE KEY jika tersedia; fallback ke ANON KEY bila kebijakan bucket mengizinkan.

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/supabase.php';

if (DATA_DRIVER !== 'supabase') {
  echo json_encode(['ok' => false, 'error' => 'DATA_DRIVER bukan supabase']);
  exit(1);
}

// Sumber JSON legacy
$jsonPaths = [
  __DIR__ . '/../data/products.json',
  __DIR__ . '/../SDL KNIVES - Copy/data/products.json'
];
$jsonFile = null;
foreach ($jsonPaths as $p) { if (file_exists($p)) { $jsonFile = $p; break; } }
if (!$jsonFile) { echo json_encode(['ok'=>false,'error'=>'products.json tidak ditemukan']); exit(1); }

$raw = file_get_contents($jsonFile);
$data = json_decode($raw, true);
if (!$data || !isset($data['products']) || !is_array($data['products'])) {
  echo json_encode(['ok'=>false,'error'=>'Format JSON tidak valid']); exit(1);
}

// Helper upload file ke Supabase Storage
function supaUploadLocalFile(string $bucket, string $localPath, string $desiredName = '') {
  if (!file_exists($localPath)) { return [false, 'File tidak ditemukan: '.$localPath]; }
  $year = date('Y'); $month = date('m');
  $base = $desiredName !== '' ? $desiredName : basename($localPath);
  $base = preg_replace('/[^a-zA-Z0-9_.-]/', '_', $base);
  $uniq = substr(md5($localPath.time()), 0, 8);
  $remotePath = $year . '/' . $month . '/' . $uniq . '_' . $base;
  $contentType = function_exists('mime_content_type') ? mime_content_type($localPath) : 'application/octet-stream';
  $url = rtrim(SUPABASE_URL, '/') . '/storage/v1/object/' . rawurlencode(trim($bucket,'/')) . '/' . $remotePath;

  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . (SUPABASE_SERVICE_ROLE_KEY ?: SUPABASE_ANON_KEY),
    'Content-Type: ' . $contentType,
    'x-upsert: false'
  ]);
  $data = file_get_contents($localPath);
  curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
  $resp = curl_exec($ch);
  $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $err = curl_error($ch);
  curl_close($ch);
  if ($err || $status >= 400) {
    return [false, 'Upload gagal: HTTP '.$status.' '.$err.' RESP='.$resp];
  }
  $public = supaPublicUrl($bucket, $remotePath);
  return [true, $public];
}

// Lokasi gambar lokal
$localRoots = [
  __DIR__ . '/../dist_frontend/',
  __DIR__ . '/../SDL KNIVES - Copy/'
];

$imported = 0; $skipped = 0; $errors = [];
foreach ($data['products'] as $p) {
  $id = isset($p['id']) ? (string)$p['id'] : null;
  if (!$id) { $skipped++; continue; }
  $name = trim($p['name'] ?? '');
  $desc = trim($p['description'] ?? '');
  $price = intval($p['price'] ?? 0);
  $visible = isset($p['visible']) ? !!$p['visible'] : true;
  $category = isset($p['category']) ? $p['category'] : null;
  $images = isset($p['images']) && is_array($p['images']) ? $p['images'] : [];
  $primary = trim($p['imageUrl'] ?? '');
  $videos = [];
  if (!empty($p['videoUrl'])) { $videos[] = $p['videoUrl']; }

  // Upload setiap gambar ke Supabase storage
  $uploadedUrls = [];
  $toUpload = $images;
  if ($primary) { array_unshift($toUpload, $primary); }
  $seen = [];
  foreach ($toUpload as $rel) {
    $rel = (string)$rel;
    if (isset($seen[$rel])) continue; $seen[$rel] = true;
    $foundPath = null;
    foreach ($localRoots as $root) {
      $candidate = rtrim($root, '/\\') . '/' . ltrim($rel, '/\\');
      if (file_exists($candidate)) { $foundPath = $candidate; break; }
    }
    if (!$foundPath) { $errors[] = "File lokal tidak ditemukan untuk {$id}: {$rel}"; continue; }
    list($ok, $result) = supaUploadLocalFile(SUPABASE_BUCKET, $foundPath, basename($rel));
    if ($ok) { $uploadedUrls[] = $result; }
    else { $errors[] = "Upload gagal {$id}: {$rel} -> {$result}"; }
  }

  // Bentuk payload untuk tabel products Supabase (tanpa id → auto UUID)
  $payload = [
    'name' => $name,
    'description' => $desc,
    'price' => $price,
    'imageUrl' => isset($uploadedUrls[0]) ? $uploadedUrls[0] : ($primary ?: ''),
    'images' => $uploadedUrls,
    'visible' => $visible,
  ];
  if ($category) { $payload['category'] = $category; }

  // Simpan ke Supabase (create baru)
  try {
    supaCreateProduct($payload);
    $imported++;
  } catch (Throwable $e) {
    $errors[] = 'Gagal simpan produk '.$id.': '.$e->getMessage();
  }
}

echo json_encode(['ok'=>true,'imported'=>$imported,'skipped'=>$skipped,'errors'=>$errors]);
?>