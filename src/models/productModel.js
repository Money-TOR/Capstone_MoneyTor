const db = require('../config/db');

// Ambil semua produk milik seller
const findBySeller = async (id_seller) => {
  const [rows] = await db.query(
    `SELECT p.*, s.nama_supplier 
     FROM products p
     LEFT JOIN suppliers s ON p.id_supplier = s.id_supplier
     WHERE p.id_seller = ?`,
    [id_seller]
  );
  return rows;
};

// Ambil 1 produk
const findById = async (id_produk) => {
  const [rows] = await db.query(
    'SELECT * FROM products WHERE id_produk = ?',
    [id_produk]
  );
  return rows[0];
};

// Tambah produk baru
const createProduct = async (data) => {
  const {
    id_seller, id_supplier, nama_produk, kategori_produk,
    harga_jual, harga_modal, stok_awal, minimum_stok, status_produk
  } = data;
  const [result] = await db.query(
    `INSERT INTO products 
     (id_seller, id_supplier, nama_produk, kategori_produk,
      harga_jual, harga_modal, stok_awal, stok, minimum_stok, 
      status_produk, tanggal_input_produk)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
    [id_seller, id_supplier, nama_produk, kategori_produk,
     harga_jual, harga_modal, stok_awal, stok_awal, minimum_stok, status_produk || 'aktif']
  );
  return result.insertId;
};

// Update produk
const updateProduct = async (id_produk, data) => {
  const {
    nama_produk, kategori_produk, harga_jual,
    harga_modal, minimum_stok, status_produk, id_supplier
  } = data;
  const [result] = await db.query(
    `UPDATE products SET 
     nama_produk = ?, kategori_produk = ?, harga_jual = ?,
     harga_modal = ?, minimum_stok = ?, status_produk = ?, id_supplier = ?
     WHERE id_produk = ?`,
    [nama_produk, kategori_produk, harga_jual,
     harga_modal, minimum_stok, status_produk, id_supplier, id_produk]
  );
  return result.affectedRows;
};

// Update stok produk
const updateStock = async (id_produk, stok_baru) => {
  const [result] = await db.query(
    'UPDATE products SET stok = ? WHERE id_produk = ?',
    [stok_baru, id_produk]
  );
  return result.affectedRows;
};

// Hapus produk
const deleteProduct = async (id_produk) => {
  const [result] = await db.query(
    'DELETE FROM products WHERE id_produk = ?',
    [id_produk]
  );
  return result.affectedRows;
};

module.exports = {
  findBySeller, findById, createProduct,
  updateProduct, updateStock, deleteProduct
};