const express     = require('express');
const router      = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { getDashboard } = require('../controllers/dashboardController');

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Data lengkap dashboard (keuangan + stok + tren)
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Data dashboard berhasil diambil
 */
router.get('/', verifyToken, getDashboard);

module.exports = router;
