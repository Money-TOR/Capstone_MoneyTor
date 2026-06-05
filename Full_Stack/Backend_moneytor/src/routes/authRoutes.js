const express     = require('express');
const router      = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { register, login, getProfil, updateProfil } = require('../controllers/authController');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrasi seller baru
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nama_usaha, email, password]
 *             properties:
 *               nama_usaha:
 *                 type: string
 *                 example: "Kopi Harum UMKM"
 *               jenis_usaha:
 *                 type: string
 *                 example: "F&B"
 *               lokasi_usaha:
 *                 type: string
 *                 example: "Bandung, Jawa Barat"
 *               email:
 *                 type: string
 *                 example: "kopi.harum@example.com"
 *               password:
 *                 type: string
 *                 example: "rahasia123"
 *               nama_pemilik:
 *                 type: string
 *                 example: "Budi Santoso"
 *     responses:
 *       201:
 *         description: Registrasi berhasil
 *       400:
 *         description: Email sudah terdaftar atau field wajib tidak lengkap
 *       500:
 *         description: Terjadi kesalahan server
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login seller
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "kopi.harum@example.com"
 *               password:
 *                 type: string
 *                 example: "rahasia123"
 *     responses:
 *       200:
 *         description: Login berhasil, mengembalikan JWT token
 *       400:
 *         description: Email dan password wajib diisi
 *       401:
 *         description: Email atau password salah
 *       500:
 *         description: Terjadi kesalahan server
 */
router.post('/login',    login);

/**
 * @swagger
 * /api/auth/profil:
 *   get:
 *     summary: Mendapatkan profil seller yang login
 *     tags: [Auth]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profil berhasil diambil
 *       401:
 *         description: Akses ditolak, silakan login
 *       404:
 *         description: Seller tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan server
 */
router.get('/profil',    verifyToken, getProfil);    

/**
 * @swagger
 * /api/auth/profil:
 *   put:
 *     summary: Update profil seller yang login
 *     tags: [Auth]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama_usaha:
 *                 type: string
 *                 example: "Kopi Harum Bandung"
 *               jenis_usaha:
 *                 type: string
 *                 example: "F&B / Kafe"
 *               lokasi_usaha:
 *                 type: string
 *                 example: "Dago, Bandung"
 *               nama_pemilik:
 *                 type: string
 *                 example: "Budi Santoso"
 *     responses:
 *       200:
 *         description: Profil berhasil diperbarui
 *       401:
 *         description: Akses ditolak, silakan login
 *       500:
 *         description: Terjadi kesalahan server
 */
router.put('/profil',    verifyToken, updateProfil); 

module.exports = router;