const express     = require('express');
const router      = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const db          = require('../config/db');
const axios       = require('axios');

/**
 * @swagger
 * /api/ai/financial-summary:
 *   get:
 *     summary: Mendapatkan ringkasan keuangan dan tren keuangan seller yang login
 *     tags: [AI & Analytics]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil ringkasan keuangan
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.get('/financial-summary', verifyToken, async (req, res) => {
  try {
    const [summary] = await db.query(
      `SELECT
         COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pemasukan'
             THEN total_harga ELSE 0 END), 0)            AS total_pemasukan,
         COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pengeluaran'
             THEN total_harga ELSE 0 END), 0)            AS total_pengeluaran,
         COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pemasukan'
             THEN total_harga ELSE -total_harga END), 0) AS laba_rugi,
         COUNT(*)                                    AS jumlah_transaksi
       FROM transactions
       WHERE id_seller = ?
         AND LOWER(status_transaksi) IN ('selesai','berhasil')`,
      [req.user.id]
    );
    const [monthly] = await db.query(
      `SELECT DATE_FORMAT(tanggal,'%Y-%m') AS bulan,
              COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pemasukan'
                  THEN total_harga ELSE 0 END), 0) AS pemasukan,
              COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pengeluaran'
                  THEN total_harga ELSE 0 END), 0) AS pengeluaran
       FROM transactions
       WHERE id_seller = ?
         AND LOWER(status_transaksi) IN ('selesai','berhasil')
       GROUP BY bulan ORDER BY bulan DESC LIMIT 6`,
      [req.user.id]
    );
    res.status(200).json({
      success: true,
      data: { summary: summary[0], monthly_trend: monthly }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

/**
 * @swagger
 * /api/ai/low-stock:
 *   get:
 *     summary: Mendapatkan rekomendasi penambahan stok produk yang kritis (stok <= minimum_stok) beserta kalkulasi kekurangannya
 *     tags: [AI & Analytics]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil rekomendasi produk kritis
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.get('/low-stock', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT nama_produk, stok_awal, minimum_stok,
              (minimum_stok - stok_awal) AS kekurangan
       FROM products
       WHERE id_seller = ?
         AND stok_awal <= minimum_stok
         AND status_produk = 'aktif'
       ORDER BY kekurangan DESC`,
      [req.user.id]
    );
    res.status(200).json({
      success: true,
      jumlah_produk_kritis: rows.length,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});


/**
 * @swagger
 * /api/ai/monthly-trend:
 *   get:
 *     summary: Mendapatkan analisis tren penjualan dan laba rugi bulanan
 *     tags: [AI & Analytics]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil tren keuangan bulanan
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.get('/monthly-trend', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DATE_FORMAT(tanggal,'%Y-%m') AS bulan,
              COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pemasukan'
                  THEN total_harga ELSE 0 END), 0)            AS pemasukan,
              COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pengeluaran'
                  THEN total_harga ELSE 0 END), 0)            AS pengeluaran,
              COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pemasukan'
                  THEN total_harga ELSE -total_harga END), 0) AS laba_rugi,
              COUNT(*)                                    AS jumlah_transaksi
       FROM transactions
       WHERE id_seller = ?
         AND LOWER(status_transaksi) IN ('selesai','berhasil')
       GROUP BY bulan ORDER BY bulan DESC`,
      [req.user.id]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

/**
 * @swagger
 * /api/ai/stock-logs:
 *   get:
 *     summary: Mendapatkan seluruh log pergerakan stok lengkap dengan informasi produk
 *     tags: [AI & Analytics]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil seluruh log pergerakan stok
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.get('/stock-logs', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT l.*, p.nama_produk, p.kategori_produk
       FROM logs l
       JOIN products p ON l.id_produk = p.id_produk
       WHERE l.id_seller = ?
       ORDER BY l.tanggal DESC`,
      [req.user.id]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

/**
 * @swagger
 * /api/ai/produk-terlaris:
 *   get:
 *     summary: Mendapatkan daftar 10 produk terlaris milik seller berdasarkan total qty terjual
 *     tags: [AI & Analytics]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar produk terlaris
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.get('/produk-terlaris', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         p.nama_produk,
         p.kategori_produk,
         SUM(t.qty)            AS total_terjual,
         SUM(t.total_harga)    AS total_pendapatan,
         COUNT(t.id_transaksi) AS jumlah_transaksi
       FROM transactions t
       JOIN products p ON t.id_produk = p.id_produk
       WHERE t.id_seller = ?
         AND LOWER(t.jenis_transaksi) = 'pemasukan'
         AND LOWER(t.status_transaksi) IN ('selesai','berhasil')
       GROUP BY p.id_produk, p.nama_produk, p.kategori_produk
       ORDER BY total_terjual DESC
       LIMIT 10`,
      [req.user.id]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

/**
 * @swagger
 * /api/ai/metode-pembayaran:
 *   get:
 *     summary: Mendapatkan statistik penggunaan metode pembayaran beserta total nilainya
 *     tags: [AI & Analytics]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil statistik metode pembayaran
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.get('/metode-pembayaran', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         metode_pembayaran,
         COUNT(*)         AS jumlah_transaksi,
         SUM(total_harga) AS total_nilai
       FROM transactions
       WHERE id_seller = ?
         AND LOWER(status_transaksi) IN ('selesai','berhasil')
       GROUP BY metode_pembayaran
       ORDER BY jumlah_transaksi DESC`,
      [req.user.id]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

/**
 * @swagger
 * /api/ai/profit-margin:
 *   get:
 *     summary: Mendapatkan rincian profit margin per produk aktif beserta total akumulasi keuntungan
 *     tags: [AI & Analytics]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil rincian profit margin
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.get('/profit-margin', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         p.nama_produk,
         p.kategori_produk,
         p.harga_jual,
         p.harga_modal,
         (p.harga_jual - p.harga_modal) AS profit_per_unit,
         ROUND(
           ((p.harga_jual - p.harga_modal) / p.harga_jual * 100), 2
         ) AS margin_persen,
         COALESCE(SUM(t.qty), 0)                               AS total_terjual,
         COALESCE(SUM(t.qty) * (p.harga_jual - p.harga_modal), 0) AS total_profit
       FROM products p
       LEFT JOIN transactions t
         ON p.id_produk = t.id_produk
         AND LOWER(t.jenis_transaksi) = 'pemasukan'
         AND LOWER(t.status_transaksi) IN ('selesai','berhasil')
       WHERE p.id_seller = ? AND p.status_produk = 'aktif'
       GROUP BY p.id_produk, p.nama_produk, p.kategori_produk,
                p.harga_jual, p.harga_modal
       ORDER BY total_profit DESC`,
      [req.user.id]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Mengirimkan pesan obrolan ke Chatbot AI Asisten Keuangan
 *     description: Mengirim pesan ke chatbot keuangan. Jika service AI Python terhubung, request akan diteruskan ke Python ML service. Jika tidak, respons cadangan ramah akan diberikan.
 *     tags: [AI & Analytics]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pesan]
 *             properties:
 *               pesan:
 *                 type: string
 *                 example: "Berapa keuntungan bersih toko saya bulan ini?"
 *     responses:
 *       200:
 *         description: Respon dari chatbot berhasil didapatkan
 *       400:
 *         description: Pesan wajib diisi
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.post('/chat', verifyToken, async (req, res) => {
  try {
    const { pesan } = req.body;

    if (!pesan) {
      return res.status(400).json({
        success: false,
        message: 'Pesan wajib diisi!'
      });
    }

    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || null;

    if (AI_SERVICE_URL) {
      // Kalau service Python tim AI sudah ada → teruskan ke sana
      const response = await axios.post(`${AI_SERVICE_URL}/chat`, {
        pesan,
        id_seller: req.user.id
      });
      return res.status(200).json({ success: true, data: response.data });
    }

    // Kalau service Python belum ada → response sementara
    res.status(200).json({
      success: true,
      data: {
        jawaban: 'Fitur chatbot sedang dalam pengembangan oleh tim AI Engineer.'
      }
    });

  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(200).json({
      success: true,
      data: { jawaban: 'Maaf, layanan chatbot sedang tidak tersedia.' }
    });
  }
});

module.exports = router;