import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import { Truck, Plus, Search, MapPin, Tag, Edit2, Trash2, ChevronRight, X, Package } from 'lucide-react';
import { getSupplier, tambahSupplier, editSupplier, hapusSupplier, isLoggedIn } from '../api';
import '../styles/Dashboard.css';

const D = {
    box: { background: '#111111', borderRadius: '0.75rem', border: '1px solid #222222' },
    input: { width: '100%', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #222222', background: '#0a0a0a', color: '#f0effe', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' },
    label: { fontSize: '0.8rem', fontWeight: 600, color: '#a09ab8', display: 'block', marginBottom: '0.35rem' },
};

const KATEGORI_OPTIONS = ['Bahan Baku', 'Kemasan', 'Elektronik', 'Fashion', 'Makanan & Minuman', 'Sembako', 'Peralatan', 'Jasa Logistik', 'Lainnya'];

const emptyForm = { nama_supplier: '', kategori_supplier: '', lokasi: '' };

function Supplier() {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [editItem, setEditItem] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchSuppliers = async () => {
        try {
            const res = await getSupplier();
            if (res.success) setSuppliers(res.data || []);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (!isLoggedIn()) { window.location.href = '/login'; return; }
        fetchSuppliers();
    }, []);

    const filtered = suppliers.filter(s =>
        s.nama_supplier?.toLowerCase().includes(search.toLowerCase()) ||
        s.kategori_supplier?.toLowerCase().includes(search.toLowerCase()) ||
        s.lokasi?.toLowerCase().includes(search.toLowerCase())
    );

    const handleTambah = async (e) => {
        e.preventDefault();
        if (!form.nama_supplier.trim()) return showToast('Nama supplier wajib diisi!', 'error');
        setLoading(true);
        try {
            const res = await tambahSupplier(form);
            if (res.success) {
                showToast('Supplier berhasil ditambahkan!');
                setForm(emptyForm);
                setShowForm(false);
                fetchSuppliers();
            } else {
                showToast(res.message || 'Gagal menambahkan supplier', 'error');
            }
        } catch { showToast('Terjadi kesalahan', 'error'); }
        setLoading(false);
    };

    const handleBukaEdit = (item) => {
        setEditItem(item);
        setEditForm({ nama_supplier: item.nama_supplier, kategori_supplier: item.kategori_supplier || '', lokasi: item.lokasi || '' });
        setShowEditModal(true);
    };

    const handleSimpanEdit = async () => {
        if (!editForm.nama_supplier?.trim()) return showToast('Nama supplier wajib diisi!', 'error');
        setLoading(true);
        try {
            const res = await editSupplier(editItem.id_supplier, editForm);
            if (res.success) {
                showToast('Supplier berhasil diupdate!');
                setShowEditModal(false);
                fetchSuppliers();
            } else {
                showToast(res.message || 'Gagal update', 'error');
            }
        } catch { showToast('Terjadi kesalahan', 'error'); }
        setLoading(false);
    };

    const handleHapus = async (id) => {
        if (!window.confirm('Yakin ingin menghapus supplier ini?')) return;
        try {
            const res = await hapusSupplier(id);
            if (res.success) {
                showToast('Supplier dihapus.');
                fetchSuppliers();
            } else {
                showToast('Gagal menghapus', 'error');
            }
        } catch { showToast('Terjadi kesalahan', 'error'); }
    };

    const btnPrimary = { background: '#6366f1', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' };
    const btnDanger = { background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.4rem', padding: '0.35rem 0.65rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.75rem' };
    const btnSecondary = { background: 'rgba(148,163,184,0.08)', color: '#94a3b8', border: '1px solid #222222', borderRadius: '0.4rem', padding: '0.35rem 0.65rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.75rem' };

    const kategoriColor = {
        'Bahan Baku': '#10b981', 'Kemasan': '#6366f1', 'Elektronik': '#3b82f6',
        'Fashion': '#ec4899', 'Makanan & Minuman': '#f59e0b', 'Sembako': '#84cc16',
        'Peralatan': '#8b5cf6', 'Jasa Logistik': '#06b6d4', 'Lainnya': '#94a3b8',
    };

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

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '0.75rem', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(99,102,241,0.3)' }}>
                                <Truck size={20} color="#818cf8" />
                            </div>
                            <div>
                                <h2 style={{ margin: 0, color: '#f0effe', fontWeight: 700, fontSize: '1.2rem' }}>Manajemen Supplier</h2>
                                <p style={{ margin: 0, color: '#5c566e', fontSize: '0.8rem' }}>{suppliers.length} supplier terdaftar</p>
                            </div>
                        </div>
                        <button onClick={() => setShowForm(!showForm)} style={btnPrimary}>
                            <Plus size={15} />
                            Tambah Supplier
                        </button>
                    </div>

                    {/* Form Tambah */}
                    {showForm && (
                        <div style={{ ...D.box, padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <h3 style={{ margin: 0, color: '#f0effe', fontWeight: 700, fontSize: '1rem' }}>Tambah Supplier Baru</h3>
                                <button onClick={() => { setShowForm(false); setForm(emptyForm); }} style={{ background: 'none', border: 'none', color: '#5c566e', cursor: 'pointer' }}>
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleTambah}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                                    <div>
                                        <label style={D.label}>Nama Supplier <span style={{ color: '#ef4444' }}>*</span></label>
                                        <input
                                            style={D.input}
                                            placeholder="Contoh: PT Maju Bersama"
                                            value={form.nama_supplier}
                                            onChange={e => setForm({ ...form, nama_supplier: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label style={D.label}>Kategori Supplier</label>
                                        <select
                                            style={D.input}
                                            value={form.kategori_supplier}
                                            onChange={e => setForm({ ...form, kategori_supplier: e.target.value })}
                                        >
                                            <option value="">-- Pilih Kategori --</option>
                                            {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={D.label}>Lokasi</label>
                                        <input
                                            style={D.input}
                                            placeholder="Contoh: Jakarta Barat"
                                            value={form.lokasi}
                                            onChange={e => setForm({ ...form, lokasi: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button type="submit" disabled={loading} style={{ ...btnPrimary, padding: '0.65rem 1.5rem', fontSize: '0.875rem' }}>
                                        {loading ? 'Menyimpan...' : '+ Simpan Supplier'}
                                    </button>
                                    <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }} style={{ ...btnSecondary, padding: '0.65rem 1rem', fontSize: '0.875rem' }}>
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Search */}
                    <div style={{ ...D.box, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Search size={16} color="#5c566e" />
                        <input
                            style={{ border: 'none', background: 'none', outline: 'none', color: '#f0effe', fontSize: '0.875rem', flex: 1 }}
                            placeholder="Cari nama, kategori, atau lokasi supplier..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5c566e' }}>
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Tabel */}
                    <div style={{ ...D.box, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ background: '#0a0a0a' }}>
                                    {['ID', 'Nama Supplier', 'Kategori', 'Lokasi', 'Aksi'].map(h => (
                                        <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', color: '#5c566e', fontWeight: 600, borderBottom: '1px solid #222222', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#5c566e' }}>
                                            <Truck size={32} style={{ margin: '0 auto 0.75rem', display: 'block', opacity: 0.3 }} />
                                            {search ? 'Tidak ada supplier yang cocok.' : 'Belum ada supplier. Tambah supplier pertama Anda!'}
                                        </td>
                                    </tr>
                                ) : filtered.map(item => {
                                    const warna = kategoriColor[item.kategori_supplier] || '#94a3b8';
                                    return (
                                        <tr key={item.id_supplier}
                                            style={{ borderBottom: '1px solid #1a1a2e' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#0f172a'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '0.875rem 1rem', color: '#5c566e', fontFamily: 'monospace', fontSize: '0.8rem' }}>{item.id_supplier}</td>
                                            <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#f0effe' }}>{item.nama_supplier}</td>
                                            <td style={{ padding: '0.875rem 1rem' }}>
                                                {item.kategori_supplier ? (
                                                    <span style={{
                                                        padding: '0.2rem 0.65rem', borderRadius: '9999px',
                                                        fontSize: '0.72rem', fontWeight: 600,
                                                        background: `${warna}20`, color: warna,
                                                        border: `1px solid ${warna}40`
                                                    }}>
                                                        {item.kategori_supplier}
                                                    </span>
                                                ) : <span style={{ color: '#5c566e' }}>—</span>}
                                            </td>
                                            <td style={{ padding: '0.875rem 1rem' }}>
                                                {item.lokasi ? (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                                                        <MapPin size={12} color="#5c566e" />
                                                        {item.lokasi}
                                                    </span>
                                                ) : <span style={{ color: '#5c566e' }}>—</span>}
                                            </td>
                                            <td style={{ padding: '0.875rem 1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                    <button
                                                        onClick={() => navigate(`/supplier/${item.id_supplier}/produk`)}
                                                        style={{ ...btnSecondary, display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6366f1', borderColor: 'rgba(99,102,241,0.3)' }}
                                                        title="Lihat produk supplier">
                                                        <Package size={12} />
                                                        Produk
                                                    </button>
                                                    <button onClick={() => handleBukaEdit(item)} style={{ ...btnSecondary, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                        <Edit2 size={12} />
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleHapus(item.id_supplier)} style={{ ...btnDanger, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                        <Trash2 size={12} />
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

            {/* Modal Edit */}
            {showEditModal && editItem && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#111111', borderRadius: '1rem', width: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', border: '1px solid #222222' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #222222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, color: '#f0effe', fontWeight: 700 }}>Edit Supplier</h3>
                            <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: '#5c566e', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
                        </div>
                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={D.label}>Nama Supplier <span style={{ color: '#ef4444' }}>*</span></label>
                                <input style={D.input} value={editForm.nama_supplier || ''} onChange={e => setEditForm({ ...editForm, nama_supplier: e.target.value })} />
                            </div>
                            <div>
                                <label style={D.label}>Kategori Supplier</label>
                                <select style={D.input} value={editForm.kategori_supplier || ''} onChange={e => setEditForm({ ...editForm, kategori_supplier: e.target.value })}>
                                    <option value="">-- Pilih Kategori --</option>
                                    {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={D.label}>Lokasi</label>
                                <input style={D.input} value={editForm.lokasi || ''} onChange={e => setEditForm({ ...editForm, lokasi: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', gap: '0.75rem' }}>
                            <button onClick={handleSimpanEdit} disabled={loading} style={{ flex: 1, background: '#6366f1', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
                                {loading ? 'Menyimpan...' : '💾 Simpan Perubahan'}
                            </button>
                            <button onClick={() => setShowEditModal(false)} style={{ padding: '0.875rem 1.25rem', background: '#334155', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', color: '#a09ab8', fontWeight: 600 }}>
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Supplier;
