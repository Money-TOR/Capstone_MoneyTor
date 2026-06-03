import React, { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import { getTransaksi, tambahTransaksi, editTransaksi, hapusTransaksi, getProduk, isLoggedIn } from '../api';
import '../styles/Dashboard.css';

const D = {
    box: { background: '#111111', borderRadius: '0.75rem', border: '1px solid #222222', padding: '1.5rem', marginTop: '1.5rem' },
    label: { fontSize: '0.875rem', fontWeight: 600, color: '#a09ab8', display: 'block', marginBottom: '0.4rem' },
    input: { width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #222222', marginTop: '0.25rem', background: '#0a0a0a', color: '#f0effe', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' },
};

const EVENT_OPTIONS = ['Tidak Ada Event', '10.10 Sale', 'Ramadhan', 'Natal', 'Lebaran', 'Harbolnas', 'Flash Sale'];
const METODE_OPTIONS = ['Transfer Bank', 'Tunai', 'QRIS'];
const kategoriPemasukan = ['Penjualan Produk', 'Pendapatan Lain'];
const kategoriPengeluaran = ['Bahan Baku', 'Operasional', 'Gaji', 'Lainnya'];

// Helper untuk mendapatkan tanggal lokal berformat YYYY-MM-DD dengan aman
const getLocalDateString = (dateObj = new Date()) => {
    const offset = dateObj.getTimezoneOffset();
    const localDate = new Date(dateObj.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().slice(0, 10);
};

const emptyForm = {
    tipe: 'pemasukan', kategori: '', id_produk: '', qty: '1',
    harga_satuan: '', diskon: '0', total_harga: '',
    metode_pembayaran: 'Tunai', event: 'Tidak Ada Event', // Default diganti ke 'Tunai' agar sinkron dengan select options
    tanggal: getLocalDateString(),
    jam_transaksi: new Date().toTimeString().slice(0, 5),
};

function Keuangan() {
    const [transaksi, setTransaksi] = useState([]);
    const [produkList, setProdukList] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [showForm, setShowForm] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [loading, setLoading] = useState(false);

    const fetchAll = async () => {
        try {
            const [tRes, pRes] = await Promise.all([getTransaksi(), getProduk()]);
            if (tRes.success) setTransaksi(tRes.data || []);
            if (pRes.success) setProdukList(pRes.data || []);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (!isLoggedIn()) { window.location.href = '/login'; return; }
        fetchAll();
    }, []);

    const hitungTotal = (qty, harga, diskon) => {
        const q = Number(qty) || 1;
        const h = Number(harga) || 0;
        const d = Number(diskon) || 0;
        return Math.round(q * h * (1 - d / 100));
    };

    const handlePilihProduk = (id, isEdit = false) => {
        const produk = produkList.find(p => String(p.id_produk || p.id) === String(id));
        if (isEdit) {
            const newHarga = produk ? (produk.harga_jual || produk.harga || 0) : editForm.harga_satuan;
            const newKat = produk ? (produk.kategori_produk || produk.kategori || '') : editForm.kategori;
            const total = hitungTotal(editForm.qty, newHarga, editForm.diskon);
            setEditForm({ ...editForm, id_produk: id, harga_satuan: newHarga, kategori: newKat, total_harga: total });
        } else {
            const newHarga = produk ? (produk.harga_jual || produk.harga || 0) : form.harga_satuan;
            // FIX: Mengubah p.kategori menjadi produk.kategori
            const newKat = produk ? (produk.kategori_produk || produk.kategori || '') : form.kategori;
            const total = hitungTotal(form.qty, newHarga, form.diskon);
            setForm({ ...form, id_produk: id, harga_satuan: newHarga, kategori: newKat, total_harga: total });
        }
    };

    const handleFormChange = (key, val, isEdit = false) => {
        if (isEdit) {
            const updated = { ...editForm, [key]: val };
            if (['qty', 'harga_satuan', 'diskon'].includes(key)) {
                updated.total_harga = hitungTotal(updated.qty, updated.harga_satuan, updated.diskon);
            }
            setEditForm(updated);
        } else {
            const updated = { ...form, [key]: val };
            if (['qty', 'harga_satuan', 'diskon'].includes(key)) {
                updated.total_harga = hitungTotal(updated.qty, updated.harga_satuan, updated.diskon);
            }
            setForm(updated);
        }
    };

    const cekStok = (id_produk, qty) => {
        const produk = produkList.find(p => String(p.id_produk || p.id) === String(id_produk));
        if (!produk) return { cukup: true };
        // FIX: Mengubah p menjadi produk
        const stok = produk.stok_awal !== undefined ? produk.stok_awal : (produk.stok || 0);
        return { cukup: stok >= Number(qty), stok, nama: produk.nama_produk || produk.nama };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.total_harga || !form.tanggal) return alert('Lengkapi semua field!');

        if (form.tipe === 'pemasukan' && form.id_produk) {
            const { cukup, stok, nama } = cekStok(form.id_produk, form.qty);
            if (!cukup) return alert(`Stok ${nama} tidak cukup! Stok tersedia: ${stok}`);
        }

        setLoading(true);
        try {
            const payload = {
                id_produk: form.id_produk || null,
                tanggal: form.tanggal,
                jam_transaksi: form.jam_transaksi || '00:00:00',
                jenis_transaksi: form.tipe,
                kategori: form.kategori,
                qty: Number(form.qty) || 1,
                harga_satuan: Number(form.harga_satuan) || 0,
                total_harga: Number(form.total_harga),
                metode_pembayaran: form.metode_pembayaran,
                event: form.event !== 'Tidak Ada Event' ? form.event : null,
                diskon: Number(form.diskon) || 0,
                status_transaksi: 'selesai',
            };
            const res = await tambahTransaksi(payload);
            if (res.success) {
                alert('Transaksi berhasil ditambahkan!');
                setForm(emptyForm);
                setShowForm(false);
                fetchAll();
            } else {
                alert(res.message || 'Gagal menambahkan transaksi');
            }
        } catch (err) {
            alert('Gagal menghubungi server');
        }
        setLoading(false);
    };

    const handleBukaEdit = (item) => {
        setEditItem(item);
        const tglData = item.tanggal ? getLocalDateString(new Date(item.tanggal)) : '';
        setEditForm({
            tipe: item.jenis_transaksi || item.tipe || 'pemasukan',
            kategori: item.kategori || '',
            id_produk: item.id_produk || '',
            qty: item.qty || 1,
            harga_satuan: item.harga_satuan || 0,
            diskon: item.diskon || 0,
            total_harga: item.total_harga || item.jumlah || 0,
            metode_pembayaran: item.metode_pembayaran || 'Tunai',
            event: item.event || 'Tidak Ada Event',
            tanggal: tglData,
            jam_transaksi: item.jam_transaksi || '00:00:00',
            status_transaksi: item.status_transaksi || 'selesai',
        });
        setEditModal(true);
    };

    const handleSimpanEdit = async () => {
        setLoading(true);
        try {
            const res = await editTransaksi(editItem.id_transaksi || editItem.id, {
                tanggal: editForm.tanggal,
                jam_transaksi: editForm.jam_transaksi,
                jenis_transaksi: editForm.tipe,
                kategori: editForm.kategori,
                qty: Number(editForm.qty),
                harga_satuan: Number(editForm.harga_satuan),
                total_harga: Number(editForm.total_harga),
                metode_pembayaran: editForm.metode_pembayaran,
                event: editForm.event !== 'Tidak Ada Event' ? editForm.event : null,
                diskon: Number(editForm.diskon),
                status_transaksi: editForm.status_transaksi || 'selesai',
            });
            if (res.success) {
                alert('Transaksi berhasil diupdate!');
                setEditModal(false);
                fetchAll();
            } else {
                alert(res.message || 'Gagal update transaksi');
            }
        } catch (err) {
            alert('Gagal menghubungi server');
        }
        setLoading(false);
    };

    const handleHapus = async (id) => {
        if (!window.confirm('Yakin hapus transaksi ini?')) return;
        try {
            const res = await hapusTransaksi(id);
            if (res.success) fetchAll();
            else alert(res.message || 'Gagal hapus');
        } catch (err) { alert('Gagal menghubungi server'); }
    };

    const totalPemasukan = transaksi.filter(t => (t.jenis_transaksi || t.tipe) === 'pemasukan').reduce((a, b) => a + Number(b.total_harga || b.jumlah || 0), 0);
    const totalPengeluaran = transaksi.filter(t => (t.jenis_transaksi || t.tipe) === 'pengeluaran').reduce((a, b) => a + Number(b.total_harga || b.jumlah || 0), 0);
    const labaRugi = totalPemasukan - totalPengeluaran;

    const FormFields = ({ f, setF, isEdit = false }) => {
        const tipe = f.tipe;
        const produkTersedia = produkList.filter(p => {
            const stok = p.stok_awal !== undefined ? p.stok_awal : (p.stok || 0);
            return stok > 0 && (p.status_produk || 'aktif') === 'aktif';
        });

        return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={D.label}>Jenis Transaksi</label>
                    <select value={f.tipe} onChange={e => { const v = e.target.value; isEdit ? setEditForm({ ...editForm, tipe: v, kategori: '' }) : setForm({ ...form, tipe: v, kategori: '', id_produk: '' }); }} style={D.input}>
                        <option value="pemasukan">Pemasukan</option>
                        <option value="pengeluaran">Pengeluaran</option>
                    </select>
                </div>
                <div>
                    <label style={D.label}>Kategori</label>
                    <select value={f.kategori} onChange={e => isEdit ? setEditForm({ ...editForm, kategori: e.target.value }) : setForm({ ...form, kategori: e.target.value })} style={D.input}>
                        <option value="">Pilih Kategori</option>
                        {(tipe === 'pemasukan' ? kategoriPemasukan : kategoriPengeluaran).map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                </div>
                {tipe === 'pemasukan' && (
                    <div>
                        <label style={D.label}>Produk {produkTersedia.length === 0 && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>(Semua stok habis!)</span>}</label>
                        <select value={f.id_produk} onChange={e => handlePilihProduk(e.target.value, isEdit)} style={D.input}>
                            <option value="">Pilih Produk (opsional)</option>
                            {produkTersedia.map(p => {
                                const stok = p.stok_awal !== undefined ? p.stok_awal : (p.stok || 0);
                                return <option key={p.id_produk || p.id} value={p.id_produk || p.id}>{p.nama_produk || p.nama} (Stok: {stok})</option>;
                            })}
                        </select>
                    </div>
                )}
                <div>
                    <label style={D.label}>Qty (Jumlah)</label>
                    <input type="number" min="1" value={f.qty} onChange={e => handleFormChange('qty', e.target.value, isEdit)} style={D.input} />
                </div>
                <div>
                    <label style={D.label}>Harga Satuan (Rp)</label>
                    <input type="number" min="0" value={f.harga_satuan} onChange={e => handleFormChange('harga_satuan', e.target.value, isEdit)} placeholder="0" style={D.input} />
                </div>
                <div>
                    <label style={D.label}>Diskon (%)</label>
                    <input type="number" min="0" max="100" value={f.diskon} onChange={e => handleFormChange('diskon', e.target.value, isEdit)} placeholder="0" style={D.input} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                    <label style={D.label}>Total Harga (Rp) <span style={{ color: '#5c566e', fontWeight: 400 }}>— otomatis dihitung</span></label>
                    <input type="number" min="0" value={f.total_harga}
                        onChange={e => isEdit ? setEditForm({ ...editForm, total_harga: e.target.value }) : setForm({ ...form, total_harga: e.target.value })}
                        placeholder="0" style={{ ...D.input, background: '#162032', color: '#10b981', fontWeight: 700, fontSize: '1rem' }} />
                </div>
                <div>
                    <label style={D.label}>Tanggal</label>
                    <input type="date" value={f.tanggal} onChange={e => isEdit ? setEditForm({ ...editForm, tanggal: e.target.value }) : setForm({ ...form, tanggal: e.target.value })} style={{ ...D.input, colorScheme: 'dark' }} />
                </div>
                <div>
                    <label style={D.label}>Jam</label>
                    <input type="time" value={f.jam_transaksi} onChange={e => isEdit ? setEditForm({ ...editForm, jam_transaksi: e.target.value }) : setForm({ ...form, jam_transaksi: e.target.value })} style={{ ...D.input, colorScheme: 'dark' }} />
                </div>
                <div>
                    <label style={D.label}>Metode Pembayaran</label>
                    <select value={f.metode_pembayaran} onChange={e => isEdit ? setEditForm({ ...editForm, metode_pembayaran: e.target.value }) : setForm({ ...form, metode_pembayaran: e.target.value })} style={D.input}>
                        {METODE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div>
                    <label style={D.label}>Event / Promo</label>
                    <select value={f.event} onChange={e => isEdit ? setEditForm({ ...editForm, event: e.target.value }) : setForm({ ...form, event: e.target.value })} style={D.input}>
                        {EVENT_OPTIONS.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                    </select>
                </div>
            </div>
        );
    };

    return (
        <div className="dashboard-container">
            <div className="sidebar-area"><Sidebar /></div>
            <div className="main-content">
                <Topbar />
                <div className="dashboard-body">
                    <h2 style={{ marginBottom: '1.5rem', color: '#f0effe' }}>Manajemen Keuangan</h2>

                    {/* Stat Cards */}
                    <div className="stat-cards-container" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                        <div className="stat-card">
                            <p className="stat-title">Total Pemasukan</p>
                            <h3 className="stat-amount" style={{ color: '#10b981' }}>Rp {totalPemasukan.toLocaleString('id-ID')}</h3>
                        </div>
                        <div className="stat-card">
                            <p className="stat-title">Total Pengeluaran</p>
                            <h3 className="stat-amount" style={{ color: '#ef4444' }}>Rp {totalPengeluaran.toLocaleString('id-ID')}</h3>
                        </div>
                        <div className="stat-card highlight">
                            <p className="stat-title" style={{ color: '#d1fae5' }}>Laba / Rugi</p>
                            <h3 className="stat-amount" style={{ color: labaRugi >= 0 ? '#10b981' : '#ef4444' }}>
                                {labaRugi >= 0 ? '+' : ''}Rp {labaRugi.toLocaleString('id-ID')}
                            </h3>
                        </div>
                    </div>

                    {/* Tombol Tambah */}
                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn-input" onClick={() => setShowForm(!showForm)}>+ Tambah Transaksi</button>
                    </div>

                    {/* Form Tambah Transaksi */}
                    {showForm && (
                        <div style={D.box}>
                            <h5 style={{ marginBottom: '1rem', color: '#f0effe' }}>Tambah Transaksi Baru</h5>
                            <form onSubmit={handleSubmit}>
                                <FormFields f={form} setF={setForm} isEdit={false} />
                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                                    <button type="submit" className="btn-input" style={{ flex: 1 }} disabled={loading}>
                                        {loading ? 'Menyimpan...' : '+ Simpan Transaksi'}
                                    </button>
                                    <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }}
                                        style={{ padding: '0.6rem 1.25rem', background: '#334155', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', color: '#a09ab8' }}>
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Tabel Transaksi */}
                    <div style={{ ...D.box, padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #222222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h5 style={{ color: '#f0effe', margin: 0 }}>Riwayat Transaksi</h5>
                            <span style={{ color: '#5c566e', fontSize: '0.8rem' }}>{transaksi.length} transaksi</span>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr>{['Tanggal', 'Jenis', 'Kategori', 'Produk', 'Qty', 'Total', 'Metode', 'Event', 'Status', 'Aksi'].map(h => (
                                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600, background: '#0a0a0a', borderBottom: '1px solid #222222', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}</tr>
                                </thead>
                                <tbody>
                                    {transaksi.length === 0 ? (
                                        <tr><td colSpan={10} style={{ padding: '2rem', textAlign: 'center', color: '#475569' }}>Belum ada transaksi</td></tr>
                                    ) : transaksi.map(t => {
                                        const jenis = t.jenis_transaksi || t.tipe || '';
                                        const isPemasukan = jenis.toLowerCase() === 'pemasukan';
                                        const total = Number(t.total_harga || t.jumlah || 0);
                                        const tanggalTampil = t.tanggal ? getLocalDateString(new Date(t.tanggal)) : '-';

                                        return (
                                            <tr key={t.id_transaksi || t.id} style={{ borderBottom: '1px solid #1e293b' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#0f172a'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <td style={{ padding: '0.75rem 1rem', color: '#a09ab8', whiteSpace: 'nowrap' }}>{tanggalTampil}</td>
                                                <td style={{ padding: '0.75rem 1rem' }}>
                                                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                                                        background: isPemasukan ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                                                        color: isPemasukan ? '#10b981' : '#ef4444' }}>
                                                        {jenis}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.75rem 1rem', color: '#a09ab8' }}>{t.kategori || '-'}</td>
                                                <td style={{ padding: '0.75rem 1rem', color: '#a09ab8' }}>{t.nama_produk || t.produk || '-'}</td>
                                                <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{t.qty || 1}</td>
                                                <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: isPemasukan ? '#10b981' : '#ef4444' }}>
                                                    {isPemasukan ? '+' : '-'}Rp {total.toLocaleString('id-ID')}
                                                </td>
                                                <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{t.metode_pembayaran || '-'}</td>
                                                <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{t.event || 'Tidak Ada Event'}</td>
                                                <td style={{ padding: '0.75rem 1rem' }}>
                                                    <span style={{ padding: '0.25rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600,
                                                        background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                                        {t.status_transaksi || t.status || 'selesai'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.75rem 1rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                        <button onClick={() => handleBukaEdit(t)}
                                                            style={{ padding: '0.3rem 0.6rem', border: 'none', borderRadius: '0.375rem', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}>
                                                            Edit
                                                        </button>
                                                        <button onClick={() => handleHapus(t.id_transaksi || t.id)}
                                                            style={{ padding: '0.3rem 0.6rem', border: 'none', borderRadius: '0.375rem', background: 'rgba(239,68,68,0.15)', color: '#ef4444', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}>
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL EDIT TRANSAKSI */}
            {editModal && editItem && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#111111', borderRadius: '1rem', width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', border: '1px solid #222222' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #222222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#111111', zIndex: 1 }}>
                            <h3 style={{ margin: 0, color: '#f0effe', fontWeight: 700 }}>Edit Transaksi</h3>
                            <button onClick={() => setEditModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <form onSubmit={(e) => e.preventDefault()}>
                                <FormFields f={editForm} setF={setEditForm} isEdit={true} />
                            </form>
                        </div>
                        <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', gap: '0.75rem' }}>
                            <button onClick={handleSimpanEdit} disabled={loading}
                                style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
                                {loading ? 'Menyimpan...' : '💾 Simpan Perubahan'}
                            </button>
                            <button onClick={() => setEditModal(false)}
                                style={{ padding: '0.875rem 1.25rem', background: '#334155', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', color: '#a09ab8', fontWeight: 600 }}>
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Keuangan;