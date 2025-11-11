<?php
// Menambah kolom ke Supabase Postgres via koneksi langsung (PDO_PGSQL)
// Cara pakai:
// 1) CLI: C:\xampp\php\php.exe api\migrate_add_columns_pg.php "postgresql://postgres:PASS@db.XXXX.supabase.co:5432/postgres"
// 2) HTTP: /api/migrate_add_columns_pg.php?url=postgresql://postgres:PASS@db.XXXX.supabase.co:5432/postgres

header('Content-Type: application/json; charset=utf-8');

function parsePgUrl($url) {
  $parts = parse_url($url);
  if (!$parts || !isset($parts['host'])) { throw new Exception('URL Postgres tidak valid'); }
  $user = $parts['user'] ?? null;
  $pass = $parts['pass'] ?? null;
  $host = $parts['host'];
  $port = $parts['port'] ?? 5432;
  $db = isset($parts['path']) ? ltrim($parts['path'], '/') : 'postgres';
  return [
    'dsn' => "pgsql:host={$host};port={$port};dbname={$db}",
    'user' => $user,
    'pass' => $pass,
  ];
}

try {
  $url = null;
  if (php_sapi_name() === 'cli') {
    $url = isset($argv[1]) ? trim($argv[1]) : null;
  } else {
    $url = isset($_GET['url']) ? trim($_GET['url']) : null;
  }
  if (!$url) { throw new Exception('Harap kirim connection string Postgres lewat argumen atau ?url='); }
  $cfg = parsePgUrl($url);
  // Jika password placeholder, ambil dari env SUPABASE_DB_PASSWORD
  $pass = $cfg['pass'];
  if ($pass === '[YOUR_PASSWORD]') {
    $envPass = getenv('SUPABASE_DB_PASSWORD');
    if ($envPass && $envPass !== '') { $pass = $envPass; }
  }
  $pdo = new PDO($cfg['dsn'], $cfg['user'], $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  ]);

  $sqls = [
    "alter table if exists public.products add column if not exists videos jsonb default '[]'::jsonb",
    "alter table if exists public.products add column if not exists category text"
  ];
  $executed = [];
  foreach ($sqls as $sql) {
    $pdo->exec($sql);
    $executed[] = $sql;
  }

  echo json_encode(['ok'=>true,'executed'=>$executed]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
}
?>