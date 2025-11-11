<?php
// Migrasi dari data/products.json ke MySQL
// Hanya dapat dijalankan oleh admin yang sudah login
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config.php';
if (DATA_DRIVER !== 'mysql') { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Driver bukan mysql']); exit; }
if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) { http_response_code(403); echo json_encode(['ok'=>false,'error'=>'Unauthorized']); exit; }
require_once __DIR__ . '/db.php';
$pdo = getPDO();

$src = __DIR__ . '/../data/products.json';
if (!file_exists($src)) { echo json_encode(['ok'=>false,'error'=>'File sumber tidak ditemukan']); exit; }
$raw = file_get_contents($src);
$data = json_decode($raw, true);
if (!$data || !isset($data['products'])) { echo json_encode(['ok'=>false,'error'=>'Format sumber tidak valid']); exit; }

$insert = $pdo->prepare("INSERT INTO products (id, name, description, price, image_url, visible) VALUES (?, ?, ?, ?, ?, ?) 
  ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), price=VALUES(price), image_url=VALUES(image_url), visible=VALUES(visible)");

$count = 0;
foreach ($data['products'] as $p) {
  $id = $p['id'] ?? uniqid('p');
  $name = trim($p['name'] ?? '');
  $description = trim($p['description'] ?? '');
  $price = intval($p['price'] ?? 0);
  $imageUrl = trim($p['imageUrl'] ?? '');
  $visible = isset($p['visible']) ? ($p['visible'] ? 1 : 0) : 1;
  if ($name === '' || $price <= 0) continue;
  $insert->execute([$id, $name, $description, $price, $imageUrl, $visible]);
  $count++;
}

echo json_encode(['ok'=>true, 'migrated'=>$count]);
?>