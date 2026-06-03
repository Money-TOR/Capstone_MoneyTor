# MoneyTOR Backend API

Sistem backend untuk aplikasi manajemen keuangan usaha kecil berbasis web yang membantu pelaku UMKM mencatat transaksi, mengelola stok, dan memantau laba rugi secara real-time.

## Deskripsi

MoneyTOR Backend adalah REST API yang dibangun menggunakan Node.js dan Express.js sebagai inti dari aplikasi MoneyTOR. API ini menyediakan seluruh layanan data yang dibutuhkan oleh frontend, mulai dari autentikasi pengguna, pencatatan transaksi keuangan, manajemen stok barang, hingga endpoint khusus untuk kebutuhan analisis Data Science dan integrasi AI. Sistem ini dirancang untuk memudahkan pelaku usaha kecil dan menengah dalam mengelola keuangan usaha mereka secara terstruktur dan berbasis data.

Proyek ini dikembangkan sebagai bagian dari Coding Camp 2026 powered by DBS Foundation oleh tim CC26-PSU053.

---

## Prasyarat

Pastikan perangkat sudah terinstal:

- Node.js versi 18 atau lebih baru
- npm versi 8 atau lebih baru
- MySQL versi 8 atau lebih baru
- Git

---

## Instalasi

Ikuti langkah-langkah berikut untuk menjalankan proyek secara lokal.

**1. Clone repository**

```
git clone https://github.com/Money-TOR/Capstone_MoneyTor.git
cd Capstone_MoneyTor
```

**2. Masuk ke folder backend**

```
cd backend
```

**3. Install seluruh dependensi**

```
npm install
```

**4. Buat file konfigurasi environment**

Salin file contoh environment dan sesuaikan isinya:

```
cp .env.example .env
```

Isi file .env dengan nilai berikut:

```
DB_HOST=localhost
DB_USER=root
DB_PASS=password_mysql_anda
DB_NAME=moneytor_db
DB_PORT=3306
JWT_SECRET=isi_dengan_string_panjang_rahasia
JWT_EXPIRES_IN=7d
PORT=5000
API_KEY=MONEYTOR-2026-CC26PSU053-SECRET-KEY
AI_SERVICE_URL=
```

**5. Buat database dan jalankan schema**

Buka MySQL lalu jalankan file schema:

```
mysql -u root -p < database/schema.sql
```

**6. (Opsional) Jalankan seeder untuk data dummy**

```
node database/seed.js
```

**7. Jalankan server**

Untuk mode development:

```
npm run dev
```

Untuk mode production:

```
npm start
```

Server akan berjalan di http://localhost:5000

---

## Penggunaan

Setelah server berjalan, ada dua cara untuk menggunakan API ini.

**Melalui Swagger UI**

Buka browser dan akses alamat berikut untuk melihat dokumentasi API secara interaktif:

```
http://localhost:5000/api-docs
```

Di halaman ini semua endpoint tersedia dan bisa langsung dicoba tanpa perlu tools tambahan.

**Melalui Postman**

Import file koleksi Postman yang tersedia di folder dokumentasi, kemudian atur environment variable berikut:

```
base_url  = http://localhost:5000
api_key   = MONEYTOR-2026-CC26PSU053-SECRET-KEY
token     = (otomatis terisi setelah login)
```

Urutan penggunaan yang disarankan:

1. Daftar akun melalui POST /api/auth/register
2. Login melalui POST /api/auth/login untuk mendapatkan token JWT
3. Gunakan token tersebut di header Authorization pada setiap request selanjutnya dengan format: Bearer token_anda
4. Akses endpoint lainnya seperti /api/products, /api/transactions, dan /api/stock sesuai kebutuhan

Setiap request yang membutuhkan autentikasi wajib menyertakan dua header berikut:

```
Authorization: Bearer token_jwt_anda
x-api-key: MONEYTOR-2026-CC26PSU053-SECRET-KEY
```

---

## Struktur Proyek

```
backend/
  src/
    controllers/    logika pemrosesan setiap request
    models/         query langsung ke database
    routes/         definisi endpoint API
    middleware/     validasi token JWT dan API key
    config/         konfigurasi database dan Swagger
  database/
    schema.sql      struktur tabel database
    seed.js         data awal untuk pengujian
  .env.example      contoh konfigurasi environment
  package.json      daftar dependensi dan skrip
```

---

## Kontribusi

Kontribusi sangat terbuka untuk pengembangan lebih lanjut. Berikut langkah yang disarankan:

1. Fork repository ini ke akun GitHub pribadi
2. Buat branch baru dengan nama yang deskriptif, contoh: git checkout -b fitur/nama-fitur
3. Lakukan perubahan pada branch tersebut
4. Commit perubahan dengan pesan yang jelas, contoh: git commit -m "feat: tambah endpoint laporan bulanan"
5. Push branch ke repository fork: git push origin fitur/nama-fitur
6. Buat Pull Request ke branch main di repository utama
7. Tunggu review dari anggota tim sebelum perubahan digabungkan

Pastikan setiap perubahan sudah diuji menggunakan Postman sebelum membuat Pull Request.

---

## Lisensi

Proyek ini dikembangkan untuk keperluan akademis dalam program Coding Camp 2026 powered by DBS Foundation. Seluruh hak cipta dimiliki oleh tim CC26-PSU053. Penggunaan kode di luar keperluan akademis dan non-komersial wajib mencantumkan atribusi kepada tim pengembang.