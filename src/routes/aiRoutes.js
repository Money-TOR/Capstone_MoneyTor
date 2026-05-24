const express     = require('express');
const router      = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const db          = require('../config/db');

// Financial Summary untuk AI
router.get('/financial-summary', verifyToken, async (req, res) => {
  try {
    const [summary] = await db.query(
      `SELECT 
         SUM(CASE WHEN jenis_transaksi='pemasukan'  THEN total_harga ELSE 0 END) AS total_pemasukan,
         SUM(CASE WHEN jenis_transaksi='pengeluaran' THEN total_harga ELSE 0 END) AS total_pengeluaran,
         SUM(CASE WHEN jenis_transaksi='pemasukan'  THEN total_harga ELSE -total_harga END) AS laba_rugi,
         COUNT(*) AS jumlah_transaksi
       FROM transactions WHERE id_seller = ? AND status_transaksi = 'selesai'`,
      [req.user.id]
    );

    const [monthly] = await db.query(
      `SELECT DATE_FORMAT(tanggal,'%Y-%m') AS bulan,
              SUM(CASE WHEN jenis_transaksi='pemasukan'  THEN total_harga ELSE 0 END) AS pemasukan,
              SUM(CASE WHEN jenis_transaksi='pengeluaran' THEN total_harga ELSE 0 END) AS pengeluaran
       FROM transactions WHERE id_seller = ? AND status_transaksi = 'selesai'
       GROUP BY bulan ORDER BY bulan DESC LIMIT 6`,
      [req.user.id]
    );

    res.status(200).json({ success: true, data: { summary: summary[0], monthly_trend: monthly } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// Low Stock Warning untuk AI
router.get('/low-stock', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT nama_produk, stok, minimum_stok, 
              (minimum_stok - stok) AS kekurangan
       FROM products 
       WHERE id_seller = ? AND stok <= minimum_stok AND status_produk = 'aktif'
       ORDER BY kekurangan DESC`,
      [req.user.id]
    );
    res.status(200).json({ success: true, jumlah_produk_kritis: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// Monthly Trend untuk Data Science
router.get('/monthly-trend', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DATE_FORMAT(tanggal,'%Y-%m') AS bulan,
              SUM(CASE WHEN jenis_transaksi='pemasukan'  THEN total_harga ELSE 0 END) AS pemasukan,
              SUM(CASE WHEN jenis_transaksi='pengeluaran' THEN total_harga ELSE 0 END) AS pengeluaran,
              SUM(CASE WHEN jenis_transaksi='pemasukan'  THEN total_harga ELSE -total_harga END) AS laba_rugi,
              COUNT(*) AS jumlah_transaksi
       FROM transactions WHERE id_seller = ? AND status_transaksi = 'selesai'
       GROUP BY bulan ORDER BY bulan DESC`,
      [req.user.id]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// Stock Logs untuk Data Science
router.get('/stock-logs', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT l.*, p.nama_produk, p.kategori_produk
       FROM logs l
       JOIN products p ON l.id_produk = p.id_produk
       WHERE l.id_seller = ?
       ORDER BY l.tanggal_log DESC`,
      [req.user.id]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;