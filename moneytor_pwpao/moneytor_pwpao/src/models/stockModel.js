const db = require('../config/db');

// Generate ID log berikutnya: L000001, L000002, ...
const generateLogId = async () => {
  const [rows] = await db.query(
    `SELECT id_log FROM logs
     WHERE id_log REGEXP '^L[0-9]+$'
     ORDER BY CAST(SUBSTRING(id_log, 2) AS UNSIGNED) DESC LIMIT 1`
  );
  if (!rows.length) return 'L000001';
  const lastNum = parseInt(rows[0].id_log.substring(1));
  return 'L' + String(lastNum + 1).padStart(6, '0');
};

// Ambil riwayat log berdasarkan produk
const findByProduct = async (id_produk) => {
  const [rows] = await db.query(
    `SELECT l.*, p.nama_produk
     FROM logs l
     JOIN products p ON l.id_produk = p.id_produk
     WHERE l.id_produk = ?
     ORDER BY l.tanggal DESC`,
    [id_produk]
  );
  return rows;
};

// Tambah log stok baru
const createLog = async (data, conn = db) => {
  const {
    id_produk, id_seller, tanggal,
    jenis_perubahan, jumlah,
    stok_sebelum, stok_sesudah, alasan
  } = data;
  const id_log = await generateLogId();
  await conn.query(
    `INSERT INTO logs
     (id_log, id_produk, id_seller, tanggal, jenis_perubahan,
      jumlah, stok_sebelum, stok_sesudah, alasan)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id_log, id_produk, id_seller, tanggal, jenis_perubahan,
     jumlah, stok_sebelum, stok_sesudah, alasan]
  );
  return id_log;
};

// Ambil semua log milik seller
const findBySeller = async (id_seller) => {
  const [rows] = await db.query(
    `SELECT l.*, p.nama_produk
     FROM logs l
     JOIN products p ON l.id_produk = p.id_produk
     WHERE l.id_seller = ?
     ORDER BY l.tanggal DESC`,
    [id_seller]
  );
  return rows;
};

module.exports = { findByProduct, createLog, findBySeller };
