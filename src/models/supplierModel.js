const db = require('../config/db');

// Ambil semua supplier
const getAllSuppliers = async () => {
  const [rows] = await db.query('SELECT * FROM suppliers');
  return rows;
};

// Ambil supplier berdasarkan id
const findById = async (id) => {
  const [rows] = await db.query(
    'SELECT * FROM suppliers WHERE id_supplier = ?',
    [id]
  );
  return rows[0];
};

// Tambah supplier baru
const createSupplier = async (data) => {
  const { nama_supplier, kategori_supplier, lokasi } = data;
  const [result] = await db.query(
    'INSERT INTO suppliers (nama_supplier, kategori_supplier, lokasi) VALUES (?, ?, ?)',
    [nama_supplier, kategori_supplier, lokasi]
  );
  return result.insertId;
};

// Update supplier
const updateSupplier = async (id, data) => {
  const { nama_supplier, kategori_supplier, lokasi } = data;
  const [result] = await db.query(
    'UPDATE suppliers SET nama_supplier = ?, kategori_supplier = ?, lokasi = ? WHERE id_supplier = ?',
    [nama_supplier, kategori_supplier, lokasi, id]
  );
  return result.affectedRows;
};

// Hapus supplier
const deleteSupplier = async (id) => {
  const [result] = await db.query(
    'DELETE FROM suppliers WHERE id_supplier = ?',
    [id]
  );
  return result.affectedRows;
};

module.exports = { getAllSuppliers, findById, createSupplier, updateSupplier, deleteSupplier };