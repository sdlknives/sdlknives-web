<?php
// Menambah kolom yang kurang pada tabel public.products di Supabase
// Jalankan via CLI: php api/migrate_add_columns.php
// atau akses via HTTP: /api/migrate_add_columns.php

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/supabase.php';

if (DATA_DRIVER !== 'supabase') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'DATA_DRIVER bukan supabase']);
  exit(1);
}

// Siapkan SQL untuk menambah kolom yang kurang
// - videos: jsonb default []
// - category: text (nullable)
$sql = <<<SQL
alter table if exists public.products
  add column if not exists videos jsonb default '[]'::jsonb;
alter table if exists public.products
  add column if not exists category text;
SQL;

try {
  $payload = json_encode(['query' => $sql]);
  // PG Meta: eksekusi SQL
  // Lihat: https://github.com/supabase/postgres-meta (POST /query)
  $resp = supaRequest('POST', '/pg/query', [
    'Content-Type: application/json'
  ], $payload);
  $data = json_decode($resp, true);
  // Normalisasi keluaran
  echo json_encode([
    'ok' => true,
    'executed' => $sql,
    'result' => $data
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
?>