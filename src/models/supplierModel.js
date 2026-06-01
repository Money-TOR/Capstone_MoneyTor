const db = require('../config/db');

// Generate ID supplier berikutnya: S001, S002, ...
const generateSupplierId = async () => {
  const [rows] = await db.query(
    `SELECT id_supplier FROM suppliers
     WHERE id_supplier REGEXP '^S[0-9]+$'
     ORDER BY CAST(SUBSTRING(id_supplier, 2) AS UNSIGNED) DESC LIMIT 1`
  );
  if (!rows.length) return 'S001';
  const lastNum = parseInt(rows[0].id_supplier.substring(1));
  return 'S' + String(lastNum + 1).padStart(3, '0');
};

const getAllSuppliers = async () => {
  const [rows] = await db.query('SELECT * FROM suppliers');
  return rows;
};

const findById = async (id) => {
  const [rows] = await db.query(
    'SELECT * FROM suppliers WHERE id_supplier = ?', [id]
  );
  return rows[0];
};

const createSupplier = async (data) => {
  const { nama_supplier, kategori_supplier, lokasi } = data;
  const id_supplier = await generateSupplierId();
  await db.query(
    'INSERT INTO suppliers (id_supplier, nama_supplier, kategori_supplier, lokasi) VALUES (?, ?, ?, ?)',
    [id_supplier, nama_supplier, kategori_supplier, lokasi]
  );
  return id_supplier;
};

const updateSupplier = async (id, data) => {
  const { nama_supplier, kategori_supplier, lokasi } = data;
  const [result] = await db.query(
    'UPDATE suppliers SET nama_supplier = ?, kategori_supplier = ?, lokasi = ? WHERE id_supplier = ?',
    [nama_supplier, kategori_supplier, lokasi, id]
  );
  return result.affectedRows;
};

const deleteSupplier = async (id) => {
  const [result] = await db.query(
    'DELETE FROM suppliers WHERE id_supplier = ?', [id]
  );
  return result.affectedRows;
};

module.exports = { getAllSuppliers, findById, createSupplier, updateSupplier, deleteSupplier };
