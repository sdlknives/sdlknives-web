<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

$dataFile = __DIR__ . '/../data/products.json';

function ensureDataFile($file) {
  if (!file_exists($file)) {
    @mkdir(dirname($file), 0777, true);
    $initial = [
      'products' => [
        [
          'id' => 'p1',
          'name' => 'Pisau Hunting Carbon Steel',
          'description' => 'Pisau berbahan carbon steel, cocok untuk outdoor.',
          'price' => 350000,
          'imageUrl' => 'https://images.unsplash.com/photo-1568220788953-a6d2631e8fcb?q=80&w=1200&auto=format&fit=crop',
          'visible' => true,
        ],
        [
          'id' => 'p2',
          'name' => 'Pisau Dapur Chef 8"',
          'description' => 'Pisau dapur tajam untuk kebutuhan memasak harian.',
          'price' => 420000,
          'imageUrl' => 'https://images.unsplash.com/photo-1491485880348-85d52b33a902?q=80&w=1200&auto=format&fit=crop',
          'visible' => true,
        ],
        [
          'id' => 'p3',
          'name' => 'Pisau Lipat EDC',
          'description' => 'Ringkas dan kokoh untuk dibawa sehari-hari.',
          'price' => 280000,
          'imageUrl' => 'https://images.unsplash.com/photo-1583346413974-75c0551db1c2?q=80&w=1200&auto=format&fit=crop',
          'visible' => false,
        ],
      ]
    ];
    file_put_contents($file, json_encode($initial, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
  }
}

function readData($file) {
  ensureDataFile($file);
  $raw = file_get_contents($file);
  $data = json_decode($raw, true);
  if (!$data) { $data = ['products' => []]; }
  return $data;
}

function writeData($file, $data) {
  return (bool) file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? $_POST['action'] ?? 'list';

$data = readData($dataFile);

function isAdmin() {
  return isset($_SESSION['admin']) && $_SESSION['admin'] === true;
}

function findIndexById($arr, $id) {
  foreach ($arr as $i => $p) { if (($p['id'] ?? '') === $id) return $i; }
  return -1;
}

switch ($action) {
  case 'list': {
    echo json_encode(['ok' => true, 'products' => $data['products']]);
    break;
  }
  case 'create': {
    if (!isAdmin()) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Unauthorized']); break; }
    $name = trim($_POST['name'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $price = intval($_POST['price'] ?? 0);
    $imageUrl = trim($_POST['imageUrl'] ?? '');
    $visible = ($_POST['visible'] ?? 'true') === 'true';
    if ($name === '' || $price <= 0) {
      http_response_code(400);
      echo json_encode(['ok' => false, 'error' => 'Nama dan harga wajib diisi']);
      break;
    }
    $id = uniqid('p');
    $product = compact('id', 'name', 'description', 'price', 'imageUrl', 'visible');
    $data['products'][] = $product;
    writeData($dataFile, $data);
    echo json_encode(['ok' => true, 'product' => $product, 'products' => $data['products']]);
    break;
  }
  case 'update': {
    if (!isAdmin()) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Unauthorized']); break; }
    $id = $_POST['id'] ?? '';
    $idx = findIndexById($data['products'], $id);
    if ($idx < 0) { http_response_code(404); echo json_encode(['ok' => false, 'error' => 'Produk tidak ditemukan']); break; }
    $name = trim($_POST['name'] ?? $data['products'][$idx]['name']);
    $description = trim($_POST['description'] ?? $data['products'][$idx]['description']);
    $price = intval($_POST['price'] ?? $data['products'][$idx]['price']);
    $imageUrl = trim($_POST['imageUrl'] ?? $data['products'][$idx]['imageUrl']);
    $visible = isset($_POST['visible']) ? (($_POST['visible'] ?? 'true') === 'true') : ($data['products'][$idx]['visible'] ?? true);
    $data['products'][$idx] = [ 'id' => $id, 'name' => $name, 'description' => $description, 'price' => $price, 'imageUrl' => $imageUrl, 'visible' => $visible ];
    writeData($dataFile, $data);
    echo json_encode(['ok' => true, 'product' => $data['products'][$idx], 'products' => $data['products']]);
    break;
  }
  case 'delete': {
    if (!isAdmin()) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Unauthorized']); break; }
    $id = $_POST['id'] ?? '';
    $idx = findIndexById($data['products'], $id);
    if ($idx < 0) { http_response_code(404); echo json_encode(['ok' => false, 'error' => 'Produk tidak ditemukan']); break; }
    array_splice($data['products'], $idx, 1);
    writeData($dataFile, $data);
    echo json_encode(['ok' => true, 'products' => $data['products']]);
    break;
  }
  case 'toggle_visibility': {
    if (!isAdmin()) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Unauthorized']); break; }
    $id = $_POST['id'] ?? '';
    $visible = ($_POST['visible'] ?? 'true') === 'true';
    $idx = findIndexById($data['products'], $id);
    if ($idx < 0) { http_response_code(404); echo json_encode(['ok' => false, 'error' => 'Produk tidak ditemukan']); break; }
    $data['products'][$idx]['visible'] = $visible;
    writeData($dataFile, $data);
    echo json_encode(['ok' => true, 'product' => $data['products'][$idx], 'products' => $data['products']]);
    break;
  }
  default: {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Aksi tidak dikenal']);
  }
}