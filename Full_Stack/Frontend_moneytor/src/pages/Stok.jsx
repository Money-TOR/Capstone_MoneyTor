import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import { Sparkles, CheckCircle, AlertTriangle, Bot, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { getProduk, tambahProduk, hapusProduk, tambahLogStok, isLoggedIn, getRekomendasiProduk, editProduk } from '../api';
import '../styles/Dashboard.css';

const D = {
    box: { background: '#111111', borderRadius: '0.75rem', border: '1px solid #222222' },
    input: { width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #222222', background: '#0a0a0a', color: '#f0effe', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' },
    label: { fontSize: '0.875rem', fontWeight: 600, color: '#a09ab8', display: 'block', marginBottom: '0.35rem' },
};

const KATEGORI_OPTIONS = ['Makanan', 'Minuman', 'Sembako', 'Snack', 'Frozen Food', 'Bakery', 'Fashion', 'Laundry', 'Elektronik', 'Kesehatan', 'Kebersihan', 'Lainnya'];

const KATEGORI_STARTER_ID = {
    'Minuman': 'P001', 'Sembako': 'P006', 'Snack': 'P011',
    'Makanan': 'P016', 'Frozen Food': 'P021', 'Bakery': 'P026',
    'Laundry': 'P031', 'Fashion': 'P036',
};

const emptyForm = { nama_produk: '', kategori_produk: '', harga_jual: '', harga_modal: '', stok_awal: '', minimum_stok: '5', status_produk: 'aktif' };

function Stok() {
    const [stok, setStok] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [showForm, setShowForm] = useState(false);
    const [showRestokModal, setShowRestokModal] = useState(false);
    const [restokItem, setRestokItem] = useState(null);
    const [restokJumlah, setRestokJumlah] = useState('');
    
    // Jenis perubahan mendukung 3 tipe sesuai UI: 'masuk', 'keluar', atau 'rusak'
    const [restokJenis, setRestokJenis] = useState('masuk');
    const [loading, setLoading] = useState(false);

    // AI states
    const [rekomendasi, setRekomendasi] = useState([]);
    const [loadingRekomendasi, setLoadingRekomendasi] = useState(false);

    // Carousel State
    const [currentSlide, setCurrentSlide] = useState(0);
    const timeoutRef = useRef(null);

    // ── STATE BARU UNTUK EDIT PRODUK ──────────────────────────────
    const [showEditModal, setShowEditModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [editForm, setEditForm] = useState(emptyForm);

    const fetchProducts = async () => {
        try {
            const res = await getProduk();
            if (res.success) setStok(res.data || []);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (!isLoggedIn()) { window.location.href = '/login'; return; }
        fetchProducts();
    }, []);

    const getStokValue = (item) => {
        if (item.stok !== undefined && item.stok !== null) return Number(item.stok);
        if (item.stok_awal !== undefined && item.stok_awal !== null) return Number(item.stok_awal);
        return 0;
    };
    const getMinStok = (item) => Number(item.minimum_stok || 0);
    const isHabis    = (item) => getStokValue(item) === 0;
    const isMenipis  = (item) => {
        const aktualStok = getStokValue(item);
        return aktualStok <= getMinStok(item) && aktualStok > 0;
    };

    const dapatkanAnalisisKategori = () => {
        const mapKategori = {};
        stok.forEach(item => {
            const kategori = item.kategori_produk || item.kategori || 'Lainnya';
            if (!mapKategori[kategori]) {
                mapKategori[kategori] = { namaKategori: kategori, totalItemMenipis: 0 };
            }
            if (isMenipis(item)) {
                mapKategori[kategori].totalItemMenipis += 1;
            }
        });
        return Object.values(mapKategori).filter(kat => kat.totalItemMenipis > 0);
    };

    const kategoriBermasalah = dapatkanAnalisisKategori();

    const resetTimeout = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    useEffect(() => {
        if (kategoriBermasalah.length <= 1) return;
        resetTimeout();
        timeoutRef.current = setTimeout(
            () => setCurrentSlide((prevSlide) => (prevSlide + 1) % kategoriBermasalah.length),
            3000
        );
        return () => resetTimeout();
    }, [currentSlide, kategoriBermasalah.length]);

    const handlePrevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? kategoriBermasalah.length - 1 : prev - 1));
    };

    const handleNextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % kategoriBermasalah.length);
    };

    useEffect(() => {
        setCurrentSlide(0);
    }, [kategoriBermasalah.length]);

    useEffect(() => {
        const kategori = form.kategori_produk;
        if (!kategori || !KATEGORI_STARTER_ID[kategori]) {
            setRekomendasi([]);
            return;
        }
        const starterId = KATEGORI_STARTER_ID[kategori];
        setLoadingRekomendasi(true);
        setRekomendasi([]);
        const timer = setTimeout(async () => {
            try {
                const res = await getRekomendasiProduk(starterId, 5);
                if (res.success && res.data) {
                    const list = res.data.recommendations || res.data;
                    setRekomendasi(Array.isArray(list) ? list : []);
                } else {
                    setRekomendasi([]);
                }
            } catch (err) {
                setRekomendasi([]);
            } finally {
                setLoadingRekomendasi(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [form.kategori_produk]);

    // ── TAMBAH PRODUK ─────────────────────────────────────────────
    const handleTambah = async (e) => {
        e.preventDefault();
        if (!form.nama_produk) return alert('Nama produk wajib diisi!');
        setLoading(true);
        try {
            const res = await tambahProduk({
                nama_produk: form.nama_produk,
                kategori_produk: form.kategori_produk || 'Lainnya',
                harga_jual: Number(form.harga_jual || 0),
                harga_modal: Number(form.harga_modal || 0),
                stok_awal: Number(form.stok_awal || 0),
                minimum_stok: Number(form.minimum_stok || 5),
                status_produk: form.status_produk || 'aktif',
            });
            if (res.success) {
                alert('Produk berhasil ditambahkan!');
                fetchProducts();
                setForm(emptyForm);
                setRekomendasi([]);
                setShowForm(false);
            } else {
                alert(res.message || 'Gagal menambahkan produk');
            }
        } catch (err) { alert('Gagal menghubungi server'); }
        setLoading(false);
    };

    // ── HAPUS PRODUK ──────────────────────────────────────────────
    const handleHapus = async (id) => {
        if (!window.confirm('Yakin hapus produk ini?')) return;
        try {
            const res = await hapusProduk(id);
            if (res.success) fetchProducts();
            else alert(res.message || 'Gagal hapus');
        } catch (err) { alert('Gagal menghubungi server'); }
    };

    // ── LOGIC EDIT PRODUK KONEK DATABASE ──────────────────────────
    const handleBukaEdit = (item) => {
        setEditItem(item);
        setEditForm({
            nama_produk: item.nama_produk || item.nama || '',
            kategori_produk: item.kategori_produk || item.kategori || 'Lainnya',
            harga_jual: item.harga_jual || item.harga || 0,
            harga_modal: item.harga_modal || 0,
            stok_awal: getStokValue(item), // Biar form edit nangkep stok terakhir
            minimum_stok: item.minimum_stok || 5,
            status_produk: item.status_produk || 'aktif',
        });
        setShowEditModal(true);
    };

    const handleSimpanEdit = async (e) => {
        e.preventDefault();
        if (!editForm.nama_produk) return alert('Nama produk wajib diisi!');
        setLoading(true);
        try {
            const idProduk = editItem.id_produk || editItem.id;
            const res = await editProduk(idProduk, {
                nama_produk: editForm.nama_produk,
                kategori_produk: editForm.kategori_produk,
                harga_jual: Number(editForm.harga_jual),
                harga_modal: Number(editForm.harga_modal),
                stok_awal: Number(editForm.stok_awal),
                minimum_stok: Number(editForm.minimum_stok),
                status_produk: editForm.status_produk,
            });

            if (res.success) {
                alert('Produk berhasil diperbarui di database!');
                fetchProducts();
                setShowEditModal(false);
            } else {
                alert(res.message || 'Gagal memperbarui produk');
            }
        } catch (err) {
            console.error(err);
            alert('Gagal menghubungi server database');
        }
        setLoading(false);
    };

    // ── BUKA MODAL STOK MANUAL ────────────────────────────────────
    const handleBukaRestok = (item) => {
        setRestokItem(item);
        setRestokJumlah('');
        setRestokJenis('masuk'); 
        setShowRestokModal(true);
    };

    // ── SIMPAN PENYESUAIAN STOK (LOGIC BACKEND) ───────────────────
    const handleSimpanRestok = async () => {
        if (!restokItem || !restokJumlah) return alert('Masukkan jumlah!');
        setLoading(true);

        let typeParam = 'masuk';
        let alasanDef = 'Restok manual';

        if (restokJenis === 'keluar') {
            typeParam = 'keluar';
            alasanDef = 'Stok Keluar (Manual)';
        } else if (restokJenis === 'rusak') {
            typeParam = 'keluar'; 
            alasanDef = 'Stok Rusak / Cacat';
        }

        try {
            const res = await tambahLogStok({
                id_produk: restokItem.id_produk || restokItem.id,
                jenis_perubahan: typeParam,
                jumlah: Number(restokJumlah),
                tanggal: new Date().toISOString().slice(0, 10),
                alasan: alasanDef,
            });
            if (res.success) {
                alert(`Stok berhasil diperbarui! Stok saat ini: ${res.data?.stok_sesudah}`);
                fetchProducts(); 
                setShowRestokModal(false);
            } else {
                alert(res.message || 'Gagal update stok');
            }
        } catch (err) { alert('Gagal menghubungi server'); }
        setLoading(false);
    };

    const totalNilai     = stok.reduce((a, b) => a + getStokValue(b) * (b.harga_jual || b.harga || 0), 0);
    const totalMenipis   = stok.filter(s => isMenipis(s)).length;
    const totalHabis     = stok.filter(s => isHabis(s)).length;

    const btnDanger    = { padding: '0.3rem 0.75rem', borderRadius: '0.375rem', border: 'none', background: 'rgba(239,68,68,0.15)', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 };
    const btnWarning   = { padding: '0.3rem 0.75rem', borderRadius: '0.375rem', border: 'none', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 };
    const btnInfo      = { padding: '0.3rem 0.75rem', borderRadius: '0.375rem', border: 'none', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 };
    const carouselBtnStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid #334155', borderRadius: '0.375rem', padding: '0.4rem', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' };

    const getTabStyle = (type, activeColor) => {
        const isActive = restokJenis === type;
        return {
            flex: 1,
            padding: '0.65rem',
            border: isActive ? `1px solid ${activeColor}` : '1px solid #222222',
            borderRadius: '0.5rem',
            background: isActive ? 'transparent' : '#161920',
            color: isActive ? activeColor : '#4e5569',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            transition: 'all 0.2s'
        };
    };

    return (
        <div className="dashboard-container">
            <div className="sidebar-area"><Sidebar /></div>
            <div className="main-content">
                <Topbar />
                <div className="dashboard-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ color: '#f0effe', margin: 0 }}>Manajemen Stok</h2>
                        <button className="btn-input" onClick={() => { setShowForm(!showForm); setRekomendasi([]); }}>+ Tambah Produk</button>
                    </div>

                    {/* Stat cards */}
                    <div className="stat-cards-container" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: '1.5rem' }}>
                        <div className="stat-card"><p className="stat-title">Total Produk</p><h3 className="stat-amount">{stok.length} item</h3></div>
                        <div className="stat-card"><p className="stat-title">Stok Menipis</p><h3 className="stat-amount" style={{ color: totalMenipis > 0 ? '#f59e0b' : '#10b981' }}>{totalMenipis} produk</h3></div>
                        <div className="stat-card"><p className="stat-title">Stok Habis</p><h3 className="stat-amount" style={{ color: totalHabis > 0 ? '#ef4444' : '#10b981' }}>{totalHabis} produk</h3></div>
                        <div className="stat-card highlight"><p className="stat-title" style={{ color: '#d1fae5' }}>Total Nilai Stok</p><h3 className="stat-amount">Rp {totalNilai.toLocaleString('id-ID')}</h3></div>
                    </div>

                    {/* CAROUSEL BERITA KATEGORI */}
                    <div style={{ ...D.box, background: 'linear-gradient(145deg, #111111 0%, #0a1f16 100%)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '1.5rem', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{ padding: '0.4rem', background: 'rgba(16,185,129,0.15)', borderRadius: '0.5rem', display: 'flex' }}><Sparkles size={18} color="#10b981" /></div>
                                <h5 style={{ margin: 0, fontWeight: 700, color: '#f0effe' }}>Analisis &amp; Ringkasan Kategori AI</h5>
                            </div>
                            {kategoriBermasalah.length > 1 && (
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                    <button onClick={handlePrevSlide} style={carouselBtnStyle} title="Sebelumnya"><ChevronLeft size={16} /></button>
                                    <button onClick={handleNextSlide} style={carouselBtnStyle} title="Selanjutnya"><ChevronRight size={16} /></button>
                                </div>
                            )}
                        </div>

                        {kategoriBermasalah.length > 0 ? (
                            <div style={{ position: 'relative', overflow: 'hidden', minHeight: '85px', display: 'flex', alignItems: 'center' }}>
                                {kategoriBermasalah.map((kat, index) => (
                                    <div key={index} style={{
                                        display: index === currentSlide ? 'flex' : 'none',
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '0.75rem',
                                        background: 'linear-gradient(135deg, #1a1515 0%, #111111 100%)',
                                        border: '1px solid rgba(245,158,11,0.2)',
                                        borderLeft: '4px solid #f59e0b',
                                        gap: '0.875rem',
                                        alignItems: 'center',
                                        animation: 'fadeIn 0.5s ease-in-out'
                                    }}>
                                        <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <p style={{ margin: 0, fontWeight: 700, color: '#f0effe', fontSize: '1rem' }}>
                                                    Kategori: <span style={{ color: '#f59e0b' }}>{kat.namaKategori}</span>
                                                </p>
                                                <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#1e293b', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                                                    {index + 1} dari {kategoriBermasalah.length} Kategori Kritikal
                                                </span>
                                            </div>
                                            <p style={{ margin: '0.35rem 0 0', color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                                Terdapat produk di kategori <strong style={{ color: '#f59e0b' }}>{kat.namaKategori}</strong> yang statusnya menipis. Harap segera lakukan pemeriksaan berkala dan pengisian ulang stok.
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '1.25rem', borderRadius: '0.75rem', background: 'rgba(16,185,129,0.05)', border: '1px dashed rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '0.5rem', background: 'rgba(16,185,129,0.1)', borderRadius: '50%', display: 'flex' }}><CheckCircle size={24} color="#10b981" /></div>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 700, color: '#10b981', fontSize: '0.95rem' }}>Seluruh Kategori Aman</p>
                                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>Tidak ditemukan produk yang berada di bawah limit minimum stok pada kategori mana pun.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Form Tambah Produk */}
                    {showForm && (
                        <div style={{ ...D.box, padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <h5 style={{ margin: '0 0 1rem', fontWeight: 700, color: '#f0effe' }}>Tambah Produk Baru</h5>
                            <form onSubmit={handleTambah} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={D.label}>Nama Produk *</label>
                                    <input type="text" placeholder="Contoh: Kopi Arabika 250g" value={form.nama_produk}
                                        onChange={e => setForm({ ...form, nama_produk: e.target.value })} style={D.input} required />
                                </div>
                                <div>
                                    <label style={D.label}>Kategori</label>
                                    <select value={form.kategori_produk} onChange={e => setForm({ ...form, kategori_produk: e.target.value })} style={D.input}>
                                        <option value="">Pilih Kategori</option>
                                        {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={D.label}>Harga Jual (Rp/satuan)</label>
                                    <input type="number" placeholder="0" value={form.harga_jual} onChange={e => setForm({ ...form, harga_jual: e.target.value })} style={D.input} min="0" />
                                </div>
                                <div>
                                    <label style={D.label}>Harga Modal (Rp)</label>
                                    <input type="number" placeholder="0" value={form.harga_modal} onChange={e => setForm({ ...form, harga_modal: e.target.value })} style={D.input} min="0" />
                                </div>
                                <div>
                                    <label style={D.label}>Stok Awal</label>
                                    <input type="number" placeholder="0" value={form.stok_awal} onChange={e => setForm({ ...form, stok_awal: e.target.value })} style={D.input} min="0" />
                                </div>
                                <div>
                                    <label style={D.label}>Minimum Stok (Peringatan)</label>
                                    <input type="number" placeholder="5" value={form.minimum_stok} onChange={e => setForm({ ...form, minimum_stok: e.target.value })} style={D.input} min="0" />
                                </div>
                                <div>
                                    <label style={D.label}>Status</label>
                                    <select value={form.status_produk} onChange={e => setForm({ ...form, status_produk: e.target.value })} style={D.input}>
                                        <option value="aktif">Aktif</option>
                                        <option value="nonaktif">Nonaktif</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                                    <button type="submit" className="btn-input" style={{ flex: 1 }} disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Produk'}</button>
                                    <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); setRekomendasi([]); }}
                                        style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid #222222', background: '#0a0a0a', color: '#94a3b8', cursor: 'pointer' }}>Batal</button>
                                </div>
                            </form>

                            {/* REKOMENDASI AI */}
                            {(loadingRekomendasi || rekomendasi.length > 0) && (
                                <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(99,102,241,0.05)', borderRadius: '0.75rem', border: '1px solid rgba(99,102,241,0.25)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <Bot size={16} color="#818cf8" />
                                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#818cf8' }}>Rekomendasi AI — Kategori {form.kategori_produk}</span>
                                    </div>
                                    {loadingRekomendasi ? (
                                        <p style={{ color: '#5c566e', fontSize: '0.8rem', margin: 0 }}>⏳ AI sedang mencari...</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {rekomendasi.map((r, i) => (
                                                <button key={i} type="button" onClick={() => setForm({ ...form, nama_produk: r.product_name || r.nama_produk || r })}
                                                    style={{ padding: '0.4rem 0.85rem', background: 'rgba(99,102,241,0.1)', borderRadius: '9999px', border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer', fontSize: '0.78rem', color: '#a5b4fc' }}>
                                                    + {r.product_name || r.nama_produk || r}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tabel Stok */}
                    <div style={{ ...D.box, overflow: 'hidden', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ background: '#0a0a0a' }}>
                                    {['Nama Produk', 'Kategori', 'Stok', 'Min. Stok', 'Harga Jual', 'Harga Modal', 'Total Nilai', 'Status', 'Aksi'].map(h => (
                                        <th key={h} style={{ padding: '0.65rem 0.75rem', textAlign: 'left', color: '#5c566e', fontWeight: 600, borderBottom: '1px solid #222222', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {stok.length === 0 ? (
                                    <tr><td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: '#5c566e' }}>Belum ada produk.</td></tr>
                                ) : stok.map(item => {
                                    const stokVal = getStokValue(item);
                                    const minStok = getMinStok(item);
                                    const habis   = isHabis(item);
                                    const menipis = isMenipis(item);
                                    const sColor  = habis ? '#ef4444' : menipis ? '#f59e0b' : '#10b981';
                                    return (
                                        <tr key={item.id_produk || item.id} style={{ borderBottom: '1px solid #1e293b' }}>
                                            <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: '#f0effe' }}>{item.nama_produk || item.nama}</td>
                                            <td style={{ padding: '0.65rem 0.75rem', color: '#94a3b8' }}>{item.kategori_produk || item.kategori}</td>
                                            <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: sColor }}>{stokVal}</td>
                                            <td style={{ padding: '0.65rem 0.75rem', color: '#94a3b8' }}>{minStok}</td>
                                            <td style={{ padding: '0.65rem 0.75rem', color: '#a09ab8' }}>Rp {Number(item.harga_jual || item.harga || 0).toLocaleString('id-ID')}</td>
                                            <td style={{ padding: '0.65rem 0.75rem', color: '#a09ab8' }}>Rp {Number(item.harga_modal || 0).toLocaleString('id-ID')}</td>
                                            <td style={{ padding: '0.65rem 0.75rem', color: '#a09ab8' }}>Rp {(stokVal * (item.harga_jual || item.harga || 0)).toLocaleString('id-ID')}</td>
                                            <td style={{ padding: '0.65rem 0.75rem' }}>
                                                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: `rgba(${habis ? '239,68,68' : menipis ? '245,158,11' : '16,185,129'},0.15)`, color: sColor }}>
                                                    {habis ? 'Habis' : menipis ? 'Menipis' : 'Tersedia'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.65rem 0.75rem' }}>
                                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                    <button onClick={() => handleBukaRestok(item)} style={btnWarning}>Stok</button>
                                                    <button onClick={() => handleBukaEdit(item)} style={btnInfo}>Edit</button>
                                                    <button onClick={() => handleHapus(item.id_produk || item.id)} style={btnDanger}>Hapus</button>
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

            {/* MODAL EDIT PRODUK - KONEK DATABASE PERMANEN */}
            {showEditModal && editItem && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#111111', borderRadius: '1rem', width: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', border: '1px solid #1e1e1e', overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222222' }}>
                            <h3 style={{ margin: 0, color: '#ffffff', fontWeight: 600, fontSize: '1.2rem' }}>Edit Produk</h3>
                            <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.4rem' }}>✕</button>
                        </div>
                        <form onSubmit={handleSimpanEdit} style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={D.label}>Nama Produk *</label>
                                <input type="text" value={editForm.nama_produk} onChange={e => setEditForm({ ...editForm, nama_produk: e.target.value })} style={D.input} required />
                            </div>
                            <div>
                                <label style={D.label}>Kategori</label>
                                <select value={editForm.kategori_produk} onChange={e => setEditForm({ ...editForm, kategori_produk: e.target.value })} style={D.input}>
                                    {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={D.label}>Status</label>
                                <select value={editForm.status_produk} onChange={e => setEditForm({ ...editForm, status_produk: e.target.value })} style={D.input}>
                                    <option value="aktif">Aktif</option>
                                    <option value="nonaktif">Nonaktif</option>
                                </select>
                            </div>
                            <div>
                                <label style={D.label}>Harga Jual (Rp)</label>
                                <input type="number" value={editForm.harga_jual} onChange={e => setEditForm({ ...editForm, harga_jual: e.target.value })} style={D.input} min="0" />
                            </div>
                            <div>
                                <label style={D.label}>Harga Modal (Rp)</label>
                                <input type="number" value={editForm.harga_modal} onChange={e => setEditForm({ ...editForm, harga_modal: e.target.value })} style={D.input} min="0" />
                            </div>
                            <div>
                                <label style={D.label}>Stok Aktual</label>
                                <input type="number" value={editForm.stok_awal} onChange={e => setEditForm({ ...editForm, stok_awal: e.target.value })} style={D.input} min="0" />
                            </div>
                            <div>
                                <label style={D.label}>Minimum Stok</label>
                                <input type="number" value={editForm.minimum_stok} onChange={e => setEditForm({ ...editForm, minimum_stok: e.target.value })} style={D.input} min="0" />
                            </div>
                            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <button type="submit" className="btn-input" style={{ flex: 1 }} disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                                <button type="button" onClick={() => setShowEditModal(false)} style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid #222222', background: '#0a0a0a', color: '#94a3b8', cursor: 'pointer' }}>Batal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL UPDATE STOK */}
            {showRestokModal && restokItem && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#111111', borderRadius: '1rem', width: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', border: '1px solid #1e1e1e', overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, color: '#ffffff', fontWeight: 600, fontSize: '1.2rem' }}>Update Stok Manual</h3>
                            <button onClick={() => setShowRestokModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.4rem' }}>✕</button>
                        </div>
                        <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                            <div style={{ background: '#0b0b0d', padding: '1rem 1.25rem', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid #16161a' }}>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#565c70', fontWeight: 500 }}>Produk</p>
                                <p style={{ margin: '0.25rem 0', fontWeight: 700, color: '#ffffff', fontSize: '1.2rem' }}>{restokItem.nama_produk || restokItem.nama}</p>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#565c70' }}>
                                    Stok saat ini: <span style={{ color: '#ffffff', fontWeight: 600 }}>{getStokValue(restokItem)}</span>
                                    <span style={{ margin: '0 0.5rem', color: '#2b2e3a' }}>|</span> 
                                    Kategori: <span style={{ color: '#ffffff', fontWeight: 600 }}>{restokItem.kategori_produk || restokItem.kategori || 'Lainnya'}</span>
                                </p>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ ...D.label, color: '#9097b0', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Jenis Perubahan</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button type="button" onClick={() => setRestokJenis('masuk')} style={getTabStyle('masuk', '#10b981')}>Stok Masuk</button>
                                    <button type="button" onClick={() => setRestokJenis('keluar')} style={getTabStyle('keluar', '#3b4357')}>Stok Keluar</button>
                                    <button type="button" onClick={() => setRestokJenis('rusak')} style={getTabStyle('rusak', '#ef4444')}>Stok Rusak</button>
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.75rem' }}>
                                <label style={{ ...D.label, color: '#9097b0', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Jumlah</label>
                                <input type="number" min="1" value={restokJumlah} onChange={e => setRestokJumlah(e.target.value)} placeholder="Masukkan jumlah" style={{ ...D.input, padding: '0.8rem', background: '#0a0a0d', border: '1px solid #1a1a24', borderRadius: '0.5rem', fontSize: '0.95rem' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button onClick={handleSimpanRestok} disabled={loading} style={{ flex: 1, background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '0.75rem', padding: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                                <button onClick={() => setShowRestokModal(false)} style={{ flex: 1, background: '#1e2029', color: '#94a3b8', border: 'none', borderRadius: '0.75rem', padding: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Batal</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Stok;