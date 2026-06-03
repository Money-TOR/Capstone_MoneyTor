const {
  findBySeller, findById,
  createProduct, updateProduct,
  updateStock, deleteProduct
} = require('../models/productModel');

// Helper mapping produk
function mapProduct(p) {
  const stok = p.stok_awal ?? 0;
  const minStok = p.minimum_stok ?? 5;
  return {
    ...p,
    id:         p.id_produk,
    nama:       p.nama_produk,
    kategori:   p.kategori_produk,
    stok,
    satuan:     'pcs',
    harga:      p.harga_jual,
    stok_rendah: stok <= minStok,
    status_produk: stok === 0 ? 'nonaktif' : p.status_produk
  };
}

const getProducts = async (req, res) => {
  try {
    const products = await findBySeller(req.user.id);
    res.status(200).json({ success: true, data: products.map(mapProduct) });
  } catch (error) {
    console.error('Error getProducts:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const getLowStock = async (req, res) => {
  try {
    const db = require('../config/db');
    const [rows] = await db.query(
      `SELECT * FROM products 
       WHERE id_seller = ? AND stok_awal <= minimum_stok AND status_produk = 'aktif'`,
      [req.user.id]
    );
    res.status(200).json({ success: true, data: rows.map(mapProduct) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    }
    res.status(200).json({ success: true, data: mapProduct(product) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const addProduct = async (req, res) => {
  try {
    let { id_supplier, nama_produk, kategori_produk, harga_jual, harga_modal, stok_awal, minimum_stok, status_produk, nama, kategori, stok, harga } = req.body;
    if (nama) nama_produk = nama;
    if (kategori) kategori_produk = kategori;
    if (stok !== undefined) stok_awal = stok;
    if (harga !== undefined) harga_jual = harga;
    if (harga_modal === undefined && harga_jual) harga_modal = parseFloat(harga_jual) * 0.6;
    if (minimum_stok === undefined) minimum_stok = 5;
    if (!nama_produk) return res.status(400).json({ success: false, message: 'Nama produk wajib diisi!' });
    const stokFinal = parseInt(stok_awal) || 0;
    if (status_produk === undefined) {
      status_produk = stokFinal <= (parseInt(minimum_stok) || 5) ? 'nonaktif' : 'aktif';
      if (stokFinal > 0) status_produk = 'aktif';
    }
    const newId = await createProduct({ id_seller: req.user.id, id_supplier, nama_produk, kategori_produk, harga_jual, harga_modal, stok_awal: stokFinal, minimum_stok, status_produk });
    res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan!', data: { id_produk: newId, nama_produk, stok_awal: stokFinal, status_produk } });
  } catch (error) {
    console.error('Error addProduct:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// --- INI VERSI FINAL YANG SUDAH DIPERBAIKI ---
const editProduct = async (req, res) => {
  const db = require('../config/db');
  let conn;
  try {
    let { nama_produk, kategori_produk, harga_jual, harga_modal, minimum_stok, status_produk, id_supplier, stok_awal, nama, kategori, stok, harga } = req.body;
    if (nama) nama_produk = nama;
    if (kategori) kategori_produk = kategori;
    if (harga !== undefined) harga_jual = harga;
    if (stok !== undefined) stok_awal = stok;

    conn = await db.getConnection();
    await conn.beginTransaction();

    const current = await findById(req.params.id, conn);
    if (!current) {
      await conn.rollback(); conn.release();
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    }

    if (stok_awal !== undefined) {
      const stokBaru = parseInt(stok_awal);
      const stokLama = current.stok_awal;
      if (status_produk === undefined) status_produk = stokBaru === 0 ? 'nonaktif' : 'aktif';
      await updateStock(req.params.id, stokBaru, conn);
      if (stokBaru !== stokLama) {
        const { createLog } = require('../models/stockModel');
        const diff = stokBaru - stokLama;
        await createLog({ id_produk: req.params.id, id_seller: req.user.id, tanggal: new Date().toISOString().slice(0, 10), jenis_perubahan: diff > 0 ? 'masuk' : diff < 0 ? 'keluar' : 'penyesuaian', jumlah: Math.abs(diff), stok_sebelum: stokLama, stok_sesudah: stokBaru, alasan: 'Update manual' }, conn);
      }
    }

    await updateProduct(req.params.id, {
      nama_produk: nama_produk ?? current.nama_produk,
      kategori_produk: kategori_produk ?? current.kategori_produk,
      harga_jual: harga_jual ?? current.harga_jual,
      harga_modal: harga_modal ?? current.harga_modal,
      minimum_stok: minimum_stok ?? current.minimum_stok,
      status_produk: status_produk ?? current.status_produk,
      id_supplier: id_supplier ?? current.id_supplier
    }, conn); // <--- INI PENTING, CONN NYA HARUS MASUK!

    await conn.commit();
    conn.release();
    res.status(200).json({ success: true, message: 'Produk berhasil diupdate!' });
  } catch (error) {
    if (conn) {
      await conn.rollback();
      conn.release();
    }
    console.error('Error editProduct:', error);
    res.status(500).json({ success: false, message: 'Gagal update, database terkunci atau terjadi kesalahan.' });
  }
};

const removeProduct = async (req, res) => {
  try {
    const affected = await deleteProduct(req.params.id);
    if (!affected) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    res.status(200).json({ success: true, message: 'Produk berhasil dihapus!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { getProducts, getProductById, getLowStock, addProduct, editProduct, removeProduct };