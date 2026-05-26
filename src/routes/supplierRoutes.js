const express     = require('express');
const router      = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
  getSuppliers, getSupplierById,
  addSupplier, editSupplier, removeSupplier
} = require('../controllers/supplierController');

/**
 * @swagger
 * /api/suppliers:
 *   get:
 *     summary: Mendapatkan semua pemasok (suppliers)
 *     tags: [Suppliers]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar suppliers
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.get('/',       verifyToken, getSuppliers);

/**
 * @swagger
 * /api/suppliers/{id}:
 *   get:
 *     summary: Mendapatkan data 1 supplier berdasarkan ID
 *     tags: [Suppliers]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Supplier
 *     responses:
 *       200:
 *         description: Supplier ditemukan
 *       401:
 *         description: Akses ditolak
 *       404:
 *         description: Supplier tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get('/:id',    verifyToken, getSupplierById);  

/**
 * @swagger
 * /api/suppliers:
 *   post:
 *     summary: Menambahkan supplier baru
 *     tags: [Suppliers]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nama_supplier]
 *             properties:
 *               nama_supplier:
 *                 type: string
 *                 example: "PT Maju Bersama Logistik"
 *               kategori_supplier:
 *                 type: string
 *                 example: "Bahan Baku Biji Kopi"
 *               lokasi:
 *                 type: string
 *                 example: "Jakarta Barat"
 *     responses:
 *       201:
 *         description: Supplier berhasil ditambahkan
 *       400:
 *         description: Nama supplier wajib diisi
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.post('/',      verifyToken, addSupplier);

/**
 * @swagger
 * /api/suppliers/{id}:
 *   put:
 *     summary: Memperbarui data supplier
 *     tags: [Suppliers]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Supplier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nama_supplier]
 *             properties:
 *               nama_supplier:
 *                 type: string
 *                 example: "PT Maju Bersama Logistik Utama"
 *               kategori_supplier:
 *                 type: string
 *                 example: "Bahan Baku & Kemasan"
 *               lokasi:
 *                 type: string
 *                 example: "Tangerang, Banten"
 *     responses:
 *       200:
 *         description: Supplier berhasil diupdate
 *       400:
 *         description: Nama supplier wajib diisi
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.put('/:id',    verifyToken, editSupplier);

/**
 * @swagger
 * /api/suppliers/{id}:
 *   delete:
 *     summary: Menghapus data supplier
 *     tags: [Suppliers]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Supplier
 *     responses:
 *       200:
 *         description: Supplier berhasil dihapus
 *       401:
 *         description: Akses ditolak
 *       500:
 *         description: Kesalahan server
 */
router.delete('/:id', verifyToken, removeSupplier);

module.exports = router;