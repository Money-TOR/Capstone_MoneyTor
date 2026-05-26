const express     = require('express');
const router      = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
  getProducts, getProductById, getLowStock,
  addProduct, editProduct, removeProduct
} = require('../controllers/productController');

/**
 * @swagger
 * /api/products/low-stock:
 *   get:
 *     summary: Mendapatkan daftar produk yang memiliki stok rendah (stok <= minimum_stok)
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar produk stok rendah
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.get('/low-stock', verifyToken, getLowStock);    // WAJIB di atas /:id

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Mendapatkan semua produk milik seller yang login
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar produk
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.get('/',          verifyToken, getProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Mendapatkan 1 produk berdasarkan ID produk
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Produk
 *     responses:
 *       200:
 *         description: Produk ditemukan
 *       401:
 *         description: Akses ditolak
 *       404:
 *         description: Produk tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get('/:id',       verifyToken, getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Menambahkan produk baru ke dalam inventaris
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nama_produk]
 *             properties:
 *               id_supplier:
 *                 type: integer
 *                 example: 1
 *               nama_produk:
 *                 type: string
 *                 example: "Kopi Arabika Toraja 250g"
 *               kategori_produk:
 *                 type: string
 *                 example: "Minuman"
 *               harga_jual:
 *                 type: number
 *                 example: 85000.00
 *               harga_modal:
 *                 type: number
 *                 example: 50000.00
 *               stok_awal:
 *                 type: integer
 *                 example: 30
 *               minimum_stok:
 *                 type: integer
 *                 example: 5
 *               status_produk:
 *                 type: string
 *                 enum: [aktif, nonaktif]
 *                 example: "aktif"
 *     responses:
 *       201:
 *         description: Produk berhasil ditambahkan
 *       400:
 *         description: Nama produk wajib diisi
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.post('/',         verifyToken, addProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Memperbarui data produk
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Produk
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama_produk:
 *                 type: string
 *                 example: "Kopi Arabika Toraja Premium"
 *               kategori_produk:
 *                 type: string
 *                 example: "Minuman Premium"
 *               harga_jual:
 *                 type: number
 *                 example: 90000.00
 *               harga_modal:
 *                 type: number
 *                 example: 52000.00
 *               minimum_stok:
 *                 type: integer
 *                 example: 10
 *               status_produk:
 *                 type: string
 *                 enum: [aktif, nonaktif]
 *                 example: "aktif"
 *               id_supplier:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Produk berhasil diupdate
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.put('/:id',       verifyToken, editProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Menghapus produk
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Produk
 *     responses:
 *       200:
 *         description: Produk berhasil dihapus
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.delete('/:id',    verifyToken, removeProduct);

module.exports = router;