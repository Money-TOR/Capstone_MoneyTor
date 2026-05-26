const express     = require('express');
const router      = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { register, login, getProfil, updateProfil } = require('../controllers/authController');
const admin = require('../config/firebase'); 

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
/**
 * @swagger
 * /api/auth/google-login:
 *   post:
 *     summary: Login pakai akun Google via Firebase
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firebase_token]
 *             properties:
 *               firebase_token:
 *                 type: string
 *                 example: "token_panjang_dari_firebase"
 *     responses:
 *       200:
 *         description: Login Google berhasil, dapat JWT
 *       400:
 *         description: Token tidak dikirim
 *       401:
 *         description: Token tidak valid
 */
router.post('/google-login', async (req, res) => {
  try {
    const { firebase_token } = req.body;

    if (!firebase_token) {
      return res.status(400).json({
        success: false,
        message: 'Firebase token wajib dikirim!'
      });
    }

    // Verifikasi token ke server Firebase
    const decoded      = await admin.auth().verifyIdToken(firebase_token);
    const { email, name } = decoded;

    const db      = require('../config/db');
    const bcrypt  = require('bcryptjs');
    const jwt     = require('jsonwebtoken');

    // Cek apakah email sudah ada di database
    const [existing] = await db.query(
      'SELECT * FROM sellers WHERE email = ?',
      [email]
    );

    let seller;

    if (existing.length === 0) {
      // Belum ada → buat akun baru otomatis pakai data dari Google
      const randomPass = await bcrypt.hash(
        Math.random().toString(36), 10
      );
      const [result] = await db.query(
        `INSERT INTO sellers
         (nama_usaha, email, password, nama_pemilik, tanggal_bergabung)
         VALUES (?, ?, ?, ?, CURDATE())`,
        ['Usaha Baru', email, randomPass, name || 'Pemilik']
      );
      const [newSeller] = await db.query(
        'SELECT * FROM sellers WHERE id_seller = ?',
        [result.insertId]
      );
      seller = newSeller[0];
    } else {
      // Sudah ada → langsung pakai data yang ada
      seller = existing[0];
    }

    // Buat JWT seperti login biasa
    const token = jwt.sign(
      { id: seller.id_seller, email: seller.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login Google berhasil!',
      data: {
        token,
        seller: {
          id_seller:    seller.id_seller,
          nama_usaha:   seller.nama_usaha,
          email:        seller.email,
          nama_pemilik: seller.nama_pemilik
        }
      }
    });

  } catch (error) {
    console.error('Google login error:', error.code, error.message);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'Token Firebase sudah expired, minta login ulang.'
      });
    }

    res.status(401).json({
      success: false,
      message: 'Token Firebase tidak valid.'
    });
  }
});
module.exports = router;