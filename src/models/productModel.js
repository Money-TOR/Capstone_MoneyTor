const db = require('../config/db');

// Generate ID produk berikutnya: P001, P002, ...
const generateProductId = async () => {
  const [rows] = await db.query(
    `SELECT id_produk FROM products
     WHERE id_produk REGEXP '^P[0-9]+$'
     ORDER BY CAST(SUBSTRING(id_produk, 2) AS UNSIGNED) DESC LIMIT 1`
  );
  if (!rows.length) return 'P001';
  const lastNum = parseInt(rows[0].id_produk.substring(1));
  return 'P' + String(lastNum + 1).padStart(3, '0');
};

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

const findById = async (id_produk, conn = db) => {
  const [rows] = await conn.query(
    'SELECT * FROM products WHERE id_produk = ?',
    [id_produk]
  );
  return rows[0];
};

const createProduct = async (data) => {
  const {
    id_seller, id_supplier, nama_produk, kategori_produk,
    harga_jual, harga_modal, stok_awal, minimum_stok, status_produk
  } = data;
  const id_produk = await generateProductId();
  await db.query(
    `INSERT INTO products
     (id_produk, id_seller, id_supplier, nama_produk, kategori_produk,
      harga_jual, harga_modal, stok_awal, minimum_stok,
      status_produk, tanggal_input_produk)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
    [id_produk, id_seller, id_supplier || null, nama_produk, kategori_produk,
     harga_jual || 0, harga_modal || 0, stok_awal || 0,
     minimum_stok || 0, status_produk || 'aktif']
  );
  return id_produk;
};

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
     harga_modal, minimum_stok, status_produk, id_supplier || null, id_produk]
  );
  return result.affectedRows;
};

const updateStock = async (id_produk, stok_baru, conn = db) => {
  const [result] = await conn.query(
    'UPDATE products SET stok_awal = ? WHERE id_produk = ?',
    [stok_baru, id_produk]
  );
  return result.affectedRows;
};

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
