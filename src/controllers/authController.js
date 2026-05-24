const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { findByEmail, createSeller } = require('../models/sellerModel');
require('dotenv').config();

// REGISTER
const register = async (req, res) => {
  try {
    const { nama_usaha, jenis_usaha, lokasi_usaha,
            email, password, nama_pemilik } = req.body;

    if (!nama_usaha || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama usaha, email, dan password wajib diisi!'
      });
    }

    const existing = await findByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar!'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newId = await createSeller({
      nama_usaha, jenis_usaha, lokasi_usaha,
      email, password: hashedPassword, nama_pemilik
    });

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil!',
      data: { id_seller: newId, nama_usaha, email }
    });

  } catch (error) {
    console.error('Error register:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi!'
      });
    }

    const seller = await findByEmail(email);
    if (!seller) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah!'
      });
    }

    const isValid = await bcrypt.compare(password, seller.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah!'
      });
    }

    const token = jwt.sign(
      { id: seller.id_seller, email: seller.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      message: 'Login berhasil!',
      data: {
        token,
        seller: {
          id_seller:   seller.id_seller,
          nama_usaha:  seller.nama_usaha,
          nama_pemilik: seller.nama_pemilik,
          email:       seller.email
        }
      }
    });

  } catch (error) {
    console.error('Error login:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// GET PROFIL
const getProfil = async (req, res) => {
  try {
    const { findById } = require('../models/sellerModel');
    const seller = await findById(req.user.id);

    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller tidak ditemukan.' });
    }

    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    console.error('Error getProfil:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// UPDATE PROFIL
const updateProfil = async (req, res) => {
  try {
    const { updateSeller } = require('../models/sellerModel');
    const { nama_usaha, jenis_usaha, lokasi_usaha, nama_pemilik } = req.body;

    await updateSeller(req.user.id, { nama_usaha, jenis_usaha, lokasi_usaha, nama_pemilik });

    res.status(200).json({ success: true, message: 'Profil berhasil diupdate!' });
  } catch (error) {
    console.error('Error updateProfil:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { register, login, getProfil, updateProfil };