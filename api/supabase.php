<?php
require_once __DIR__ . '/config.php';

function supaRequest(string $method, string $path, array $headers = [], $body = null) {
  if (!SUPABASE_URL) { http_response_code(500); echo json_encode(['ok'=>false,'error'=>'SUPABASE_URL belum dikonfigurasi']); exit; }
  $url = rtrim(SUPABASE_URL, '/') . $path;
  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
  $defaultHeaders = [
    'Accept: application/json',
    'apikey: ' . (SUPABASE_ANON_KEY ?: SUPABASE_SERVICE_ROLE_KEY),
    'Authorization: Bearer ' . (SUPABASE_SERVICE_ROLE_KEY ?: SUPABASE_ANON_KEY),
  ];
  $finalHeaders = array_merge($defaultHeaders, $headers);
  curl_setopt($ch, CURLOPT_HTTPHEADER, $finalHeaders);
  if (!is_null($body)) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
  }
  $resp = curl_exec($ch);
  $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $err = curl_error($ch);
  curl_close($ch);
  if ($err) { http_response_code(500); echo json_encode(['ok'=>false,'error'=>'Supabase error: '.$err]); exit; }
  if ($status >= 400) { http_response_code($status); echo $resp ?: json_encode(['ok'=>false,'error'=>'Supabase HTTP '.$status]); exit; }
  return $resp;
}

function supaRowToProduct(array $row) {
  $product = [
    'id' => $row['id'] ?? '',
    'name' => $row['name'] ?? '',
    'description' => $row['description'] ?? '',
    'price' => intval($row['price'] ?? 0),
    'imageUrl' => $row['image_url'] ?? '',
    'visible' => isset($row['visible']) ? (bool)$row['visible'] : true,
  ];
  if (isset($row['category'])) {
    $product['category'] = $row['category'];
  }
  if (isset($row['images'])) {
    if (is_array($row['images'])) { $product['images'] = $row['images']; }
    else {
      $decoded = json_decode($row['images'], true);
      $product['images'] = is_array($decoded) ? $decoded : [];
    }
  } else { $product['images'] = []; }
  if (isset($row['videos'])) {
    if (is_array($row['videos'])) { $product['videos'] = $row['videos']; }
    else {
      $vdecoded = json_decode($row['videos'], true);
      $product['videos'] = is_array($vdecoded) ? $vdecoded : [];
    }
  } else { $product['videos'] = []; }
  return $product;
}

function supaListProducts(): array {
  $resp = supaRequest('GET', '/rest/v1/products?select=*&order=created_at.desc');
  $rows = json_decode($resp, true);
  if (!is_array($rows)) return [];
  return array_map('supaRowToProduct', $rows);
}

function supaGetProduct(string $id) {
  $resp = supaRequest('GET', '/rest/v1/products?select=*&id=eq.' . rawurlencode($id));
  $rows = json_decode($resp, true);
  if (is_array($rows) && count($rows) > 0) { return supaRowToProduct($rows[0]); }
  return null;
}

function supaCreateProduct(array $product) {
  $payload = [
    'name' => $product['name'],
    'description' => $product['description'],
    'price' => intval($product['price']),
    'image_url' => $product['imageUrl'] ?? '',
    'images' => isset($product['images']) ? $product['images'] : [],
    'visible' => $product['visible'] ? true : false,
  ];
  if (array_key_exists('videos', $product)) { $payload['videos'] = $product['videos']; }
  // Sertakan id hanya jika valid UUID; biarkan Supabase buat otomatis bila tidak
  if (isset($product['id'])) {
    $id = (string)$product['id'];
    if (preg_match('/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/', $id)) {
      $payload['id'] = $id;
    }
  }
  if (isset($product['category']) && $product['category'] !== '') {
    $payload['category'] = $product['category'];
  }
  $json = json_encode($payload);
  $resp = supaRequest('POST', '/rest/v1/products', [
    'Content-Type: application/json',
    'Prefer: return=representation'
  ], $json);
  $rows = json_decode($resp, true);
  if (is_array($rows) && count($rows) > 0) { return supaRowToProduct($rows[0]); }
  return $product;
}

function supaUpdateProduct(array $product) {
  $payload = [
    'name' => $product['name'],
    'description' => $product['description'],
    'price' => intval($product['price']),
    'image_url' => $product['imageUrl'] ?? '',
    'images' => isset($product['images']) ? $product['images'] : [],
    'visible' => $product['visible'] ? true : false,
  ];
  if (array_key_exists('videos', $product)) { $payload['videos'] = $product['videos']; }
  if (isset($product['category']) && $product['category'] !== '') {
    $payload['category'] = $product['category'];
  }
  $json = json_encode($payload);
  $resp = supaRequest('PATCH', '/rest/v1/products?id=eq.' . rawurlencode($product['id']), [
    'Content-Type: application/json',
    'Prefer: return=representation'
  ], $json);
  $rows = json_decode($resp, true);
  if (is_array($rows) && count($rows) > 0) { return supaRowToProduct($rows[0]); }
  return $product;
}

function supaDeleteProduct(string $id) {
  supaRequest('DELETE', '/rest/v1/products?id=eq.' . rawurlencode($id));
}

function supaToggleVisibility(string $id, bool $visible) {
  $json = json_encode(['visible' => $visible ? true : false]);
  $resp = supaRequest('PATCH', '/rest/v1/products?id=eq.' . rawurlencode($id), [
    'Content-Type: application/json',
    'Prefer: return=representation'
  ], $json);
  $rows = json_decode($resp, true);
  if (is_array($rows) && count($rows) > 0) { return supaRowToProduct($rows[0]); }
  return null;
}

function supaPublicUrl(string $bucket, string $path) {
  return rtrim(SUPABASE_URL, '/') . '/storage/v1/object/public/' . trim($bucket, '/') . '/' . ltrim($path, '/');
}

?>