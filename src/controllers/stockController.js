const { findByProduct, createLog, findBySeller } = require('../models/stockModel');
const { findById, updateStock }                  = require('../models/productModel');

// GET semua log stok milik seller
const getStockLogs = async (req, res) => {
  try {
    const logs = await findBySeller(req.user.id);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// GET log stok berdasarkan produk
const getStockByProduct = async (req, res) => {
  try {
    const logs = await findByProduct(req.params.id_produk);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// POST tambah log stok (barang masuk / keluar / rusak)
const addStockLog = async (req, res) => {
  try {
    const {
      id_produk, tanggal_log,
      jenis_log, jumlah_perubahan, keterangan
    } = req.body;

    if (!id_produk || !jenis_log || !jumlah_perubahan) {
      return res.status(400).json({
        success: false,
        message: 'id_produk, jenis_log, dan jumlah_perubahan wajib diisi!'
      });
    }

    // Ambil stok produk saat ini
    const product = await findById(id_produk);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    }

    const stok_sebelum = product.stok;
    let stok_sesudah;

    // Hitung stok baru berdasarkan jenis log
    if (jenis_log === 'masuk') {
      stok_sesudah = stok_sebelum + parseInt(jumlah_perubahan);
    } else if (jenis_log === 'keluar' || jenis_log === 'rusak') {
      stok_sesudah = stok_sebelum - parseInt(jumlah_perubahan);
      if (stok_sesudah < 0) {
        return res.status(400).json({ success: false, message: 'Stok tidak cukup!' });
      }
    } else {
      // penyesuaian — langsung set nilai
      stok_sesudah = parseInt(jumlah_perubahan);
    }

    // Update stok di tabel products
    await updateStock(id_produk, stok_sesudah);

    // Simpan log
    const newId = await createLog({
      id_produk,
      id_seller: req.user.id,
      tanggal_log,
      jenis_log,
      stok_sebelum,
      stok_sesudah,
      jumlah_perubahan,
      keterangan
    });

    res.status(201).json({
      success: true,
      message: 'Log stok berhasil ditambahkan!',
      data: { id_log: newId, stok_sebelum, stok_sesudah }
    });
  } catch (error) {
    console.error('Error addStockLog:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { getStockLogs, getStockByProduct, addStockLog };  