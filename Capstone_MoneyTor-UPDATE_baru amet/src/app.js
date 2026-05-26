const express        = require('express');
const cors           = require('cors');
const validateApiKey = require('./middleware/apikeyMiddleware'); // ← TAMBAH
const swaggerUi      = require('swagger-ui-express'); // ← TAMBAH
const swaggerJsdoc   = require('swagger-jsdoc'); // ← TAMBAH
require('dotenv').config();

const db = require('./config/db');
db.query('SELECT 1')
  .then(() => console.log('✅ Database MySQL terkoneksi!'))
  .catch(err => console.error('❌ Koneksi database gagal:', err.message));

const authRoutes        = require('./routes/authRoutes');
const supplierRoutes    = require('./routes/supplierRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const productRoutes     = require('./routes/productRoutes');
const stockRoutes       = require('./routes/stockRoutes');
const aiRoutes          = require('./routes/aiRoutes');

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