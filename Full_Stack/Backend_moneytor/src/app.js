const express        = require('express');
const cors           = require('cors');
const validateApiKey = require('./middleware/apikeyMiddleware'); // ← TAMBAH
const swaggerUi      = require('swagger-ui-express'); // ← TAMBAH
const swaggerJsdoc   = require('swagger-jsdoc'); // ← TAMBAH
require('dotenv').config();

const db = require('./config/db');
db.query('SELECT 1')
  .then(async () => {
    console.log('✅ Database MySQL terkoneksi!');
    console.log('🔄 Menjalankan pemeriksaan & perbaikan otomatis constraint database MoneyTor...');
    try {
      // 1. Sellers constraints
      await db.query(`
        ALTER TABLE sellers
        MODIFY COLUMN jenis_usaha VARCHAR(100) NULL,
        MODIFY COLUMN lokasi_usaha VARCHAR(200) NULL,
        MODIFY COLUMN nama_pemilik VARCHAR(100) NULL
      `);
      // 2. Products constraints
      await db.query(`
        ALTER TABLE products
        MODIFY COLUMN kategori_produk VARCHAR(100) NULL,
        MODIFY COLUMN harga_jual DECIMAL(15,2) DEFAULT 0 NULL,
        MODIFY COLUMN harga_modal DECIMAL(15,2) DEFAULT 0 NULL,
        MODIFY COLUMN stok_awal INT DEFAULT 0 NULL,
        MODIFY COLUMN minimum_stok INT DEFAULT 0 NULL,
        MODIFY COLUMN status_produk ENUM('aktif','nonaktif','stok_menipis') DEFAULT 'aktif' NULL
      `);
      // 3. Transactions constraints (id_produk sudah VARCHAR(50), tidak perlu MODIFY tipe)
      await db.query(`
        ALTER TABLE transactions
        MODIFY COLUMN jam_transaksi TIME DEFAULT '00:00:00' NULL,
        MODIFY COLUMN kategori VARCHAR(100) NULL,
        MODIFY COLUMN qty INT DEFAULT 1 NULL,
        MODIFY COLUMN harga_satuan DECIMAL(15,2) DEFAULT 0 NULL,
        MODIFY COLUMN total_harga DECIMAL(15,2) DEFAULT 0 NULL,
        MODIFY COLUMN metode_pembayaran VARCHAR(50) DEFAULT 'cash' NULL,
        MODIFY COLUMN event VARCHAR(100) NULL,
        MODIFY COLUMN diskon VARCHAR(50) DEFAULT '0' NULL,
        MODIFY COLUMN status_transaksi VARCHAR(50) DEFAULT 'selesai' NULL
      `);
      // 4. Logs constraints
      await db.query(`
        ALTER TABLE logs
        MODIFY COLUMN alasan TEXT NULL
      `);
      // 5. Sellers: tambah kolom baru jika belum ada
      try {
        await db.query(`ALTER TABLE sellers ADD COLUMN no_telepon VARCHAR(20) NULL`);
      } catch (e) { /* kolom sudah ada, skip */ }
      try {
        await db.query(`ALTER TABLE sellers ADD COLUMN jabatan VARCHAR(100) NULL`);
      } catch (e) { /* kolom sudah ada, skip */ }
      console.log('✅ Pemeriksaan & perbaikan database selesai! Semua constraint telah dioptimalkan agar data FE mengalir lancar.');
    } catch (dbErr) {
      console.warn('⚠️ Gagal melakukan ALTER otomatis database (mungkin database kosong atau tabel belum dibuat):', dbErr.message);
    }
  })
  .catch(err => console.error('❌ Koneksi database gagal:', err.message));

const authRoutes        = require('./routes/authRoutes');
const supplierRoutes    = require('./routes/supplierRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const productRoutes     = require('./routes/productRoutes');
const stockRoutes       = require('./routes/stockRoutes');
const aiRoutes          = require('./routes/aiRoutes');
const dashboardRoutes   = require('./routes/dashboardRoutes');

const app = express();

// Konfigurasi Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'MoneyTOR API Documentation',
      version: '2.0.0',
      description: 'Dokumentasi API interaktif untuk aplikasi POS & Keuangan UMKM MoneyTOR',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API Key untuk memproteksi API. Wajib dikirimkan di header.',
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Token untuk verifikasi sesi login seller. Format: Bearer <JWT_TOKEN>',
        },
      },
    },
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use(cors());
app.use(express.json());

// Sajikan Swagger UI di /api-docs (sebelum middleware validateApiKey agar bebas diakses)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api', validateApiKey);
app.use('/api/auth',         authRoutes);
app.use('/api/suppliers',    supplierRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/products',     productRoutes);
app.use('/api/stock',        stockRoutes);
app.use('/api/ai',           aiRoutes);
app.use('/api/dashboard',    dashboardRoutes);

app.get('/', (req, res) => {
  res.json({ message: '✅ MoneyTOR API berjalan!', version: '2.0.0' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server MoneyTOR jalan di http://localhost:${PORT}`);
});