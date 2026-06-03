const db = require('../config/db');
 
// Generate ID seller berikutnya: U001, U002, ...
const generateSellerId = async () => {
  const [rows] = await db.query(
    `SELECT id_seller FROM sellers
     WHERE id_seller REGEXP '^U[0-9]+$'
     ORDER BY CAST(SUBSTRING(id_seller, 2) AS UNSIGNED) DESC LIMIT 1`
  );
  if (!rows.length) return 'U001';
  const lastNum = parseInt(rows[0].id_seller.substring(1));
  return 'U' + String(lastNum + 1).padStart(3, '0');
};

const findByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM sellers WHERE email = ?', [email]);
  return rows[0];
};

const findById = async (id) => {
  const [rows] = await db.query(
    `SELECT id_seller, nama_usaha, jenis_usaha,
     lokasi_usaha, email, nama_pemilik, no_telepon, jabatan,
     tanggal_bergabung, created_at
     FROM sellers WHERE id_seller = ?`,
    [id]
  );
  return rows[0];
};

const createSeller = async (data) => {
  const { nama_usaha, jenis_usaha, lokasi_usaha,
          email, password, nama_pemilik, no_telepon } = data;
  const id_seller = await generateSellerId();
  await db.query(
    `INSERT INTO sellers
     (id_seller, nama_usaha, jenis_usaha, lokasi_usaha, email,
      password, nama_pemilik, no_telepon, tanggal_bergabung)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
    [id_seller, nama_usaha, jenis_usaha || 'Umum', lokasi_usaha || '-',
     email, password, nama_pemilik, no_telepon || null]
  );
  return id_seller;
};

const updateSeller = async (id, data) => {
  const { nama_usaha, jenis_usaha, lokasi_usaha, nama_pemilik, no_telepon, jabatan } = data;
  const [result] = await db.query(
    `UPDATE sellers SET
     nama_usaha = ?, jenis_usaha = ?,
     lokasi_usaha = ?, nama_pemilik = ?,
     no_telepon = ?, jabatan = ?
     WHERE id_seller = ?`,
    [nama_usaha, jenis_usaha, lokasi_usaha, nama_pemilik,
     no_telepon || null, jabatan || null, id]
  );
  return result.affectedRows;
};

module.exports = { findByEmail, findById, createSeller, updateSeller };
