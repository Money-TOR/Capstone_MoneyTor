const {
  findBySeller, findById,
  createProduct, updateProduct,
  updateStock, deleteProduct
} = require('../models/productModel');

// GET semua produk milik seller yang login
const getProducts = async (req, res) => {
  try {
    const products = await findBySeller(req.user.id);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('Error getProducts:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// GET produk stok rendah (stok <= minimum_stok)
const getLowStock = async (req, res) => {
  try {
    const db = require('../config/db');
    const [rows] = await db.query(
      `SELECT * FROM products 
       WHERE id_seller = ? AND stok <= minimum_stok AND status_produk = 'aktif'`,
      [req.user.id]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// GET 1 produk berdasarkan id
const getProductById = async (req, res) => {
  try {
    const product = await findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// POST tambah produk
const addProduct = async (req, res) => {
  try {
    const {
      id_supplier, nama_produk, kategori_produk,
      harga_jual, harga_modal, stok_awal, minimum_stok, status_produk
    } = req.body;

    if (!nama_produk) {
      return res.status(400).json({ success: false, message: 'Nama produk wajib diisi!' });
    }

    const newId = await createProduct({
      id_seller: req.user.id,  // ← ambil dari token, bukan dari body!
      id_supplier, nama_produk, kategori_produk,
      harga_jual, harga_modal, stok_awal, minimum_stok, status_produk
    });

    res.status(201).json({
      success: true,
      message: 'Produk berhasil ditambahkan!',
      data: { id_produk: newId, nama_produk }
    });
  } catch (error) {
    console.error('Error addProduct:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// PUT update produk
const editProduct = async (req, res) => {
  try {
    const {
      nama_produk, kategori_produk, harga_jual,
      harga_modal, minimum_stok, status_produk, id_supplier
    } = req.body;

    await updateProduct(req.params.id, {
      nama_produk, kategori_produk, harga_jual,
      harga_modal, minimum_stok, status_produk, id_supplier
    });

    res.status(200).json({ success: true, message: 'Produk berhasil diupdate!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// DELETE produk
const removeProduct = async (req, res) => {
  try {
    await deleteProduct(req.params.id);
    res.status(200).json({ success: true, message: 'Produk berhasil dihapus!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { getProducts, getProductById, getLowStock, addProduct, editProduct, removeProduct };