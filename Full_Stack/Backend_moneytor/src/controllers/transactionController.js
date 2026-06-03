const {
  findBySeller, createTransaction,
  getSummary, deleteTransaction
} = require('../models/transactionModel');
const { findById: findProduct, updateStock } = require('../models/productModel');
const { createLog } = require('../models/stockModel');

// ─── Helper: hitung total_harga dengan diskon ──────────────────────────────
// diskon bisa berupa string "10%" atau angka 10 (persen) atau 0
function hitungTotalHarga(harga_satuan, qty, diskon) {
  const satuan  = parseFloat(harga_satuan) || 0;
  const jumlah  = parseInt(qty) || 1;
  let persen    = 0;

  if (diskon !== undefined && diskon !== null && diskon !== '' && diskon !== '0') {
    const raw = String(diskon).replace('%', '').trim();
    persen = parseFloat(raw) || 0;
  }

  const subtotal = satuan * jumlah;
  const potongan = subtotal * (persen / 100);
  return subtotal - potongan;
}

// ─── Mapping helper ────────────────────────────────────────────────────────
function mapTransaction(t) {
  return {
    ...t,
    id:        t.id_transaksi,
    tipe:      t.jenis_transaksi,
    deskripsi: t.event || t.kategori || '',
    jumlah:    t.total_harga,
    // FE butuh info warna: pemasukan = hijau, pengeluaran = merah
    warna:     t.jenis_transaksi?.toLowerCase() === 'pemasukan' ? 'hijau' : 'merah',
    status:    t.status_transaksi === 'selesai' || t.status_transaksi === 'berhasil'
                 ? 'Sukses' : t.status_transaksi,
    produk:    t.nama_produk || t.event || t.kategori || 'Transaksi'
  };
}

