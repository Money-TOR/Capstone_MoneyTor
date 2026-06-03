const { findByProduct, createLog, findBySeller } = require('../models/stockModel');
const { findById, updateStock }                  = require('../models/productModel');

// GET semua log stok milik seller
const getStockLogs = async (req, res) => {
  try {
    const logs = await findBySeller(req.user.id);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('Error getStockLogs:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
  }
};

// GET log stok berdasarkan produk
const getStockByProduct = async (req, res) => {
  try {
    const logs = await findByProduct(req.params.id_produk);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('Error getStockByProduct:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
  }
};

// POST catat pergerakan stok
const addStockLog = async (req, res) => {
  const db = require('../config/db');
  let conn;
  try {
    const {
      id_produk, tanggal,
      jenis_perubahan, jumlah, alasan
    } = req.body;

    // Validasi field wajib
    if (!id_produk || !jenis_perubahan || !jumlah) {
      return res.status(400).json({
        success: false,
        message: 'id_produk, jenis_perubahan, dan jumlah wajib diisi!'
      });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    // Ambil stok produk saat ini
    const product = await findById(id_produk, conn);
    if (!product) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan.'
      });
    }

    const stok_sebelum = product.stok_awal;
    let stok_sesudah;
    const parseJumlah = parseInt(jumlah) || 0;

    if (jenis_perubahan.toLowerCase() === 'masuk') {
      stok_sesudah = stok_sebelum + parseJumlah;
    } else if (jenis_perubahan.toLowerCase() === 'keluar' || jenis_perubahan.toLowerCase() === 'rusak') {
      stok_sesudah = stok_sebelum - parseJumlah;
      if (stok_sesudah < 0) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({
          success: false,
          message: `Stok tidak cukup! Stok tersedia: ${stok_sebelum}`
        });
      }
    } else {
      // penyesuaian
      stok_sesudah = parseJumlah;
    }

    // Update stok di tabel products
    await updateStock(id_produk, stok_sesudah, conn);

    // Simpan log
    const newId = await createLog({
      id_produk,
      id_seller:       req.user.id,
      tanggal:         tanggal || new Date().toISOString().slice(0, 10),
      jenis_perubahan,
      jumlah:          parseJumlah,
      stok_sebelum,
      stok_sesudah,
      alasan
    }, conn);

    await conn.commit();
    conn.release();

    res.status(201).json({
      success: true,
      message: 'Log stok berhasil dicatat!',
      data: { id_log: newId, stok_sebelum, stok_sesudah }
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
    console.error('Error addStockLog:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
  }
};

module.exports = { getStockLogs, getStockByProduct, addStockLog };