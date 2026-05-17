const express     = require('express');
const router      = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
  getProducts, getProductById, getLowStock,
  addProduct, editProduct, removeProduct
} = require('../controllers/productController');

router.get('/low-stock', verifyToken, getLowStock);    // WAJIB di atas /:id
router.get('/',          verifyToken, getProducts);
router.get('/:id',       verifyToken, getProductById);
router.post('/',         verifyToken, addProduct);
router.put('/:id',       verifyToken, editProduct);
router.delete('/:id',    verifyToken, removeProduct);

module.exports = router;