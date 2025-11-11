<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/supabase.php';

try {
  $resp = supaRequest('GET', '/pg/config/version');
  echo json_encode(['ok'=>true,'version'=>json_decode($resp, true)]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
}
?>