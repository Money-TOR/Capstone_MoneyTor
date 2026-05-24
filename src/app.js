const express        = require('express');
const cors           = require('cors');
const validateApiKey = require('./middleware/apikeyMiddleware'); // ← TAMBAH
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

app.use(cors());
app.use(express.json());
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