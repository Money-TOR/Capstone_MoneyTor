const {
  findBySeller, createTransaction,
  getSummary, deleteTransaction
} = require('../models/transactionModel');
const { findById: findProduct, updateStock } = require('../models/productModel');
const { createLog } = require('../models/stockModel');

// GET semua transaksi
const getTransactions = async (req, res) => {
  try {
    const transactions = await findBySeller(req.user.id);
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error('Error getTransactions:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
  }
};

// GET 1 transaksi by ID
const getTransactionById = async (req, res) => {
  try {
    const db = require('../config/db');
    const [rows] = await db.query(
      'SELECT * FROM transactions WHERE id_transaksi = ? AND id_seller = ?',
      [req.params.id, req.user.id]
    );
    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan.' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error getTransactionById:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
  }
};

// GET ringkasan laba rugi
const getLabaRugi = async (req, res) => {
  try {
    const summary = await getSummary(req.user.id);
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    console.error('Error getLabaRugi:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
  }
};

// GET tren bulanan — pakai LOWER() supaya cocok semua huruf besar/kecil
const getMonthlyTrend = async (req, res) => {
  try {
    const db = require('../config/db');
    const [rows] = await db.query(
      `SELECT
         DATE_FORMAT(tanggal, '%Y-%m') AS bulan,
         COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pemasukan'   THEN total_harga ELSE 0 END), 0) AS pemasukan,
         COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pengeluaran' THEN total_harga ELSE 0 END), 0) AS pengeluaran,
         COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pemasukan'   THEN total_harga ELSE -total_harga END), 0) AS laba_rugi
       FROM transactions
       WHERE id_seller = ? AND LOWER(status_transaksi) IN ('selesai','berhasil')
       GROUP BY DATE_FORMAT(tanggal, '%Y-%m')
       ORDER BY bulan DESC`,
      [req.user.id]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// POST tambah transaksi
const addTransaction = async (req, res) => {
  const db = require('../config/db');
  let conn;
  try {
    const {
      id_produk, tanggal, jam_transaksi, jenis_transaksi,
      kategori, qty, harga_satuan, total_harga,
      metode_pembayaran, event, diskon, status_transaksi
    } = req.body;

    if (!tanggal || !jenis_transaksi || !total_harga) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal, jenis transaksi, dan total harga wajib diisi!'
      });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    // Kalau ada id_produk & jenis pemasukan → kurangi stok otomatis
    if (id_produk && jenis_transaksi.toLowerCase() === 'pemasukan') {
      const product = await findProduct(id_produk, conn);
      if (product) {
        const stok_sebelum = product.stok_awal; // ← pakai stok_awal
        const jumlah       = parseInt(qty) || 1;
        const stok_sesudah = stok_sebelum - jumlah;

        if (stok_sesudah < 0) {
          await conn.rollback();
          conn.release();
          return res.status(400).json({
            success: false,
            message: `Stok tidak cukup! Stok tersedia: ${stok_sebelum}`
          });
        }

        await updateStock(id_produk, stok_sesudah, conn);
        await createLog({
          id_produk,
          id_seller:       req.user.id,
          tanggal,
          jenis_perubahan: 'keluar',
          jumlah,
          stok_sebelum,
          stok_sesudah,
          alasan: 'Terjual via transaksi'
        }, conn);
      }
    }

    const newId = await createTransaction({
      id_seller: req.user.id,
      id_produk, tanggal, jam_transaksi, jenis_transaksi,
      kategori, qty, harga_satuan, total_harga,
      metode_pembayaran, event, diskon, status_transaksi
    }, conn);

    await conn.commit();
    conn.release();

    res.status(201).json({
      success: true,
      message: 'Transaksi berhasil ditambahkan!',
      data: { id_transaksi: newId }
    });
  } catch (error) {
    if (conn) {
      try {
        await conn.rollback();
      } catch (rollbackErr) {
        console.error('Rollback error:', rollbackErr.message);
      }
      conn.release();
    }
    console.error('Error addTransaction:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
  }
};

// PUT update transaksi
const editTransaction = async (req, res) => {
  try {
    const db = require('../config/db');
    const {
      tanggal, jam_transaksi, jenis_transaksi, kategori, qty,
      harga_satuan, total_harga, metode_pembayaran,
      event, diskon, status_transaksi
    } = req.body;

    await db.query(
      `UPDATE transactions SET
       tanggal=?, jam_transaksi=?, jenis_transaksi=?, kategori=?, qty=?,
       harga_satuan=?, total_harga=?, metode_pembayaran=?,
       event=?, diskon=?, status_transaksi=?
       WHERE id_transaksi=? AND id_seller=?`,
      [tanggal, jam_transaksi || '00:00:00', jenis_transaksi, kategori, qty,
       harga_satuan, total_harga, metode_pembayaran,
       event, diskon, status_transaksi,
       req.params.id, req.user.id]
    );
    res.status(200).json({ success: true, message: 'Transaksi berhasil diupdate!' });
  } catch (error) {
    console.error('Error editTransaction:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
  }
};

// DELETE transaksi
const removeTransaction = async (req, res) => {
  try {
    const affected = await deleteTransaction(req.params.id, req.user.id);
    if (affected === 0) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan atau bukan milik Anda.' });
    }
    res.status(200).json({ success: true, message: 'Transaksi berhasil dihapus!' });
  } catch (error) {
    console.error('Error removeTransaction:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
  }
};

module.exports = {
  getTransactions, getTransactionById, getLabaRugi,
  getMonthlyTrend, addTransaction, editTransaction, removeTransaction
};