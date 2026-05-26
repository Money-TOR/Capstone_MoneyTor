const express     = require('express');
const router      = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { getStockLogs, getStockByProduct, addStockLog } = require('../controllers/stockController');

/**
 * @swagger
 * /api/stock:
 *   get:
 *     summary: Mendapatkan semua riwayat log perubahan stok milik seller yang login
 *     tags: [Stock]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar log stok
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.get('/',                      verifyToken, getStockLogs);       // semua log stok

/**
 * @swagger
 * /api/stock/produk/{id_produk}:
 *   get:
 *     summary: Mendapatkan riwayat log perubahan stok untuk 1 produk tertentu
 *     tags: [Stock]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_produk
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Produk
 *     responses:
 *       200:
 *         description: Berhasil mengambil log stok produk
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.get('/produk/:id_produk',     verifyToken, getStockByProduct);  // log per produk

/**
 * @swagger
 * /api/stock:
 *   post:
 *     summary: Mencatatkan perubahan/pergerakan stok produk secara manual
 *     description: Mengatur pergerakan stok masuk, keluar, rusak, atau penyesuaian. Sistem otomatis meng-update kolom stok_awal pada tabel products.
 *     tags: [Stock]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_produk, jenis_perubahan, jumlah]
 *             properties:
 *               id_produk:
 *                 type: integer
 *                 example: 1
 *               tanggal:
 *                 type: string
 *                 format: date
 *                 example: "2026-05-26"
 *               jenis_perubahan:
 *                 type: string
 *                 enum: [masuk, keluar, rusak, penyesuaian]
 *                 example: "masuk"
 *               jumlah:
 *                 type: integer
 *                 example: 10
 *               alasan:
 *                 type: string
 *                 example: "Restok barang dari supplier"
 *     responses:
 *       201:
 *         description: Log pergerakan stok berhasil dicatatkan
 *       400:
 *         description: Parameter wajib kosong atau jumlah stok tidak cukup untuk dikurangi
 *       401:
 *         description: Akses ditolak
 *       404:
 *         description: Produk tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.post('/',                     verifyToken, addStockLog);        // tambah log

module.exports = router;