// GET semua transaksi
const getTransactions = async (req, res) => {
  try {
    const transactions = await findBySeller(req.user.id);
    res.status(200).json({ success: true, data: transactions.map(mapTransaction) });
  } catch (error) {
    console.error('Error getTransactions:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
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
    res.status(200).json({ success: true, data: mapTransaction(rows[0]) });
  } catch (error) {
    console.error('Error getTransactionById:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
  }
};

// GET ringkasan laba rugi — fix: persentase dihitung dari data asli, bukan hardcode
const getLabaRugi = async (req, res) => {
  try {
    const db = require('../config/db');

    // Summary bulan ini
    const [rows] = await db.query(
      `SELECT
         COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pemasukan'   THEN total_harga ELSE 0 END), 0) AS total_pemasukan,
         COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pengeluaran' THEN total_harga ELSE 0 END), 0) AS total_pengeluaran
       FROM transactions
       WHERE id_seller = ? AND LOWER(status_transaksi) IN ('selesai','berhasil')
         AND DATE_FORMAT(tanggal, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')`,
      [req.user.id]
    );

    // Summary bulan lalu (untuk hitung growth %)
    const [rowsPrev] = await db.query(
      `SELECT
         COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pemasukan'   THEN total_harga ELSE 0 END), 0) AS total_pemasukan,
         COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pengeluaran' THEN total_harga ELSE 0 END), 0) AS total_pengeluaran
       FROM transactions
       WHERE id_seller = ? AND LOWER(status_transaksi) IN ('selesai','berhasil')
         AND DATE_FORMAT(tanggal, '%Y-%m') = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m')`,
      [req.user.id]
    );

    // Summary total keseluruhan (untuk dashboard)
    const summary = await getSummary(req.user.id);

    const cur   = rows[0];
    const prev  = rowsPrev[0];

    function pctGrowth(now, before) {
      if (!before || parseFloat(before) === 0) return now > 0 ? '+100%' : '0%';
      const diff = ((parseFloat(now) - parseFloat(before)) / parseFloat(before)) * 100;
      return (diff >= 0 ? '+' : '') + diff.toFixed(1) + '%';
    }

    // Stok summary untuk dashboard — jumlah produk aktif & stok rendah
    const [stokRows] = await db.query(
      `SELECT
         COUNT(*) AS total_produk,
         SUM(CASE WHEN stok_awal <= minimum_stok AND status_produk='aktif' THEN 1 ELSE 0 END) AS stok_rendah,
         SUM(stok_awal) AS total_stok
       FROM products WHERE id_seller = ?`,
      [req.user.id]
    );
    const stokInfo = stokRows[0];

    const mapped = {
      // Keseluruhan (semua waktu)
      total_pemasukan:   summary.total_pemasukan,
      total_pengeluaran: summary.total_pengeluaran,
      laba_rugi:         summary.laba_rugi,
      total_transaksi:   summary.total_transaksi,
      // Alias FE
      pendapatan:        summary.total_pemasukan,
      pengeluaran:       summary.total_pengeluaran,
      laba_bersih:       summary.laba_rugi,
      saldo:             summary.laba_rugi,
      saldo_kas_bank:    summary.laba_rugi,
      // Bulan ini
      pemasukan_bulan_ini:   cur.total_pemasukan,
      pengeluaran_bulan_ini: cur.total_pengeluaran,
      laba_bulan_ini:        parseFloat(cur.total_pemasukan) - parseFloat(cur.total_pengeluaran),
      // Growth % berdasarkan data nyata
      pendapatan_growth:     pctGrowth(cur.total_pemasukan,   prev.total_pemasukan),
      pengeluaran_growth:    pctGrowth(cur.total_pengeluaran, prev.total_pengeluaran),
      laba_bersih_growth:    pctGrowth(
                               parseFloat(cur.total_pemasukan)  - parseFloat(cur.total_pengeluaran),
                               parseFloat(prev.total_pemasukan) - parseFloat(prev.total_pengeluaran)
                             ),
      // Stok info untuk dashboard
      stok: {
        total_produk: stokInfo.total_produk,
        stok_rendah:  stokInfo.stok_rendah,
        total_stok:   stokInfo.total_stok
      }
    };
    res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    console.error('Error getLabaRugi:', error);
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
         COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pemasukan'   THEN total_harga ELSE 0 END), 0) AS pemasukan,
         COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pengeluaran' THEN total_harga ELSE 0 END), 0) AS pengeluaran,
         COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pemasukan'   THEN total_harga ELSE -total_harga END), 0) AS laba_rugi
       FROM transactions
       WHERE id_seller = ? AND LOWER(status_transaksi) IN ('selesai','berhasil')
       GROUP BY DATE_FORMAT(tanggal, '%Y-%m')
       ORDER BY bulan DESC`,
      [req.user.id]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// POST tambah transaksi
const addTransaction = async (req, res) => {
  const db = require('../config/db');
  let conn;
  try {
    let {
      id_produk, tanggal, jam_transaksi, jenis_transaksi,
      kategori, qty, harga_satuan, total_harga,
      metode_pembayaran, event, diskon, status_transaksi,
      // FE keys
      tipe, jumlah, deskripsi, customer, metode
    } = req.body;

    // FE to BE mapping
    if (tipe)      jenis_transaksi   = tipe;
    if (jumlah !== undefined) total_harga = jumlah;
    if (metode)    metode_pembayaran = metode;
    if (deskripsi) event = deskripsi;
    else if (customer) event = customer;

    if (!tanggal || !jenis_transaksi || total_harga === undefined || total_harga === null) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal, jenis transaksi, dan total harga wajib diisi!'
      });
    }

    // ─── Hitung total_harga dengan diskon jika harga_satuan & qty ada ───
    if (harga_satuan && qty) {
      total_harga = hitungTotalHarga(harga_satuan, qty, diskon);
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    // Kalau ada id_produk & jenis pemasukan → cek & kurangi stok
    if (id_produk && jenis_transaksi.toLowerCase() === 'pemasukan') {
      const product = await findProduct(id_produk, conn);

      // Pastikan produk milik seller ini
      if (!product) {
        await conn.rollback(); conn.release();
        return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
      }
      if (product.status_produk === 'nonaktif') {
        await conn.rollback(); conn.release();
        return res.status(400).json({ success: false, message: 'Produk tidak aktif, tidak bisa dijual.' });
      }

      const stok_sebelum = product.stok_awal;
      const jumlah_stok  = parseInt(qty) || 1;
      const stok_sesudah = stok_sebelum - jumlah_stok;

      if (stok_sesudah < 0) {
        await conn.rollback(); conn.release();
        return res.status(400).json({
          success: false,
          message: `Stok tidak cukup! Stok tersedia: ${stok_sebelum}`
        });
      }

      // Auto-nonaktifkan produk kalau stok habis
      if (stok_sesudah <= (product.minimum_stok || 0)) {
        await conn.query(
          `UPDATE products SET stok_awal = ?, status_produk = ? WHERE id_produk = ?`,
          [stok_sesudah, stok_sesudah === 0 ? 'nonaktif' : product.status_produk, id_produk]
        );
      } else {
        await updateStock(id_produk, stok_sesudah, conn);
      }

      await createLog({
        id_produk,
        id_seller:       req.user.id,
        tanggal,
        jenis_perubahan: 'keluar',
        jumlah:          jumlah_stok,
        stok_sebelum,
        stok_sesudah,
        alasan: 'Terjual via transaksi'
      }, conn);

      // Set kategori & harga_satuan dari produk kalau belum diisi
      if (!kategori)     kategori     = product.kategori_produk;
      if (!harga_satuan) harga_satuan = product.harga_jual;
    }

    const newId = await createTransaction({
      id_seller: req.user.id,
      id_produk, tanggal, jam_transaksi, jenis_transaksi,
      kategori, qty, harga_satuan, total_harga,
      metode_pembayaran, event, diskon, status_transaksi
    }, conn);

    await conn.commit();
    conn.release();

    res.status(201).json({
      success: true,
      message: 'Transaksi berhasil ditambahkan!',
      data: { id_transaksi: newId, total_harga }
    });
  } catch (error) {
    if (conn) {
      try { await conn.rollback(); } catch (e) { console.error('Rollback error:', e.message); }
      conn.release();
    }
    console.error('Error addTransaction:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
  }
};

// PUT update transaksi — FIX: kembalikan stok dulu, lalu potong stok baru
const editTransaction = async (req, res) => {
  const db = require('../config/db');
  let conn;
  try {
    let {
      tanggal, jam_transaksi, jenis_transaksi, kategori, qty,
      harga_satuan, total_harga, metode_pembayaran,
      event, diskon, status_transaksi,
      // FE keys
      tipe, jumlah, deskripsi, customer, metode
    } = req.body;

    // FE to BE mapping
    if (tipe)      jenis_transaksi   = tipe;
    if (jumlah !== undefined) total_harga = jumlah;
    if (metode)    metode_pembayaran = metode;
    if (deskripsi) event = deskripsi;
    else if (customer) event = customer;

    conn = await db.getConnection();
    await conn.beginTransaction();

    // Ambil transaksi lama untuk kembalikan stok
    const [oldRows] = await conn.query(
      'SELECT * FROM transactions WHERE id_transaksi = ? AND id_seller = ?',
      [req.params.id, req.user.id]
    );
    if (!oldRows[0]) {
      await conn.rollback(); conn.release();
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan.' });
    }
    const oldTrx = oldRows[0];

    // Kembalikan stok dari transaksi lama (jika transaksi lama ada id_produk & pemasukan)
    if (oldTrx.id_produk && oldTrx.jenis_transaksi?.toLowerCase() === 'pemasukan') {
      const oldProduct = await findProduct(oldTrx.id_produk, conn);
      if (oldProduct) {
        const stok_sebelum = oldProduct.stok_awal;
        const stok_dikembalikan = parseInt(oldTrx.qty) || 1;
        const stok_sesudah = stok_sebelum + stok_dikembalikan;
        await updateStock(oldTrx.id_produk, stok_sesudah, conn);
        await createLog({
          id_produk: oldTrx.id_produk,
          id_seller: req.user.id,
          tanggal: new Date().toISOString().slice(0, 10),
          jenis_perubahan: 'masuk',
          jumlah: stok_dikembalikan,
          stok_sebelum,
          stok_sesudah,
          alasan: 'Stok dikembalikan karena transaksi diedit'
        }, conn);
      }
    }

    // Hitung ulang total dengan diskon baru
    if (harga_satuan && qty) {
      total_harga = hitungTotalHarga(harga_satuan, qty, diskon);
    }

    // Potong stok baru (jika ada id_produk di body baru)
    const new_id_produk = req.body.id_produk || oldTrx.id_produk;
    if (new_id_produk && (jenis_transaksi || oldTrx.jenis_transaksi)?.toLowerCase() === 'pemasukan') {
      const newProduct = await findProduct(new_id_produk, conn);
      if (newProduct) {
        const stok_sebelum = newProduct.stok_awal;
        const jumlah_stok  = parseInt(qty) || parseInt(oldTrx.qty) || 1;
        const stok_sesudah = stok_sebelum - jumlah_stok;
        if (stok_sesudah < 0) {
          await conn.rollback(); conn.release();
          return res.status(400).json({
            success: false,
            message: `Stok tidak cukup! Stok tersedia: ${stok_sebelum}`
          });
        }
        await updateStock(new_id_produk, stok_sesudah, conn);
        await createLog({
          id_produk: new_id_produk,
          id_seller: req.user.id,
          tanggal: tanggal || oldTrx.tanggal,
          jenis_perubahan: 'keluar',
          jumlah: jumlah_stok,
          stok_sebelum,
          stok_sesudah,
          alasan: 'Transaksi diedit'
        }, conn);
      }
    }

    await conn.query(
      `UPDATE transactions SET
       tanggal=?, jam_transaksi=?, jenis_transaksi=?, kategori=?, qty=?,
       harga_satuan=?, total_harga=?, metode_pembayaran=?,
       event=?, diskon=?, status_transaksi=?
       WHERE id_transaksi=? AND id_seller=?`,
      [
        tanggal               || oldTrx.tanggal,
        jam_transaksi         || oldTrx.jam_transaksi || '00:00:00',
        jenis_transaksi       || oldTrx.jenis_transaksi,
        kategori              || oldTrx.kategori,
        qty                   || oldTrx.qty,
        harga_satuan          || oldTrx.harga_satuan,
        total_harga           || oldTrx.total_harga,
        metode_pembayaran     || oldTrx.metode_pembayaran,
        event                 || oldTrx.event,
        diskon                ?? oldTrx.diskon,
        status_transaksi      || oldTrx.status_transaksi,
        req.params.id, req.user.id
      ]
    );

    await conn.commit();
    conn.release();
    res.status(200).json({ success: true, message: 'Transaksi berhasil diupdate!' });
  } catch (error) {
    if (conn) {
      try { await conn.rollback(); } catch (e) {}
      conn.release();
    }
    console.error('Error editTransaction:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
  }
};

// DELETE transaksi — FIX: kembalikan stok saat transaksi dihapus
const removeTransaction = async (req, res) => {
  const db = require('../config/db');
  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const [rows] = await conn.query(
      'SELECT * FROM transactions WHERE id_transaksi = ? AND id_seller = ?',
      [req.params.id, req.user.id]
    );
    if (!rows[0]) {
      await conn.rollback(); conn.release();
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan atau bukan milik Anda.' });
    }
    const trx = rows[0];

    // Kembalikan stok jika transaksi pemasukan yang dihapus
    if (trx.id_produk && trx.jenis_transaksi?.toLowerCase() === 'pemasukan') {
      const product = await findProduct(trx.id_produk, conn);
      if (product) {
        const stok_sebelum     = product.stok_awal;
        const stok_dikembalikan = parseInt(trx.qty) || 1;
        const stok_sesudah     = stok_sebelum + stok_dikembalikan;
        await updateStock(trx.id_produk, stok_sesudah, conn);
        await createLog({
          id_produk: trx.id_produk,
          id_seller: req.user.id,
          tanggal: new Date().toISOString().slice(0, 10),
          jenis_perubahan: 'masuk',
          jumlah: stok_dikembalikan,
          stok_sebelum,
          stok_sesudah,
          alasan: 'Stok dikembalikan karena transaksi dibatalkan/dihapus'
        }, conn);
        // Re-aktifkan produk jika sebelumnya nonaktif karena stok habis
        if (product.status_produk === 'nonaktif' && stok_sesudah > 0) {
          await conn.query(
            'UPDATE products SET status_produk = ? WHERE id_produk = ?',
            ['aktif', trx.id_produk]
          );
        }
      }
    }

    await conn.query(
      'DELETE FROM transactions WHERE id_transaksi = ? AND id_seller = ?',
      [req.params.id, req.user.id]
    );

    await conn.commit();
    conn.release();
    res.status(200).json({ success: true, message: 'Transaksi berhasil dihapus!' });
  } catch (error) {
    if (conn) {
      try { await conn.rollback(); } catch (e) {}
      conn.release();
    }
    console.error('Error removeTransaction:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
  }
};

module.exports = {
  getTransactions, getTransactionById, getLabaRugi,
  getMonthlyTrend, addTransaction, editTransaction, removeTransaction
};
