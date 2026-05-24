const express     = require('express');
const router      = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
  getTransactions, getTransactionById, getLabaRugi,
  getMonthlyTrend, addTransaction, editTransaction, removeTransaction
} = require('../controllers/transactionController');

router.get('/laba-rugi',  verifyToken, getLabaRugi);        // ← HARUS paling atas!
router.get('/monthly',    verifyToken, getMonthlyTrend);    // ← HARUS sebelum /:id!
router.get('/',           verifyToken, getTransactions);
router.get('/:id',        verifyToken, getTransactionById);
router.post('/',          verifyToken, addTransaction);
router.put('/:id',        verifyToken, editTransaction);
router.delete('/:id',     verifyToken, removeTransaction);

module.exports = router;