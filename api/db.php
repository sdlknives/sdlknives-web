<?php
require_once __DIR__ . '/config.php';

function getPDO() {
  static $pdo = null;
  if ($pdo) return $pdo;
  $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
  try {
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
  } catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Gagal koneksi database']);
    exit;
  }
  ensureSchema($pdo);
  return $pdo;
}

function ensureSchema(PDO $pdo) {
  $pdo->exec("CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INT NOT NULL,
    image_url VARCHAR(1024),
    images TEXT,
    visible TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )");
}

function rowToProduct(array $row) {
  $product = [
    'id' => $row['id'],
    'name' => $row['name'],
    'description' => $row['description'],
    'price' => intval($row['price']),
    'imageUrl' => $row['image_url'],
    'visible' => (bool) $row['visible'],
  ];
  // Parse images JSON if available
  if (!empty($row['images'])) {
    $images = json_decode($row['images'], true);
    $product['images'] = is_array($images) ? $images : [];
  } else {
    $product['images'] = [];
  }
  return $product;
}

function dbListProducts(PDO $pdo) {
  $stmt = $pdo->query("SELECT id, name, description, price, image_url, images, visible FROM products ORDER BY created_at DESC");
  $rows = $stmt->fetchAll();
  return array_map('rowToProduct', $rows);
}

function dbCreateProduct(PDO $pdo, array $product) {
  $imagesJson = isset($product['images']) ? json_encode($product['images']) : null;
  $stmt = $pdo->prepare("INSERT INTO products (id, name, description, price, image_url, images, visible) VALUES (?, ?, ?, ?, ?, ?, ?)");
  $stmt->execute([
    $product['id'], $product['name'], $product['description'], intval($product['price']), $product['imageUrl'], $imagesJson, $product['visible'] ? 1 : 0
  ]);
  return $product;
}

function dbUpdateProduct(PDO $pdo, array $product) {
  $imagesJson = isset($product['images']) ? json_encode($product['images']) : null;
  $stmt = $pdo->prepare("UPDATE products SET name = ?, description = ?, price = ?, image_url = ?, images = ?, visible = ? WHERE id = ?");
  $stmt->execute([
    $product['name'], $product['description'], intval($product['price']), $product['imageUrl'], $imagesJson, $product['visible'] ? 1 : 0, $product['id']
  ]);
  return $product;
}

function dbDeleteProduct(PDO $pdo, string $id) {
  $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
  $stmt->execute([$id]);
}

function dbToggleVisibility(PDO $pdo, string $id, bool $visible) {
  $stmt = $pdo->prepare("UPDATE products SET visible = ? WHERE id = ?");
  $stmt->execute([$visible ? 1 : 0, $id]);
}

?>