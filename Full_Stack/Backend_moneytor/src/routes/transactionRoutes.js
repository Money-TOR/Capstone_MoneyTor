const express     = require('express');
const router      = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
  getTransactions, getTransactionById, getLabaRugi,
  getMonthlyTrend, addTransaction, editTransaction, removeTransaction
} = require('../controllers/transactionController');

/**
 * @swagger
 * /api/transactions/laba-rugi:
 *   get:
 *     summary: Mendapatkan ringkasan laba rugi (total pemasukan, total pengeluaran, laba bersih)
 *     tags: [Transactions]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil ringkasan laba rugi
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.get('/laba-rugi',  verifyToken, getLabaRugi);        // ← HARUS paling atas!

/**
 * @swagger
 * /api/transactions/monthly:
 *   get:
 *     summary: Mendapatkan tren keuangan bulanan (pemasukan vs pengeluaran per bulan)
 *     tags: [Transactions]
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
router.get('/monthly',    verifyToken, getMonthlyTrend);    // ← HARUS sebelum /:id!

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Mendapatkan daftar semua transaksi milik seller yang login
 *     tags: [Transactions]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar transaksi
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.get('/',           verifyToken, getTransactions);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Mendapatkan data 1 transaksi berdasarkan ID
 *     tags: [Transactions]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Transaksi
 *     responses:
 *       200:
 *         description: Transaksi ditemukan
 *       401:
 *         description: Akses ditolak
 *       404:
 *         description: Transaksi tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get('/:id',        verifyToken, getTransactionById);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Menambahkan transaksi baru (Pemasukan / Pengeluaran)
 *     description: Apabila jenis transaksi adalah "pemasukan" dan menyertakan "id_produk", maka sistem secara otomatis akan mengurangi stok produk tersebut dan mencatatkan log pergerakan stok.
 *     tags: [Transactions]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tanggal, jenis_transaksi, total_harga]
 *             properties:
 *               id_produk:
 *                 type: integer
 *                 description: ID produk (opsional, untuk penjualan otomatis kurangi stok)
 *                 example: 1
 *               tanggal:
 *                 type: string
 *                 format: date
 *                 example: "2026-05-26"
 *               jam_transaksi:
 *                 type: string
 *                 example: "11:30:00"
 *               jenis_transaksi:
 *                 type: string
 *                 enum: [pemasukan, pengeluaran]
 *                 example: "pemasukan"
 *               kategori:
 *                 type: string
 *                 example: "Penjualan Kopi"
 *               qty:
 *                 type: integer
 *                 example: 2
 *               harga_satuan:
 *                 type: number
 *                 example: 85000.00
 *               total_harga:
 *                 type: number
 *                 example: 170000.00
 *               metode_pembayaran:
 *                 type: string
 *                 example: "cash"
 *               event:
 *                 type: string
 *                 example: "Bazar Akhir Pekan"
 *               diskon:
 *                 type: number
 *                 example: 0
 *               status_transaksi:
 *                 type: string
 *                 example: "selesai"
 *     responses:
 *       201:
 *         description: Transaksi berhasil ditambahkan
 *       400:
 *         description: Validasi gagal atau stok barang tidak cukup
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.post('/',          verifyToken, addTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Memperbarui data transaksi
 *     tags: [Transactions]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Transaksi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tanggal:
 *                 type: string
 *                 format: date
 *                 example: "2026-05-26"
 *               jam_transaksi:
 *                 type: string
 *                 example: "11:30:00"
 *               jenis_transaksi:
 *                 type: string
 *                 enum: [pemasukan, pengeluaran]
 *                 example: "pemasukan"
 *               kategori:
 *                 type: string
 *                 example: "Penjualan Kopi Premium"
 *               qty:
 *                 type: integer
 *                 example: 2
 *               harga_satuan:
 *                 type: number
 *                 example: 90000.00
 *               total_harga:
 *                 type: number
 *                 example: 180000.00
 *               metode_pembayaran:
 *                 type: string
 *                 example: "transfer"
 *               event:
 *                 type: string
 *                 example: "Bazar Akhir Pekan"
 *               diskon:
 *                 type: number
 *                 example: 0
 *               status_transaksi:
 *                 type: string
 *                 example: "selesai"
 *     responses:
 *       200:
 *         description: Transaksi berhasil diupdate
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.put('/:id',        verifyToken, editTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Menghapus data transaksi
 *     tags: [Transactions]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Transaksi
 *     responses:
 *       200:
 *         description: Transaksi berhasil dihapus
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.delete('/:id',     verifyToken, removeTransaction);

module.exports = router;