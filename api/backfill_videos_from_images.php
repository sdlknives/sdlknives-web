<?php
// Backfill videos column using existing images and legacy JSON videoUrl
// Run: C:\xampp\php\php.exe api\backfill_videos_from_images.php
// Requires SUPABASE_SERVICE_ROLE_KEY for PATCH and Storage upload

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/supabase.php';

function isVideoUrl($url) {
  $u = strtolower((string)$url);
  return (str_ends_with($u, '.mp4') || str_ends_with($u, '.webm') || str_ends_with($u, '.mov'));
}

// Minimal helper to upload local files to Supabase Storage and return public URL
function supaUploadLocalFile(string $bucket, string $localPath, string $desiredName = '') {
  if (!file_exists($localPath)) { return [false, 'File not found: '.$localPath]; }
  $year = date('Y'); $month = date('m');
  $base = $desiredName !== '' ? $desiredName : basename($localPath);
  $base = preg_replace('/[^a-zA-Z0-9_.-]/', '_', $base);
  $uniq = substr(md5($localPath.time()), 0, 8);
  $remotePath = $year . '/' . $month . '/' . $uniq . '_' . $base;
  $contentType = function_exists('mime_content_type') ? mime_content_type($localPath) : 'application/octet-stream';
  $url = rtrim(SUPABASE_URL, '/') . '/storage/v1/object/' . rawurlencode(trim(SUPABASE_BUCKET,'/')) . '/' . $remotePath;

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
    return [false, 'Upload failed: HTTP '.$status.' '.$err.' RESP='.$resp];
  }
  $public = supaPublicUrl(SUPABASE_BUCKET, $remotePath);
  return [true, $public];
}

try {
  // Load legacy products.json for videoUrl lookup
  $jsonPaths = [
    __DIR__ . '/../data/products.json',
    __DIR__ . '/../SDL KNIVES - Copy/data/products.json'
  ];
  $jsonFile = null;
  foreach ($jsonPaths as $p) { if (file_exists($p)) { $jsonFile = $p; break; } }
  $legacyByName = [];
  if ($jsonFile) {
    $raw = file_get_contents($jsonFile);
    $data = json_decode($raw, true);
    if (is_array($data) && isset($data['products']) && is_array($data['products'])) {
      foreach ($data['products'] as $lp) {
        $n = isset($lp['name']) ? (string)$lp['name'] : '';
        if ($n !== '') { $legacyByName[$n] = $lp; }
      }
    }
  }

  // Potential local roots for files
  $localRoots = [
    __DIR__ . '/../dist_frontend/',
    __DIR__ . '/../SDL KNIVES - Copy/'
  ];

  $products = supaListProducts();
  $updated = 0; $skipped = 0; $errors = [];
  foreach ($products as $p) {
    $videos = isset($p['videos']) && is_array($p['videos']) ? $p['videos'] : [];
    $imgs = isset($p['images']) && is_array($p['images']) ? $p['images'] : [];
    // If videos already present, skip
    if (count($videos) > 0) { $skipped++; continue; }

    // First, try to collect video URLs already present in images (rare)
    $videoUrls = array_values(array_filter($imgs, function($x){ return isVideoUrl($x); }));

    // If none found, attempt legacy JSON lookup by name
    if (count($videoUrls) === 0 && isset($p['name']) && $p['name'] !== '' && isset($legacyByName[$p['name']])) {
      $legacy = $legacyByName[$p['name']];
      $legacyVideo = isset($legacy['videoUrl']) ? (string)$legacy['videoUrl'] : '';
      if ($legacyVideo !== '') {
        // Resolve local path for legacy video and upload to storage
        $foundPath = null;
        foreach ($localRoots as $root) {
          $candidate = rtrim($root, '/\\') . '/' . ltrim($legacyVideo, '/\\');
          if (file_exists($candidate)) { $foundPath = $candidate; break; }
        }
        if ($foundPath) {
          list($ok, $publicUrl) = supaUploadLocalFile(SUPABASE_BUCKET, $foundPath, basename($legacyVideo));
          if ($ok) { $videoUrls[] = $publicUrl; }
          else { $errors[] = ['id'=>$p['id'], 'error'=>'Upload video failed: '.$publicUrl]; }
        } else {
          $errors[] = ['id'=>$p['id'], 'error'=>'Local video not found: '.$legacyVideo];
        }
      }
    }

    if (count($videoUrls) === 0) { $skipped++; continue; }

    // Determine poster: image_url or first non-video image
    $poster = isset($p['imageUrl']) && $p['imageUrl'] !== '' ? $p['imageUrl'] : null;
    if (!$poster) {
      foreach ($imgs as $x) { if (!isVideoUrl($x)) { $poster = $x; break; } }
    }

    // Normalize to objects with url + optional poster
    $newVideos = array_map(function($v) use ($poster) {
      if (is_array($v)) { return $v; }
      return $poster ? [ 'url' => $v, 'poster' => $poster ] : [ 'url' => $v ];
    }, $videoUrls);

    $p['videos'] = $newVideos;
    try {
      supaUpdateProduct($p);
      $updated++;
    } catch (Throwable $e) {
      $errors[] = ['id'=>$p['id'], 'error'=>$e->getMessage()];
    }
  }
  $out = json_encode(['ok'=>true,'updated'=>$updated,'skipped'=>$skipped,'errors'=>$errors]);
  echo $out;
  // also persist to file for inspection
  @file_put_contents(__DIR__ . '/../tmp_backfill_output.json', $out);
} catch (Throwable $e) {
  http_response_code(500);
  $out = json_encode(['ok'=>false,'error'=>$e->getMessage()]);
  echo $out;
  @file_put_contents(__DIR__ . '/../tmp_backfill_output.json', $out);
}
?>