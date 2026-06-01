const db = require('../config/db');

// Generate ID transaksi berikutnya: T000001, T000002, ...
const generateTransactionId = async () => {
  const [rows] = await db.query(
    `SELECT id_transaksi FROM transactions
     WHERE id_transaksi REGEXP '^T[0-9]+$'
     ORDER BY CAST(SUBSTRING(id_transaksi, 2) AS UNSIGNED) DESC LIMIT 1`
  );
  if (!rows.length) return 'T000001';
  const lastNum = parseInt(rows[0].id_transaksi.substring(1));
  return 'T' + String(lastNum + 1).padStart(6, '0');
};

// Ambil semua transaksi milik seller
const findBySeller = async (id_seller) => {
  const [rows] = await db.query(
    `SELECT t.*, p.nama_produk
     FROM transactions t
     LEFT JOIN products p ON t.id_produk = p.id_produk
     WHERE t.id_seller = ?
     ORDER BY t.tanggal DESC, t.jam_transaksi DESC`,
    [id_seller]
  );
  return rows;
};

// Tambah transaksi baru
const createTransaction = async (data, conn = db) => {
  const {
    id_seller, id_produk, tanggal, jam_transaksi,
    jenis_transaksi, kategori, qty, harga_satuan,
    total_harga, metode_pembayaran, event, diskon, status_transaksi
  } = data;
  const id_transaksi = await generateTransactionId();
  await conn.query(
    `INSERT INTO transactions
     (id_transaksi, id_seller, id_produk, tanggal, jam_transaksi, jenis_transaksi,
      kategori, qty, harga_satuan, total_harga,
      metode_pembayaran, event, diskon, status_transaksi)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id_transaksi, id_seller, id_produk || null, tanggal,
     jam_transaksi || '00:00:00', jenis_transaksi,
     kategori, qty || 1, harga_satuan || 0, total_harga,
     metode_pembayaran || 'cash', event || null,
     diskon || 0, status_transaksi || 'selesai']
  );
  return id_transaksi;
};

// Ringkasan laba rugi
const getSummary = async (id_seller) => {
  const [rows] = await db.query(
    `SELECT
       COALESCE(SUM(CASE WHEN jenis_transaksi='pemasukan'   THEN total_harga ELSE 0 END), 0) AS total_pemasukan,
       COALESCE(SUM(CASE WHEN jenis_transaksi='pengeluaran' THEN total_harga ELSE 0 END), 0) AS total_pengeluaran,
       COALESCE(SUM(CASE WHEN jenis_transaksi='pemasukan'   THEN total_harga ELSE -total_harga END), 0) AS laba_rugi,
       COUNT(*) AS total_transaksi
     FROM transactions
     WHERE id_seller = ? AND status_transaksi = 'selesai'`,
    [id_seller]
  );
  return rows[0];
};

// Hapus transaksi
const deleteTransaction = async (id_transaksi, id_seller) => {
  const [result] = await db.query(
    'DELETE FROM transactions WHERE id_transaksi = ? AND id_seller = ?',
    [id_transaksi, id_seller]
  );
  return result.affectedRows;
};

module.exports = { findBySeller, createTransaction, getSummary, deleteTransaction };
