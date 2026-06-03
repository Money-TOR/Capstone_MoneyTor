Backend API
REST API manajemen keuangan UMKM — transaksi, stok, dan laba rugi real-time.

Cara Menjalankan
1. Siapkan folder project
Clone repository lalu masuk ke folder backend:

git clone https://github.com/Money-TOR/Capstone_MoneyTor.git
cd Capstone_MoneyTor/backend

2. Install dependencies
npm install

3. Buat file environment
cp .env.example .env
Lalu isi .env sesuai konfigurasi database dan JWT.

4. Setup database
mysql -u root -p < database/schema.sql

5. Jalankan server
npm run dev

Server berjalan di http://localhost:5000 Dokumentasi API tersedia di http://localhost:5000/api-docs

