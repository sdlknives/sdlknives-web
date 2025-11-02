# SDL KNIVES Website

E-commerce sederhana untuk katalog produk SDL KNIVES. Pembelian dilakukan via WhatsApp.

## Fitur Utama
- Katalog dengan filter kategori, sorting, dan tombol "Muat lebih".
- Detail produk dengan galeri foto dan bar pembelian.
- Admin panel (`admin.html`) untuk tambah/ubah/hapus produk.
- Otentikasi admin sederhana (`api/auth.php`).
- Desain modern dengan animasi halus, aksesibilitas dasar.

## Struktur Proyek
```
SDL KNIVES/
├── admin.html
├── api/
│   ├── auth.php
│   └── products.php
├── assets/
├── catalog.html
├── data/
│   ├── products.json
│   └── reviews.json
├── foto/
│   ├── bg1 (1).jpg ... bg1 (8).jpg
│   └── logo.jpg
├── index.html
├── kontak.html
├── product.html
└── profile.html
```

## Jalankan Lokal
- Opsi 1 (PHP built-in server):
  ```powershell
  php -S localhost:8000
  ```
  Lalu buka `http://localhost:8000/catalog.html`.
- Opsi 2 (XAMPP): letakkan folder di `htdocs` dan akses via `http://localhost/SDL%20KNIVES/catalog.html`.

## Pembelian via WhatsApp
- Tombol di kartu produk mengarah ke WhatsApp dengan format pesan otomatis.
- Ubah `WHATSAPP_NUMBER` di `catalog.html` sesuai nomor admin.

## Admin & Upload Produk
- Buka `admin.html` → login dengan password di `api/auth.php` (ganti segera demi keamanan).
- Isi form: Nama, Harga, Deskripsi, URL Gambar, Status Tampil → Simpan.
- Data tersimpan di `data/products.json`.

## Deploy ke GitHub
1. Inisialisasi Git di folder proyek:
   ```powershell
   git init
   git add -A
   git commit -m "Initial commit: SDL KNIVES"
   ```
2. Buat repo baru di GitHub (mis. `sdl-knives`).
3. Tambah remote dan push:
   ```powershell
   git remote add origin https://github.com/<username>/sdl-knives.git
   git branch -M main
   git push -u origin main
   ```

Jika menggunakan GitHub CLI dan sudah login:
```powershell
gh repo create sdl-knives --public --source . --remote origin --push
```

## Hosting di GitHub Pages + Supabase
- Pastikan `assets/config.js` diisi:
  - `SUPABASE_URL` dan `SUPABASE_ANON_KEY` dari proyek Supabase Anda
  - `SUPABASE_BUCKET` untuk upload gambar (admin)
- Aktifkan GitHub Pages: Settings → Pages → Source: `main` (root)
- Tunggu publikasi, lalu akses situs.

Custom domain (opsional):
- Buat DNS `CNAME` ke `<username>.github.io`
- Ubah nama `CNAME.example` menjadi `CNAME` dan isi domain Anda (mis. `sdlknives.com`).

Catatan:
- GitHub Pages tidak memakai `.htaccess`; file itu untuk hosting Apache nanti.
- Meta CSP di halaman sudah mengizinkan Supabase dan jsDelivr.

## Konfigurasi Supabase (ringkas)
- Tabel `products` dibaca publik (RLS read), tulis hanya admin (RLS write).
- Storage bucket untuk gambar diakses publik read, admin write.
- Admin login memakai email + link magic atau password sesuai kebijakan Anda.

## Siapkan Hosting .com (Apache)
File yang sudah disertakan:
- `.htaccess` — header keamanan (CSP), caching, kompresi.
- `robots.txt` — ubah `Sitemap:` ke domain final Anda.
- `.well-known/security.txt` — ganti kontak ke email/WhatsApp Anda.
- `404.html` — halaman tidak ditemukan.
- `scripts/generate_sitemap.py` — script untuk membuat `sitemap.xml`.

Generate sitemap.xml:
```powershell
python scripts/generate_sitemap.py --base https://your-domain.com --root . --out sitemap.xml
```

## Lisensi
Hak cipta konten (foto, teks) milik pemilik situs. Jangan re-distribusi tanpa izin.