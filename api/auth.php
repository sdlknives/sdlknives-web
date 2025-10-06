<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

$action = $_GET['action'] ?? $_POST['action'] ?? 'status';
$PASSWORD = 'fahmi123456789';

switch ($action) {
  case 'login': {
    $password = $_POST['password'] ?? '';
    if ($password === $PASSWORD) {
      $_SESSION['admin'] = true;
      echo json_encode(['ok' => true, 'logged_in' => true]);
    } else {
      http_response_code(401);
      echo json_encode(['ok' => false, 'error' => 'Password salah']);
    }
    break;
  }
  case 'logout': {
    unset($_SESSION['admin']);
    echo json_encode(['ok' => true, 'logged_in' => false]);
    break;
  }
  case 'status':
  default: {
    $logged = isset($_SESSION['admin']) && $_SESSION['admin'] === true;
    echo json_encode(['ok' => true, 'logged_in' => $logged]);
  }
}
?>