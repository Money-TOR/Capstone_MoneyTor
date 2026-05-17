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
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
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
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// GET ringkasan laba rugi
const getLabaRugi = async (req, res) => {
  try {
    const summary = await getSummary(req.user.id);
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// GET tren bulanan
const getMonthlyTrend = async (req, res) => {
  try {
    const db = require('../config/db');
    const [rows] = await db.query(
      `SELECT
         DATE_FORMAT(tanggal, '%Y-%m') AS bulan,
         SUM(CASE WHEN jenis_transaksi='pemasukan'   THEN total_harga ELSE 0 END) AS pemasukan,
         SUM(CASE WHEN jenis_transaksi='pengeluaran' THEN total_harga ELSE 0 END) AS pengeluaran,
         SUM(CASE WHEN jenis_transaksi='pemasukan'   THEN total_harga ELSE -total_harga END) AS laba_rugi
       FROM transactions
       WHERE id_seller = ? AND status_transaksi = 'selesai'
       GROUP BY DATE_FORMAT(tanggal, '%Y-%m')
       ORDER BY bulan DESC`,
      [req.user.id]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// POST tambah transaksi (+ auto update stok kalau ada id_produk)
const addTransaction = async (req, res) => {
  try {
    const {
      id_produk, tanggal, jenis_transaksi, kategori,
      qty, harga_satuan, total_harga,
      metode_pembayaran, event, diskon, status_transaksi
    } = req.body;

    if (!tanggal || !jenis_transaksi || !total_harga) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal, jenis transaksi, dan total harga wajib diisi!'
      });
    }

    // Kalau ada id_produk & jenis pemasukan → kurangi stok otomatis
    if (id_produk && jenis_transaksi === 'pemasukan') {
      const product = await findProduct(id_produk);
      if (product) {
        const stok_sebelum = product.stok;
        const jumlah = parseInt(qty) || 1;
        const stok_sesudah = stok_sebelum - jumlah;

        if (stok_sesudah < 0) {
          return res.status(400).json({
            success: false,
            message: `Stok tidak cukup! Stok tersedia: ${stok_sebelum}`
          });
        }

        await updateStock(id_produk, stok_sesudah);
        await createLog({
          id_produk,
          id_seller: req.user.id,
          tanggal_log: tanggal,
          jenis_log: 'keluar',
          stok_sebelum,
          stok_sesudah,
          jumlah_perubahan: jumlah,
          keterangan: 'Terjual via transaksi'
        });
      }
    }

    const newId = await createTransaction({
      id_seller: req.user.id,
      id_produk, tanggal, jenis_transaksi, kategori,
      qty, harga_satuan, total_harga,
      metode_pembayaran, event, diskon, status_transaksi
    });

    res.status(201).json({
      success: true,
      message: 'Transaksi berhasil ditambahkan!',
      data: { id_transaksi: newId }
    });
  } catch (error) {
    console.error('Error addTransaction:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// PUT update transaksi
const editTransaction = async (req, res) => {
  try {
    const db = require('../config/db');
    const {
      tanggal, jenis_transaksi, kategori, qty,
      harga_satuan, total_harga, metode_pembayaran,
      event, diskon, status_transaksi
    } = req.body;

    await db.query(
      `UPDATE transactions SET
       tanggal=?, jenis_transaksi=?, kategori=?, qty=?,
       harga_satuan=?, total_harga=?, metode_pembayaran=?,
       event=?, diskon=?, status_transaksi=?
       WHERE id_transaksi=? AND id_seller=?`,
      [tanggal, jenis_transaksi, kategori, qty,
       harga_satuan, total_harga, metode_pembayaran,
       event, diskon, status_transaksi,
       req.params.id, req.user.id]
    );
    res.status(200).json({ success: true, message: 'Transaksi berhasil diupdate!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// DELETE transaksi
const removeTransaction = async (req, res) => {
  try {
    await deleteTransaction(req.params.id);
    res.status(200).json({ success: true, message: 'Transaksi berhasil dihapus!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = {
  getTransactions, getTransactionById, getLabaRugi,
  getMonthlyTrend, addTransaction, editTransaction, removeTransaction
};