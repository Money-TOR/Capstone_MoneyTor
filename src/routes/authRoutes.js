const express = require('express');
const router = express.Router();

// nanti diisi endpoint register & login di Minggu 2
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route OK' });
});

module.exports = router;