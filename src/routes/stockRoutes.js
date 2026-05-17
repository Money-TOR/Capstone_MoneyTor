const express     = require('express');
const router      = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { getStockLogs, getStockByProduct, addStockLog } = require('../controllers/stockController');

router.get('/',                      verifyToken, getStockLogs);       // semua log stok
router.get('/produk/:id_produk',     verifyToken, getStockByProduct);  // log per produk
router.post('/',                     verifyToken, addStockLog);        // tambah log

module.exports = router;