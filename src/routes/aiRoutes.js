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

    const sumData     = summary[0] || { total_pemasukan: 0, total_pengeluaran: 0, laba_rugi: 0, jumlah_transaksi: 0 };
    const insights    = [];
    const pemasukan   = sumData.total_pemasukan   || 0;
    const pengeluaran = sumData.total_pengeluaran || 0;
    const laba        = sumData.laba_rugi         || 0;

    if (laba > 0) {
      insights.push(`💡 Selamat! Laba bersih usaha Anda positif sebesar Rp ${Number(laba).toLocaleString('id-ID')}. Bisnis Anda dalam kondisi prima.`);
    } else if (laba < 0) {
      insights.push(`⚠️ Perhatian! Pengeluaran Anda melebihi pemasukan dengan selisih Rp ${Number(Math.abs(laba)).toLocaleString('id-ID')}. Periksa kembali pos pengeluaran.`);
    } else {
      insights.push(`💡 Mulailah mencatatkan transaksi penjualan dan pengeluaran Anda untuk mendapatkan analisa finansial yang mendalam.`);
    }

    if (pemasukan > 0) {
      const rasio = (pengeluaran / pemasukan) * 100;
      insights.push(`📊 Rasio pengeluaran terhadap pemasukan Anda adalah sebesar ${rasio.toFixed(1)}%.`);
      if (rasio > 70) {
        insights.push(`📉 Rasio pengeluaran cukup tinggi (>70%). Direkomendasikan untuk menekan biaya operasional atau bahan baku.`);
      } else {
        insights.push(`📈 Rasio pengeluaran terjaga dengan baik di bawah 70%. Pertahankan efisiensi ini.`);
      }
    }

    const [lowStock] = await db.query(
      `SELECT nama_produk FROM products WHERE id_seller = ? AND stok_awal <= minimum_stok AND status_produk = 'aktif'`,
      [req.user.id]
    );
    if (lowStock && lowStock.length > 0) {
      insights.push(`🛒 Ada ${lowStock.length} produk yang stoknya menipis (seperti: ${lowStock.slice(0, 2).map(p => p.nama_produk).join(', ')}). Segera lakukan restock agar penjualan tidak terhambat!`);
    } else {
      insights.push(`✅ Stok barang aman! Semua produk aktif memiliki persediaan di atas batas minimum.`);
    }

    res.status(200).json({
      success: true,
      data: { summary: sumData, monthly_trend: monthly, insights }
    });
  } catch (error) {
    console.error('Error financial-summary:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

/**
 * @swagger
 * /api/ai/low-stock:
 *   get:
 *     summary: Mendapatkan rekomendasi penambahan stok produk yang kritis
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
 *     summary: Mendapatkan seluruh log pergerakan stok
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
 *     summary: Mendapatkan daftar 10 produk terlaris
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
 *     summary: Mendapatkan statistik penggunaan metode pembayaran
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
 *     summary: Mendapatkan rincian profit margin per produk aktif
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
 *     summary: Chatbot Financial Assistant (Justin GenAI)
 *     description: Forward pesan ke Justin AI Chatbot yang sudah deploy di Railway (AI_SERVICE_URL).
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
 *                 example: "Bagaimana kondisi keuangan toko saya?"
 *     responses:
 *       200:
 *         description: Respon chatbot berhasil
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

    // Pakai AI_SERVICE_URL sesuai .env kamu
    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/chat`,
      { message: pesan },
      { timeout: 15000 }
    );

    return res.status(200).json({
      success: true,
      data: { jawaban: response.data.response }
    });

  } catch (error) {
    console.error('Chatbot error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Layanan chatbot tidak tersedia: ' + error.message
    });
  }
});

/**
 * @swagger
 * /api/ai/rekomendasi-produk/{id_produk}:
 *   get:
 *     summary: Rekomendasi produk serupa (Justin AI)
 *     description: Memanggil Justin AI untuk rekomendasi produk (RECOMMENDATION_SERVICE_URL).
 *     tags: [AI & Analytics]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_produk
 *         required: true
 *         schema:
 *           type: string
 *         example: "P001"
 *       - in: query
 *         name: top_n
 *         required: false
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Berhasil mengambil rekomendasi produk
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.get('/rekomendasi-produk/:id_produk', verifyToken, async (req, res) => {
  try {
    const { id_produk } = req.params;
    const topN = req.query.top_n || 5;

    // Pakai RECOMMENDATION_SERVICE_URL sesuai .env kamu
    const response = await axios.get(
      `${process.env.RECOMMENDATION_SERVICE_URL}/recommend/${id_produk}?top_n=${topN}`,
      { timeout: 10000 }
    );

    return res.status(200).json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Rekomendasi error:', error.message);

    // Fallback ke DB lokal kalau Justin AI down
    try {
      const [fallback] = await db.query(
        `SELECT nama_produk, kategori_produk, harga_jual
         FROM products
         WHERE id_seller = ? AND status_produk = 'aktif'
         ORDER BY stok_awal DESC
         LIMIT 5`,
        [req.user.id]
      );
      return res.status(200).json({
        success: true,
        source: 'fallback_local',
        message: 'Service rekomendasi AI sedang tidak tersedia. Menampilkan produk dari data lokal.',
        data: fallback
      });
    } catch (dbError) {
      return res.status(500).json({
        success: false,
        message: 'Layanan rekomendasi produk tidak tersedia.'
      });
    }
  }
});

/**
 * @swagger
 * /api/ai/prediksi-restock:
 *   post:
 *     summary: Prediksi kebutuhan restock per kategori (Migel AI)
 *     description: Memanggil Migel AI untuk prediksi demand mingguan (PREDICTION_SERVICE_URL). Kategori tersedia - Minuman, Sembako, Snack, Frozen Food, Makanan, Bakery, Laundry, Fashion.
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
 *             required: [category, current_stock]
 *             properties:
 *               category:
 *                 type: string
 *                 example: "Makanan"
 *               current_stock:
 *                 type: number
 *                 example: 50
 *               minimum_stok:
 *                 type: number
 *                 example: 10
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan prediksi restock
 *       400:
 *         description: Parameter tidak lengkap
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.post('/prediksi-restock', verifyToken, async (req, res) => {
  try {
    const { category, current_stock, minimum_stok } = req.body;

    if (!category || current_stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Field category dan current_stock wajib diisi!'
      });
    }

    // Pakai PREDICTION_SERVICE_URL sesuai .env kamu
    const response = await axios.post(
      `${process.env.PREDICTION_SERVICE_URL}/predict`,
      {
        seller_id    : req.body.seller_id || req.user.id,
        category     : category,
        current_stock: Number(current_stock),
        minimum_stok : Number(minimum_stok) || 10
      },
      { timeout: 15000 }
    );

    return res.status(200).json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Prediksi restock error:', error.message);

    if (error.response && error.response.status === 404) {
      return res.status(200).json({
        success: false,
        message: `Model prediksi untuk kategori "${req.body.category}" belum tersedia di dataset Migel.`,
        data: null
      });
    }

    res.status(500).json({
      success: false,
      message: 'Layanan prediksi restock tidak tersedia: ' + error.message
    });
  }
});

module.exports = router;