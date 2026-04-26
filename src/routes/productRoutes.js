const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Product route OK' });
});

module.exports = router;
