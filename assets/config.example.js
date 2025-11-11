// Template konfigurasi frontend untuk produksi
// Salin file ini menjadi assets/config.js dan isi kredensial Anda
// Gunakan ANON KEY (bukan service role) untuk frontend

// URL Supabase project, contoh: https://xxxx.supabase.co
window.SUPABASE_URL = "";

// ANON KEY Supabase (Frontend)
window.SUPABASE_ANON_KEY = "";

// Nama bucket storage untuk media produk
window.SUPABASE_BUCKET = window.SUPABASE_BUCKET || "produk";

// Catatan:
// - Frontend hanya butuh URL + ANON KEY untuk baca/tulis gambar/video via Storage.
// - Operasi admin server-side (API PHP) memakai SERVICE ROLE KEY di server (lihat api/config.example.php).