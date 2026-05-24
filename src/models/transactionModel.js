const db = require('../config/db');

// Ambil semua transaksi milik seller
const findBySeller = async (id_seller) => {
  const [rows] = await db.query(
    `SELECT t.*, p.nama_produk 
     FROM transactions t
     LEFT JOIN products p ON t.id_produk = p.id_produk
     WHERE t.id_seller = ?
     ORDER BY t.tanggal DESC`,
    [id_seller]
  );
  return rows;
};

// Tambah transaksi baru
const createTransaction = async (data) => {
  const {
    id_seller, id_produk, tanggal, jenis_transaksi,
    kategori, qty, harga_satuan, total_harga,
    metode_pembayaran, event, diskon, status_transaksi
  } = data;
  const [result] = await db.query(
    `INSERT INTO transactions
     (id_seller, id_produk, tanggal, jenis_transaksi,
      kategori, qty, harga_satuan, total_harga,
      metode_pembayaran, event, diskon, status_transaksi)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id_seller, id_produk, tanggal, jenis_transaksi,
     kategori, qty, harga_satuan, total_harga,
     metode_pembayaran, event, diskon, status_transaksi || 'selesai']
  );
  return result.insertId;
};

// Ringkasan laba rugi
const getSummary = async (id_seller) => {
  const [rows] = await db.query(
    `SELECT 
       SUM(CASE WHEN jenis_transaksi = 'pemasukan' THEN total_harga ELSE 0 END) AS total_pemasukan,
       SUM(CASE WHEN jenis_transaksi = 'pengeluaran' THEN total_harga ELSE 0 END) AS total_pengeluaran,
       SUM(CASE WHEN jenis_transaksi = 'pemasukan' THEN total_harga ELSE -total_harga END) AS laba_rugi
     FROM transactions
     WHERE id_seller = ? AND status_transaksi = 'selesai'`,
    [id_seller]
  );
  return rows[0];
};

// Hapus transaksi
const deleteTransaction = async (id_transaksi) => {
  const [result] = await db.query(
    'DELETE FROM transactions WHERE id_transaksi = ?',
    [id_transaksi]
  );
  return result.affectedRows;
};

module.exports = { findBySeller, createTransaction, getSummary, deleteTransaction };