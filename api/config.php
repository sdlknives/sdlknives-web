<?php
// Konfigurasi penyimpanan data
// Gunakan 'mysql' saat di hosting produksi; tetap 'file' untuk lokal/dev
define('DATA_DRIVER', getenv('DATA_DRIVER') ?: 'supabase');

// Kredensial MySQL (isi sesuai hosting)
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'sdl_knives');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

// Password admin fallback (bisa diganti env var di hosting)
define('ADMIN_PASSWORD', getenv('ADMIN_PASSWORD') ?: 'fahmi123456789');

// Konfigurasi Supabase (untuk driver 'supabase')
define('SUPABASE_URL', getenv('SUPABASE_URL') ?: 'https://uvnibspplvwumaoahtmi.supabase.co');
define('SUPABASE_ANON_KEY', getenv('SUPABASE_ANON_KEY') ?: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2bmlic3BwbHZ3dW1hb2FodG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzM5NDAsImV4cCI6MjA3NzY0OTk0MH0.LZSk3O6LeEOAypxaShC263Jcn0GfyA6PK76Lm6mh4rg');
// Gunakan SERVICE ROLE KEY untuk operasi tulis server-side
define('SUPABASE_SERVICE_ROLE_KEY', getenv('SUPABASE_SERVICE_ROLE_KEY') ?: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2bmlic3BwbHZ3dW1hb2FodG1pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjA3Mzk0MCwiZXhwIjoyMDc3NjQ5OTQwfQ.QAA2dPiBlUOjpAG5aXPkNgo6noui6yyFSM0GcC11S_o');
// Nama bucket storage untuk upload gambar produk
define('SUPABASE_BUCKET', getenv('SUPABASE_BUCKET') ?: 'produk');
?>