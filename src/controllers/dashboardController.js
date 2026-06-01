// ─── dashboardController.js ────────────────────────────────────────────────
// Endpoint khusus untuk halaman dashboard FE
// Menggabungkan data keuangan + stok dalam 1 hit API

const getDashboard = async (req, res) => {
  const db = require('../config/db');
  try {
    const id_seller = req.user.id;

    // 1. Ringkasan keuangan total
    const [keuangan] = await db.query(
      `SELECT
         COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pemasukan'   THEN total_harga ELSE 0 END), 0) AS total_pemasukan,
         COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pengeluaran' THEN total_harga ELSE 0 END), 0) AS total_pengeluaran,
         COUNT(*) AS total_transaksi
       FROM transactions
       WHERE id_seller = ? AND LOWER(status_transaksi) IN ('selesai','berhasil')`,
      [id_seller]
    );

    // 2. Keuangan bulan ini
    const [bulanIni] = await db.query(
      `SELECT
         COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pemasukan'   THEN total_harga ELSE 0 END), 0) AS pemasukan,
         COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pengeluaran' THEN total_harga ELSE 0 END), 0) AS pengeluaran
       FROM transactions
       WHERE id_seller = ? AND LOWER(status_transaksi) IN ('selesai','berhasil')
         AND DATE_FORMAT(tanggal,'%Y-%m') = DATE_FORMAT(CURDATE(),'%Y-%m')`,
      [id_seller]
    );

    // 3. Keuangan bulan lalu (untuk growth %)
    const [bulanLalu] = await db.query(
      `SELECT
         COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pemasukan'   THEN total_harga ELSE 0 END), 0) AS pemasukan,
         COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pengeluaran' THEN total_harga ELSE 0 END), 0) AS pengeluaran
       FROM transactions
       WHERE id_seller = ? AND LOWER(status_transaksi) IN ('selesai','berhasil')
         AND DATE_FORMAT(tanggal,'%Y-%m') = DATE_FORMAT(DATE_SUB(CURDATE(),INTERVAL 1 MONTH),'%Y-%m')`,
      [id_seller]
    );

    // 4. Stok summary — nyambung dengan data produk
    const [stok] = await db.query(
      `SELECT
         COUNT(*) AS total_produk,
         COALESCE(SUM(stok_awal), 0) AS total_stok,
         SUM(CASE WHEN stok_awal <= minimum_stok AND status_produk='aktif' THEN 1 ELSE 0 END) AS stok_rendah,
         SUM(CASE WHEN stok_awal = 0 THEN 1 ELSE 0 END) AS stok_habis,
         SUM(CASE WHEN status_produk='aktif' THEN 1 ELSE 0 END) AS produk_aktif
       FROM products WHERE id_seller = ?`,
      [id_seller]
    );

    // 5. Tren 6 bulan terakhir
    const [tren] = await db.query(
      `SELECT
         DATE_FORMAT(tanggal,'%Y-%m') AS bulan,
         COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pemasukan'   THEN total_harga ELSE 0 END),0) AS pemasukan,
         COALESCE(SUM(CASE WHEN LOWER(jenis_transaksi)='pengeluaran' THEN total_harga ELSE 0 END),0) AS pengeluaran
       FROM transactions
       WHERE id_seller = ? AND LOWER(status_transaksi) IN ('selesai','berhasil')
         AND tanggal >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(tanggal,'%Y-%m')
       ORDER BY bulan ASC`,
      [id_seller]
    );

    // 6. Produk stok rendah (list)
    const [produkRendah] = await db.query(
      `SELECT id_produk, nama_produk, kategori_produk, stok_awal, minimum_stok
       FROM products
       WHERE id_seller = ? AND stok_awal <= minimum_stok AND status_produk='aktif'
       ORDER BY stok_awal ASC LIMIT 5`,
      [id_seller]
    );

    // 7. Transaksi terbaru 5
    const [transaksiTerbaru] = await db.query(
      `SELECT t.id_transaksi, t.tanggal, t.jenis_transaksi, t.total_harga,
              t.metode_pembayaran, p.nama_produk, t.kategori
       FROM transactions t
       LEFT JOIN products p ON t.id_produk = p.id_produk
       WHERE t.id_seller = ?
       ORDER BY t.tanggal DESC, t.jam_transaksi DESC LIMIT 5`,
      [id_seller]
    );

    function pctGrowth(now, before) {
      const n = parseFloat(now) || 0;
      const b = parseFloat(before) || 0;
      if (b === 0) return n > 0 ? '+100%' : '0%';
      const diff = ((n - b) / b) * 100;
      return (diff >= 0 ? '+' : '') + diff.toFixed(1) + '%';
    }

    const k       = keuangan[0];
    const bi      = bulanIni[0];
    const bl      = bulanLalu[0];
    const s       = stok[0];
    const labaTot = parseFloat(k.total_pemasukan) - parseFloat(k.total_pengeluaran);
    const labaBI  = parseFloat(bi.pemasukan) - parseFloat(bi.pengeluaran);
    const labaBL  = parseFloat(bl.pemasukan) - parseFloat(bl.pengeluaran);

    res.status(200).json({
      success: true,
      data: {
        keuangan: {
          total_pemasukan:   k.total_pemasukan,
          total_pengeluaran: k.total_pengeluaran,
          laba_bersih:       labaTot,
          total_transaksi:   k.total_transaksi,
          // Bulan ini
          pemasukan_bulan_ini:   bi.pemasukan,
          pengeluaran_bulan_ini: bi.pengeluaran,
          laba_bulan_ini:        labaBI,
          // Growth % berdasarkan data asli
          pemasukan_growth:   pctGrowth(bi.pemasukan,  bl.pemasukan),
          pengeluaran_growth: pctGrowth(bi.pengeluaran, bl.pengeluaran),
          laba_growth:        pctGrowth(labaBI, labaBL)
        },
        stok: {
          total_produk:  s.total_produk,
          total_stok:    s.total_stok,
          produk_aktif:  s.produk_aktif,
          stok_rendah:   s.stok_rendah,
          stok_habis:    s.stok_habis
        },
        tren_bulanan:       tren,
        produk_stok_rendah: produkRendah,
        transaksi_terbaru:  transaksiTerbaru.map(t => ({
          ...t,
          warna: t.jenis_transaksi?.toLowerCase() === 'pemasukan' ? 'hijau' : 'merah'
        }))
      }
    });
  } catch (error) {
    console.error('Error getDashboard:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
  }
};

module.exports = { getDashboard };
