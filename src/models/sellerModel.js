const db = require('../config/db');

// Cari seller berdasarkan email (untuk login)
const findByEmail = async (email) => {
  const [rows] = await db.query(
    'SELECT * FROM sellers WHERE email = ?',
    [email]
  );
  return rows[0];
};

// Cari seller berdasarkan id (untuk verifikasi token)
const findById = async (id) => {
  const [rows] = await db.query(
    `SELECT id_seller, nama_usaha, jenis_usaha, 
     lokasi_usaha, email, nama_pemilik, tanggal_bergabung 
     FROM sellers WHERE id_seller = ?`,
    [id]
  );
  return rows[0];
};

// Buat seller baru (register)
const createSeller = async (data) => {
  const { nama_usaha, jenis_usaha, lokasi_usaha,
          email, password, nama_pemilik } = data;
  const [result] = await db.query(
    `INSERT INTO sellers 
     (nama_usaha, jenis_usaha, lokasi_usaha, email, password, nama_pemilik, tanggal_bergabung)
     VALUES (?, ?, ?, ?, ?, ?, CURDATE())`,
    [nama_usaha, jenis_usaha, lokasi_usaha, email, password, nama_pemilik]
  );
  return result.insertId;
};

// Update profil seller
const updateSeller = async (id, data) => {
  const { nama_usaha, jenis_usaha, lokasi_usaha, nama_pemilik } = data;
  const [result] = await db.query(
    `UPDATE sellers SET 
     nama_usaha = ?, jenis_usaha = ?, 
     lokasi_usaha = ?, nama_pemilik = ?
     WHERE id_seller = ?`,
    [nama_usaha, jenis_usaha, lokasi_usaha, nama_pemilik, id]
  );
  return result.affectedRows;
};

module.exports = { findByEmail, findById, createSeller, updateSeller };