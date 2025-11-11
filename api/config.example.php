<?php
// Template konfigurasi server (produksi)
// Salin file ini menjadi api/config.php lalu isi/env sesuai hosting Anda.

// Pilih driver data: 'supabase' (disarankan), 'mysql', atau 'file'
define('DATA_DRIVER', getenv('DATA_DRIVER') ?: 'supabase');

// Kredensial MySQL (jika memilih DATA_DRIVER='mysql')
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'sdl_knives');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

// Password admin fallback (gunakan ENV di hosting untuk keamanan)
define('ADMIN_PASSWORD', getenv('ADMIN_PASSWORD') ?: 'ganti_password_admin');

// Supabase server-side (gunakan SERVICE ROLE KEY di server, JANGAN di frontend)
define('SUPABASE_URL', getenv('SUPABASE_URL') ?: '');
define('SUPABASE_ANON_KEY', getenv('SUPABASE_ANON_KEY') ?: ''); // optional untuk beberapa request
define('SUPABASE_SERVICE_ROLE_KEY', getenv('SUPABASE_SERVICE_ROLE_KEY') ?: '');
define('SUPABASE_BUCKET', getenv('SUPABASE_BUCKET') ?: 'produk');

// Cara pakai di hosting:
// - cPanel/Plesk: set ENV vars di panel (PHP ini akan pakai getenv()).
// - Shared hosting tanpa ENV: edit nilai default di sini secara manual.
// - Frontend: isi assets/config.js (gunakan ANON KEY). Server: isi SERVICE ROLE KEY.
?>