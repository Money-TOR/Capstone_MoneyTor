const db = require('../config/db');

// Ambil riwayat log stok berdasarkan produk
const findByProduct = async (id_produk) => {
  const [rows] = await db.query(
    `SELECT l.*, p.nama_produk 
     FROM logs l
     JOIN products p ON l.id_produk = p.id_produk
     WHERE l.id_produk = ?
     ORDER BY l.tanggal_log DESC`,
    [id_produk]
  );
  return rows;
};

// Tambah log stok baru
const createLog = async (data) => {
  const {
    id_produk, id_seller, tanggal_log,
    jenis_log, stok_sebelum, stok_sesudah,
    jumlah_perubahan, keterangan
  } = data;
  const [result] = await db.query(
    `INSERT INTO logs
     (id_produk, id_seller, tanggal_log, jenis_log,
      stok_sebelum, stok_sesudah, jumlah_perubahan, keterangan)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id_produk, id_seller, tanggal_log, jenis_log,
     stok_sebelum, stok_sesudah, jumlah_perubahan, keterangan]
  );
  return result.insertId;
};

// Ambil semua log milik seller
const findBySeller = async (id_seller) => {
  const [rows] = await db.query(
    `SELECT l.*, p.nama_produk
     FROM logs l
     JOIN products p ON l.id_produk = p.id_produk
     WHERE l.id_seller = ?
     ORDER BY l.tanggal_log DESC`,
    [id_seller]
  );
  return rows;
};

module.exports = { findByProduct, createLog, findBySeller };