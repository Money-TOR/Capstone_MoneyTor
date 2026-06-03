import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import { Package, ArrowLeft, Truck, CheckCircle, AlertTriangle, XCircle, Plus, X } from 'lucide-react';
import { getSupplierById, getProduk, tambahProduk, isLoggedIn } from '../api';
import '../styles/Dashboard.css';

const D = {
    box: { background: '#111111', borderRadius: '0.75rem', border: '1px solid #222222' },
    input: { width: '100%', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #222222', background: '#0a0a0a', color: '#f0effe', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' },
    label: { fontSize: '0.8rem', fontWeight: 600, color: '#a09ab8', display: 'block', marginBottom: '0.35rem' },
};

const KATEGORI_OPTIONS = ['Makanan', 'Minuman', 'Sembako', 'Snack', 'Frozen Food', 'Bakery', 'Fashion', 'Laundry', 'Elektronik', 'Kesehatan', 'Kebersihan', 'Lainnya'];

const emptyForm = { nama_produk: '', kategori_produk: '', harga_jual: '', harga_modal: '', stok_awal: '', minimum_stok: '5', status_produk: 'aktif' };

function ProdukSupplier() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [supplier, setSupplier] = useState(null);
    const [produkList, setProdukList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchData = async () => {
        try {
            const [sRes, pRes] = await Promise.all([getSupplierById(id), getProduk()]);
            if (sRes.success) setSupplier(sRes.data);
            if (pRes.success) {
                // Filter produk yang punya id_supplier sama
                const filtered = (pRes.data || []).filter(p => String(p.id_supplier) === String(id));
                setProdukList(filtered);
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (!isLoggedIn()) { window.location.href = '/login'; return; }
        fetchData();
    }, [id]);

    const handleTambahProduk = async (e) => {
        e.preventDefault();
        if (!form.nama_produk.trim()) return showToast('Nama produk wajib diisi!', 'error');
        setLoading(true);
        try {
            const res = await tambahProduk({
                id_supplier: id,
                nama_produk: form.nama_produk,
                kategori_produk: form.kategori_produk || 'Lainnya',
                harga_jual: Number(form.harga_jual || 0),
                harga_modal: Number(form.harga_modal || 0),
                stok_awal: Number(form.stok_awal || 0),
                minimum_stok: Number(form.minimum_stok || 5),
                status_produk: form.status_produk,
            });
            if (res.success) {
                showToast('Produk berhasil ditambahkan ke supplier!');
                setForm(emptyForm);
                setShowForm(false);
                fetchData();
            } else {
                showToast(res.message || 'Gagal menambahkan produk', 'error');
            }
        } catch { showToast('Terjadi kesalahan', 'error'); }
        setLoading(false);
    };

    const getStokStatus = (item) => {
        const stok = item.stok_awal ?? item.stok ?? 0;
        const min = item.minimum_stok ?? 5;
        if (stok === 0) return { label: 'Habis', color: '#ef4444', icon: <XCircle size={13} /> };
        if (stok <= min) return { label: 'Menipis', color: '#f59e0b', icon: <AlertTriangle size={13} /> };
        return { label: 'Tersedia', color: '#10b981', icon: <CheckCircle size={13} /> };
    };

    const btnPrimary = { background: '#6366f1', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' };

    return (
        <div className="dashboard-container">
            <div className="sidebar-area"><Sidebar /></div>
            <div className="main-content">
                <Topbar />

                {/* Toast */}
                {toast && (
                    <div style={{
                        position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
                        padding: '0.75rem 1.25rem', borderRadius: '0.75rem', fontWeight: 600,
                        fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: toast.type === 'error' ? '#7f1d1d' : '#14532d',
                        color: toast.type === 'error' ? '#fca5a5' : '#86efac',
                        border: `1px solid ${toast.type === 'error' ? '#ef4444' : '#22c55e'}`,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                    }}>
                        {toast.type === 'error' ? '✗' : '✓'} {toast.msg}
                    </div>
                )}

                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Back button */}
                    <button
                        onClick={() => navigate('/supplier')}
                        style={{ background: 'none', border: 'none', color: '#5c566e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', width: 'fit-content', padding: 0 }}>
                        <ArrowLeft size={15} />
                        Kembali ke Daftar Supplier
                    </button>

                    {/* Supplier Info Card */}
                    {supplier && (
                        <div style={{ ...D.box, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ width: 48, height: 48, borderRadius: '0.875rem', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(99,102,241,0.3)', flexShrink: 0 }}>
                                <Truck size={22} color="#818cf8" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    <h2 style={{ margin: 0, color: '#f0effe', fontWeight: 700, fontSize: '1.1rem' }}>{supplier.nama_supplier}</h2>
                                    {supplier.kategori_supplier && (
                                        <span style={{ padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600, background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>
                                            {supplier.kategori_supplier}
                                        </span>
                                    )}
                                </div>
                                <p style={{ margin: '0.25rem 0 0', color: '#5c566e', fontSize: '0.8rem' }}>
                                    {supplier.lokasi ? `📍 ${supplier.lokasi}` : ''} &nbsp; ID: <span style={{ fontFamily: 'monospace' }}>{supplier.id_supplier}</span>
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: 0, color: '#f0effe', fontWeight: 700, fontSize: '1.5rem' }}>{produkList.length}</p>
                                <p style={{ margin: 0, color: '#5c566e', fontSize: '0.75rem' }}>produk terdaftar</p>
                            </div>
                        </div>
                    )}

                    {/* Header + Tambah */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <Package size={18} color="#a09ab8" />
                            <h3 style={{ margin: 0, color: '#f0effe', fontWeight: 700, fontSize: '1rem' }}>Produk dari Supplier Ini</h3>
                        </div>
                        <button onClick={() => setShowForm(!showForm)} style={btnPrimary}>
                            <Plus size={14} />
                            Tambah Produk
                        </button>
                    </div>

                    {/* Form Tambah Produk */}
                    {showForm && (
                        <div style={{ ...D.box, padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <h4 style={{ margin: 0, color: '#f0effe', fontWeight: 700, fontSize: '0.95rem' }}>Tambah Produk untuk {supplier?.nama_supplier}</h4>
                                <button onClick={() => { setShowForm(false); setForm(emptyForm); }} style={{ background: 'none', border: 'none', color: '#5c566e', cursor: 'pointer' }}>
                                    <X size={16} />
                                </button>
                            </div>
                            <form onSubmit={handleTambahProduk}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={D.label}>Nama Produk <span style={{ color: '#ef4444' }}>*</span></label>
                                        <input style={D.input} placeholder="Contoh: Kopi Arabika 250g" value={form.nama_produk} onChange={e => setForm({ ...form, nama_produk: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={D.label}>Kategori</label>
                                        <select style={D.input} value={form.kategori_produk} onChange={e => setForm({ ...form, kategori_produk: e.target.value })}>
                                            <option value="">-- Pilih --</option>
                                            {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={D.label}>Harga Jual (Rp)</label>
                                        <input type="number" min="0" style={D.input} placeholder="0" value={form.harga_jual} onChange={e => setForm({ ...form, harga_jual: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={D.label}>Harga Modal (Rp)</label>
                                        <input type="number" min="0" style={D.input} placeholder="0" value={form.harga_modal} onChange={e => setForm({ ...form, harga_modal: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={D.label}>Stok Awal</label>
                                        <input type="number" min="0" style={D.input} placeholder="0" value={form.stok_awal} onChange={e => setForm({ ...form, stok_awal: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={D.label}>Min. Stok</label>
                                        <input type="number" min="0" style={D.input} placeholder="5" value={form.minimum_stok} onChange={e => setForm({ ...form, minimum_stok: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={D.label}>Status</label>
                                        <select style={D.input} value={form.status_produk} onChange={e => setForm({ ...form, status_produk: e.target.value })}>
                                            <option value="aktif">Aktif</option>
                                            <option value="nonaktif">Nonaktif</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button type="submit" disabled={loading} style={{ ...btnPrimary, padding: '0.65rem 1.5rem', fontSize: '0.875rem' }}>
                                        {loading ? 'Menyimpan...' : '+ Tambah Produk'}
                                    </button>
                                    <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }} style={{ padding: '0.65rem 1rem', background: '#334155', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', color: '#a09ab8', fontWeight: 600, fontSize: '0.875rem' }}>
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Tabel Produk */}
                    <div style={{ ...D.box, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ background: '#0a0a0a' }}>
                                    {['Nama Produk', 'Kategori', 'Stok', 'Harga Jual', 'Harga Modal', 'Status', 'Aksi'].map(h => (
                                        <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', color: '#5c566e', fontWeight: 600, borderBottom: '1px solid #222222', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {produkList.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#5c566e' }}>
                                            <Package size={32} style={{ margin: '0 auto 0.75rem', display: 'block', opacity: 0.3 }} />
                                            Belum ada produk dari supplier ini.<br />
                                            <span style={{ fontSize: '0.8rem' }}>Klik "Tambah Produk" untuk menambahkan.</span>
                                        </td>
                                    </tr>
                                ) : produkList.map(item => {
                                    const stok = item.stok_awal ?? item.stok ?? 0;
                                    const status = getStokStatus(item);
                                    return (
                                        <tr key={item.id_produk || item.id}
                                            style={{ borderBottom: '1px solid #1a1a2e' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#0f172a'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#f0effe' }}>{item.nama_produk || item.nama}</td>
                                            <td style={{ padding: '0.875rem 1rem', color: '#94a3b8' }}>{item.kategori_produk || item.kategori || '—'}</td>
                                            <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: status.color }}>{stok}</td>
                                            <td style={{ padding: '0.875rem 1rem', color: '#a09ab8' }}>Rp {Number(item.harga_jual || item.harga || 0).toLocaleString('id-ID')}</td>
                                            <td style={{ padding: '0.875rem 1rem', color: '#a09ab8' }}>Rp {Number(item.harga_modal || 0).toLocaleString('id-ID')}</td>
                                            <td style={{ padding: '0.875rem 1rem' }}>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                                    padding: '0.2rem 0.65rem', borderRadius: '9999px',
                                                    fontSize: '0.72rem', fontWeight: 600,
                                                    background: `${status.color}20`, color: status.color,
                                                    border: `1px solid ${status.color}40`
                                                }}>
                                                    {status.icon} {status.label}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.875rem 1rem' }}>
                                                <button
                                                    onClick={() => navigate('/stok')}
                                                    style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '0.4rem', padding: '0.35rem 0.75rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.75rem' }}>
                                                    Kelola di Stok
                                                </button>
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
    );
}

export default ProdukSupplier;
