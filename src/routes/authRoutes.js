const express     = require('express');
const router      = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { register, login, getProfil, updateProfil } = require('../controllers/authController');

router.post('/register', register);
router.post('/login',    login);
router.get('/profil',    verifyToken, getProfil);    // ← BARU
router.put('/profil',    verifyToken, updateProfil); // ← BARU

module.exports = router;