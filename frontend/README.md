# MoneyTOr Frontend

MoneyTOr adalah aplikasi manajemen keuangan UMKM yang membantu pelaku usaha dalam memantau transaksi, stok barang, laporan keuangan, supplier, serta mendapatkan insight bisnis berbasis AI.

## 🚀 Fitur Utama

### Landing Page
- Tampilan modern dan responsif
- Informasi fitur aplikasi
- Tim pengembang
- Call To Action (CTA)

### Authentication
- Login akun
- Registrasi akun seller
- Penyimpanan token menggunakan Local Storage
- Protected Route berdasarkan status login

### Dashboard
- Ringkasan keuangan
- Statistik bisnis
- Insight bisnis otomatis
- Daftar transaksi terbaru
- Informasi stok produk

### Manajemen Keuangan
- Tambah transaksi
- Edit transaksi
- Hapus transaksi
- Monitoring pemasukan dan pengeluaran

### Manajemen Stok
- Daftar produk
- Monitoring stok
- Informasi stok minimum

### Supplier Management
- Daftar supplier
- Detail produk supplier

### Laporan
- Laporan laba rugi
- Export PDF menggunakan jsPDF
- Rekap transaksi

### AI Assistant
- Chatbot bantuan pengguna
- Insight bisnis otomatis

### Pengaturan Profil
- Update data profil
- Pengaturan akun

---

# 🛠️ Teknologi yang Digunakan

## Frontend
- React 19
- Vite
- React Router DOM
- Tailwind CSS
- Lucide React
- React Icons

## Data Visualization
- Chart.js
- React ChartJS 2

## PDF Export
- jsPDF
- jsPDF AutoTable

## Additional Library
- Firebase(belum terealisasikan)
- React Avatar Editor

---

# 📁 Struktur Folder

```bash
src/
│
├── assets/
│   └── images/
│
├── components/
│   ├── auth/
│   ├── dashboard/
│   └── landing/
│
├── data/
│   ├── dashboardData.js
│   ├── insightData.js
│   └── transactionData.js
│
├── pages/
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Keuangan.jsx
│   ├── Stok.jsx
│   ├── Supplier.jsx
│   ├── ProdukSupplier.jsx
│   ├── Laporan.jsx
│   ├── Settings.jsx
│   └── AIAssistant.jsx
│
├── styles/
│
├── utils/
│   └── exportLaporanPDF.js
│
├── api.js
├── App.jsx
└── main.jsx
```

---

# 🔗 Routing

| Route | Halaman |
|---------|---------|
| / | Landing Page |
| /login | Login |
| /register | Register |
| /dashboard | Dashboard |
| /keuangan | Keuangan |
| /stok | Stok |
| /supplier | Supplier |
| /supplier/:id/produk | Produk Supplier |
| /laporan | Laporan |
| /chatbot | AI Assistant |
| /settings | Pengaturan |

---

# ⚙️ Konfigurasi Environment

Buat file `.env` pada root project:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_API_KEY=your_api_key
```

---

# 🔌 Integrasi Backend

Frontend berkomunikasi dengan backend menggunakan REST API.

Contoh endpoint:

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profil

GET  /api/transactions
POST /api/transactions
PUT  /api/transactions/:id
DELETE /api/transactions/:id

GET /api/transactions/laba-rugi
GET /api/transactions/monthly

GET /api/products
GET /api/suppliers
```

Token autentikasi disimpan pada:

```javascript
localStorage.setItem("token", token);
```

dan dikirim menggunakan header:

```javascript
Authorization: Bearer <token>
```

---

# 💻 Instalasi

Clone repository:

```bash
git clone <repository-url>
```

Masuk ke folder project:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Jalankan project:

```bash
npm run dev
```

Build production:

```bash
npm run build
```

Preview hasil build:

```bash
npm run preview
```

---

# 📊 Arsitektur Sistem

```text
Frontend (React + Vite)
        │
        ▼
REST API
        │
        ▼
Backend (Node.js / Hapi.js)
        │
        ▼
MySQL Database
```

---

# 👥 Tim Pengembang

Capstone Project - MoneyTOr

- Frontend Developer
- Backend Developer
- UI/UX Designer
- Machine Learning Engineer

---

# 📄 Lisensi

Project ini dikembangkan untuk kebutuhan Capstone Project dan tujuan edukasi.