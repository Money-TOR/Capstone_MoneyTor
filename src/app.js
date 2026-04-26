const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const authRoutes        = require('./routes/authRoutes');
const businessRoutes    = require('./routes/businessRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const productRoutes     = require('./routes/productRoutes');
const stockRoutes       = require('./routes/stockRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',         authRoutes);
app.use('/api/business',     businessRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/products',     productRoutes);
app.use('/api/stock',        stockRoutes);

app.get('/', (req, res) => {
  res.json({ message: '✅ MoneyTOR API berjalan!', version: '1.0.0' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server MoneyTOR jalan di http://localhost:${PORT}`);
});