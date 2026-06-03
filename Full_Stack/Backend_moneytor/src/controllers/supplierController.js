const {
  getAllSuppliers, findById,
  createSupplier, updateSupplier, deleteSupplier
} = require('../models/supplierModel'); // ← GANTI dari businessModel ke supplierModel

// GET semua supplier
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await getAllSuppliers();
    res.status(200).json({ success: true, data: suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// GET 1 supplier by ID ← BARU DITAMBAHKAN
const getSupplierById = async (req, res) => {
  try {
    const supplier = await findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier tidak ditemukan.' });
    }
    res.status(200).json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// POST tambah supplier
const addSupplier = async (req, res) => {
  try {
    const { nama_supplier, kategori_supplier, lokasi } = req.body;
    if (!nama_supplier) {
      return res.status(400).json({
        success: false,
        message: 'Nama supplier wajib diisi!'
      });
    }
    const newId = await createSupplier({ nama_supplier, kategori_supplier, lokasi });
    res.status(201).json({
      success: true,
      message: 'Supplier berhasil ditambahkan!',
      data: { id_supplier: newId, nama_supplier, kategori_supplier, lokasi }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// PUT update supplier
const editSupplier = async (req, res) => {
  try {
    const { nama_supplier, kategori_supplier, lokasi } = req.body;
    if (!nama_supplier) {
      return res.status(400).json({
        success: false,
        message: 'Nama supplier wajib diisi!'
      });
    }
    await updateSupplier(req.params.id, { nama_supplier, kategori_supplier, lokasi });
    res.status(200).json({ success: true, message: 'Supplier berhasil diupdate!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// DELETE supplier
const removeSupplier = async (req, res) => {
  try {
    await deleteSupplier(req.params.id);
    res.status(200).json({ success: true, message: 'Supplier berhasil dihapus!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { getSuppliers, getSupplierById, addSupplier, editSupplier, removeSupplier };