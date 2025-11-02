// Konfigurasi Supabase untuk frontend (gunakan ANON KEY, bukan service_role)
// Diisi dari kredensial yang Anda berikan
window.SUPABASE_URL = "https://uvnibspplvwumaoahtmi.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2bmlic3BwbHZ3dW1hb2FodG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzM5NDAsImV4cCI6MjA3NzY0OTk0MH0.LZSk3O6LeEOAypxaShC263Jcn0GfyA6PK76Lm6mh4rg";
// Nama bucket storage untuk gambar produk (pastikan bucket ini ada di Supabase Storage)
window.SUPABASE_BUCKET = window.SUPABASE_BUCKET || "produk";
// Preferensi sumber data katalog: set ke 'json' untuk selalu pakai data/products.json
window.CATALOG_SOURCE = window.CATALOG_SOURCE || 'json';