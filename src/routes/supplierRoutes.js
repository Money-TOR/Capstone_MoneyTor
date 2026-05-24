const express     = require('express');
const router      = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
  getSuppliers, getSupplierById,
  addSupplier, editSupplier, removeSupplier
} = require('../controllers/supplierController');

router.get('/',       verifyToken, getSuppliers);
router.get('/:id',    verifyToken, getSupplierById);  
router.post('/',      verifyToken, addSupplier);
router.put('/:id',    verifyToken, editSupplier);
router.delete('/:id', verifyToken, removeSupplier);

module.exports = router;