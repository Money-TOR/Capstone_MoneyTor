const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Silakan login terlebih dahulu.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // isi: { id: id_seller, email }
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Token tidak valid atau sudah kadaluarsa.'
    });
  }
};

module.exports = verifyToken;