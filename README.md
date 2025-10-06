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

## Lisensi
Hak cipta konten (foto, teks) milik pemilik situs. Jangan re-distribusi tanpa izin.