import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getLabaRugi, getTrenBulanan, getTransaksi, isLoggedIn, tambahTransaksi, getFinancialSummary, getProduk } from '../api';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import StatCard from '../components/dashboard/cards/StatCard';
import TransactionTable from '../components/dashboard/TransactionTable';
import SmartInsight from '../components/dashboard/SmartInsight';
import { Package, Sparkles } from 'lucide-react';
import '../styles/Dashboard.css';

const D = {
    modal: { background: '#111111', borderRadius: '16px', width: 750, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' },
    header: { padding: '1.25rem 1.5rem', borderBottom: '1px solid #222222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    field: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0a0a0a', border: '1px solid #222222', borderRadius: '0.6rem', padding: '0.6rem 0.75rem' },
    inputInner: { border: 'none', background: 'none', fontSize: '0.8rem', outline: 'none', flex: 1, color: '#f0effe' },
    selectInner: { border: 'none', background: 'none', fontSize: '0.8rem', outline: 'none', flex: 1, cursor: 'pointer', color: '#f0effe' },
    label: { fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem', color: '#a09ab8' },
};

const kategoriPemasukan = ['Penjualan Produk', 'Pendapatan Lain'];
const kategoriPengeluaran = ['Bahan Baku', 'Operasional', 'Gaji', 'Lainnya'];
const EVENT_OPTIONS = ['Tidak Ada Event', 'Tanggal Kembar Sale', 'Ramadhan', 'Natal', 'Lebaran', 'Harbolnas', 'Flash Sale'];
const METODE_OPTIONS = ['Transfer Bank', 'Tunai', 'QRIS'];

const newsItems = [
    { badge: 'Info Cepat', title: 'AI merekomendasikan promo bundling sekarang', description: 'Tingkatkan omset dengan paket bundling produk terlaris dan diskon ringan.', date: 'Baru saja' },
    { badge: 'Stok Menipis', title: 'Beberapa produk mencapai batas minimum', description: 'Periksa gudang dan restok barang populer agar tidak mengganggu penjualan.', date: '1 jam lalu' },
    { badge: 'Laporan Siap', title: 'Laporan keuangan mingguan tersedia', description: 'Cek ringkasan laba rugi dan cashflow untuk membuat keputusan lebih cepat.', date: 'Kemarin' },
];

function Dashboard() {
    const navigate = useNavigate();
    const [labaRugi, setLabaRugi] = useState(null);
    const [transaksi, setTransaksi] = useState([]);
    const [trenBulanan, setTrenBulanan] = useState(null);
    const [insights, setInsights] = useState([]);
    const [produkList, setProdukList] = useState([]);
    const [carouselIndex, setCarouselIndex] = useState(0);

    const fetchAll = async () => {
        try {
            const [lr, tr, tb, fs, pRes] = await Promise.all([
                getLabaRugi(), getTransaksi(), getTrenBulanan(),
                getFinancialSummary(), getProduk()
            ]);
            if (lr.success) setLabaRugi(lr.data);
            if (tr.success) setTransaksi(tr.data);
            if (tb.success) setTrenBulanan(tb.data);
            if (fs.success && fs.data && fs.data.insights) setInsights(fs.data.insights);
            if (pRes.success) setProdukList(pRes.data || []);
        } catch (err) { console.error('Gagal ambil data:', err); }
    };

    useEffect(() => {
        if (!isLoggedIn()) { navigate('/login'); return; }
        fetchAll();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCarouselIndex(prev => (prev + 1) % newsItems.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const [showModal, setShowModal] = useState(false);
    const [tipe, setTipe] = useState('pemasukan');
    const [jumlah, setJumlah] = useState('');
    const [tanggal, setTanggal] = useState('');
    const [kategori, setKategori] = useState('');
    const [customer, setCustomer] = useState('');
    const [metode, setMetode] = useState('Transfer Bank');
    const [catatan, setCatatan] = useState('');
    const [event, setEvent] = useState('Tidak Ada Event');
    const [idProduk, setIdProduk] = useState('');
    const [qty, setQty] = useState('1');
    const [hargaSatuan, setHargaSatuan] = useState('');
    const [diskon, setDiskon] = useState('0');


    const hitungTotal = (q, h, d) => Math.round((Number(q)||1) * (Number(h)||0) * (1 - (Number(d)||0)/100));

    const handlePilihProduk = (id) => {
        setIdProduk(id);
        const produk = produkList.find(p => String(p.id_produk || p.id) === String(id));
        if (produk) {
            const harga = produk.harga_jual || produk.harga || 0;
            setHargaSatuan(harga);
            setKategori(produk.kategori_produk || produk.kategori || '');
            setJumlah(String(hitungTotal(qty, harga, diskon)));
        }
    };

    // Recalculate total whenever qty/harga/diskon changes
    const updateTotal = (newQty, newHarga, newDiskon) => {
        setJumlah(String(hitungTotal(newQty, newHarga, newDiskon)));
    };

    const produkTersedia = produkList.filter(p => {
        const stok = p.stok_awal !== undefined ? p.stok_awal : (p.stok || 0);
        return stok > 0;
    });

    const handleSimpan = async () => {
        if (!tanggal || !kategori) {
            alert('Lengkapi field tanggal dan kategori!');
            return;
        }

        // Validasi stok
        if (tipe === 'pemasukan' && idProduk) {
            const produk = produkList.find(p => String(p.id_produk || p.id) === String(idProduk));
            if (produk) {
                const stok = produk.stok_awal !== undefined ? produk.stok_awal : (produk.stok || 0);
                if (stok < Number(qty)) {
                    alert(`Stok ${produk.nama_produk || produk.nama} tidak cukup! Tersedia: ${stok}`);
                    return;
                }
            }
        }

        const total = Number(jumlah) || hitungTotal(qty, hargaSatuan, diskon);

        try {
            const res = await tambahTransaksi({
                id_produk: idProduk || null,
                tipe,
                kategori,
                jenis_transaksi: tipe,
                qty: Number(qty) || 1,
                harga_satuan: Number(hargaSatuan) || 0,
                diskon: Number(diskon) || 0,
                total_harga: total,
                jumlah: total,
                tanggal,
                jam_transaksi: new Date().toTimeString().slice(0, 8),
                metode_pembayaran: metode,
                event: event !== 'Tidak Ada Event' ? event : null,
                deskripsi: catatan || customer || '',
                customer,
                status_transaksi: 'selesai',
            });
            if (res.success) {
                alert(`Transaksi ${tipe} Rp ${total.toLocaleString('id-ID')} berhasil disimpan!`);
                setShowModal(false);
                setJumlah(''); setTanggal(''); setKategori('');
                setCustomer(''); setCatatan(''); setIdProduk('');
                setQty('1'); setHargaSatuan(''); setDiskon('0');
                setStrukFile(null); setStrukPreview(null);
                fetchAll();
            } else {
                alert(res.message || 'Gagal menyimpan transaksi');
            }
        } catch (err) {
            alert('Gagal menghubungi server');
        }
    };

    return (
        <div className="dashboard-container">
            <div className="sidebar-area"><Sidebar /></div>
            <div className="main-content">
                <Topbar onInputTransaksi={() => navigate('/keuangan')} />
                <div className="dashboard-body">
                    <StatCard labaRugi={labaRugi} stokData={produkList} />
                    <div className="dashboard-grid">
                        <div className="content-box">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '280px', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700 }}>
                                        <span style={{ width: '0.6rem', height: '0.6rem', borderRadius: '9999px', background: '#10b981' }} />
                                        Berita & Tips Bisnis
                                    </div>
                                    <div style={{ padding: '1.5rem', borderRadius: '1rem', background: '#0f172a', border: '1px solid #22303f', minHeight: '190px' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#a7f3d0', fontSize: '0.75rem', marginBottom: '0.75rem', fontWeight: 700 }}>{newsItems[carouselIndex].badge}</span>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#f8fafc' }}>{newsItems[carouselIndex].title}</h3>
                                        <p style={{ margin: '0.75rem 0 0', color: '#cbd5e1', lineHeight: 1.75 }}>{newsItems[carouselIndex].description}</p>
                                        <p style={{ margin: '1rem 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>{newsItems[carouselIndex].date}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                                    <button onClick={() => setCarouselIndex((carouselIndex - 1 + newsItems.length) % newsItems.length)}
                                        style={{ flex: 1, padding: '0.8rem', background: '#111827', border: '1px solid #172339', borderRadius: '0.75rem', color: '#cbd5e1', cursor: 'pointer' }}>Sebelumnya</button>
                                    <button onClick={() => setCarouselIndex((carouselIndex + 1) % newsItems.length)}
                                        style={{ flex: 1, padding: '0.8rem', background: '#10b981', border: 'none', borderRadius: '0.75rem', color: 'white', cursor: 'pointer' }}>Berikutnya</button>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                    {newsItems.map((_, index) => (
                                        <button key={index} onClick={() => setCarouselIndex(index)}
                                            style={{ width: 10, height: 10, borderRadius: '50%', border: 'none', background: index === carouselIndex ? '#10b981' : '#334155', cursor: 'pointer' }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="content-box"><SmartInsight insights={insights} /></div>
                    </div>
                    <div style={{ marginTop: '1.5rem' }}><TransactionTable transactions={transaksi.slice(-10).reverse()} /></div>
                </div>
            </div>

            {/* Chatbot Button */}
            <button onClick={() => navigate('/chatbot')}
                style={{ position: 'fixed', bottom: '2rem', right: '2rem', width: 60, height: 60, borderRadius: '50%', background: '#1e293b', border: '2px solid #334155', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, transition: '0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#10b981'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#334155'}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="7" width="18" height="13" rx="3" fill="#064e3b"/>
                    <rect x="9" y="3" width="6" height="4" rx="1" fill="#064e3b"/>
                    <circle cx="8.5" cy="13" r="1.5" fill="white"/>
                    <circle cx="15.5" cy="13" r="1.5" fill="white"/>
                    <rect x="9" y="16" width="6" height="1.5" rx="0.75" fill="white"/>
                    <circle cx="12" cy="2.5" r="1" fill="#10b981"/>
                </svg>
            </button>

            {/* Modal Input Transaksi */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={D.modal}>
                        {/* Header */}
                        <div style={D.header}>
                            <h3 style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>Input Transaksi</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                            {/* Kiri */}
                            <div style={{ padding: '1.5rem', borderRight: '1px solid #334155' }}>
                                {/* Toggle Tipe */}
                                <div style={{ display: 'flex', background: '#0f172a', borderRadius: '0.75rem', padding: '0.25rem', marginBottom: '1.25rem', border: '1px solid #334155' }}>
                                    {['pemasukan', 'pengeluaran'].map(t => (
                                        <button key={t} onClick={() => { setTipe(t); setKategori(''); setIdProduk(''); }}
                                            style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', transition: '0.2s',
                                                background: tipe === t ? (t === 'pemasukan' ? '#10b981' : '#ef4444') : 'transparent',
                                                color: tipe === t ? 'white' : '#4a4460' }}>
                                            {t === 'pemasukan' ? '↑ Pemasukan' : '↓ Pengeluaran'}
                                        </button>
                                    ))}
                                </div>

                                {/* Pilih Produk (hanya pemasukan) */}
                                {tipe === 'pemasukan' && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={D.label}>Produk {produkTersedia.length === 0 && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>(Stok habis semua!)</span>}</label>
                                        <div style={D.field}>
                                            <Package size={16} color="#94a3b8" />
                                            <select value={idProduk} onChange={e => handlePilihProduk(e.target.value)} style={{ ...D.selectInner, colorScheme: 'dark' }}>
                                                <option value="">Pilih Produk (opsional)</option>
                                                {produkTersedia.map(p => {
                                                    const s = p.stok_awal !== undefined ? p.stok_awal : (p.stok || 0);
                                                    return <option key={p.id_produk || p.id} value={p.id_produk || p.id} style={{ background: '#1e293b' }}>
                                                        {p.nama_produk || p.nama} (Stok: {s})
                                                    </option>;
                                                })}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* Qty & Harga Satuan */}
                                {tipe === 'pemasukan' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                        <div>
                                            <label style={D.label}>Qty</label>
                                            <div style={D.field}>
                                                <input type="number" min="1" value={qty}
                                                    onChange={e => { setQty(e.target.value); updateTotal(e.target.value, hargaSatuan, diskon); }}
                                                    style={D.inputInner} />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={D.label}>Harga Satuan (Rp)</label>
                                            <div style={D.field}>
                                                <input type="number" min="0" value={hargaSatuan}
                                                    onChange={e => { setHargaSatuan(e.target.value); updateTotal(qty, e.target.value, diskon); }}
                                                    placeholder="0" style={D.inputInner} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Total / Diskon */}
                                <div style={{ display: 'grid', gridTemplateColumns: tipe === 'pemasukan' ? '2fr 1fr' : '1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={D.label}>Total Harga (Rp)</label>
                                        <div style={{ background: '#0f172a', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #334155' }}>
                                            <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600 }}>Rp</span>
                                            <input type="number" value={jumlah} onChange={e => setJumlah(e.target.value)} placeholder="0"
                                                style={{ border: 'none', background: 'none', fontSize: '1.2rem', fontWeight: 700, flex: 1, outline: 'none', color: tipe === 'pemasukan' ? '#10b981' : '#ef4444' }} />
                                        </div>
                                    </div>
                                    {tipe === 'pemasukan' && (
                                        <div>
                                            <label style={D.label}>Diskon (%)</label>
                                            <div style={D.field}>
                                                <input type="number" min="0" max="100" value={diskon}
                                                    onChange={e => { setDiskon(e.target.value); updateTotal(qty, hargaSatuan, e.target.value); }}
                                                    placeholder="0" style={D.inputInner} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Tanggal & Kategori */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={D.label}>Tanggal</label>
                                        <div style={D.field}>
                                            <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} style={{ ...D.inputInner, colorScheme: 'dark' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={D.label}>Kategori</label>
                                        <div style={D.field}>
                                            <select value={kategori} onChange={e => setKategori(e.target.value)} style={{ ...D.selectInner, colorScheme: 'dark' }}>
                                                <option value="" style={{ background: '#1e293b' }}>Pilih kategori</option>
                                                {(tipe === 'pemasukan' ? kategoriPemasukan : kategoriPengeluaran).map(k => <option key={k} style={{ background: '#1e293b' }}>{k}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer & Metode */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={D.label}>Customer / Vendor</label>
                                        <div style={D.field}>
                                            <input value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Nama pelanggan..." style={D.inputInner} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={D.label}>Metode Pembayaran</label>
                                        <div style={D.field}>
                                            <select value={metode} onChange={e => setMetode(e.target.value)} style={{ ...D.selectInner, colorScheme: 'dark' }}>
                                                {METODE_OPTIONS.map(m => <option key={m} style={{ background: '#1e293b' }}>{m}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Event */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={D.label}>Event / Promo</label>
                                    <div style={D.field}>
                                        <select value={event} onChange={e => setEvent(e.target.value)} style={{ ...D.selectInner, colorScheme: 'dark' }}>
                                            {EVENT_OPTIONS.map(ev => <option key={ev} style={{ background: '#1e293b' }}>{ev}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Catatan */}
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={D.label}>Catatan (Opsional)</label>
                                    <textarea value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Tambahkan deskripsi singkat..."
                                        style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '0.6rem', fontSize: '0.8rem', outline: 'none', resize: 'none', height: 60, boxSizing: 'border-box', color: '#f1f5f9' }} />
                                </div>

                                {/* Tombol */}
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button onClick={handleSimpan} style={{ flex: 1, background: tipe === 'pemasukan' ? '#10b981' : '#ef4444', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                                        Simpan Transaksi
                                    </button>
                                    <button onClick={() => setShowModal(false)} style={{ padding: '0.875rem 1.25rem', background: '#334155', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 600, color: '#cbd5e1' }}>
                                        Batal
                                    </button>
                                </div>
                            </div>

                            {/* Kanan — Info Stok & Tips */}
                            <div style={{ padding: '1.5rem' }}>

                                {/* Info stok warning */}
                                {tipe === 'pemasukan' && idProduk && (() => {
                                    const produk = produkList.find(p => String(p.id_produk || p.id) === String(idProduk));
                                    if (!produk) return null;
                                    const stok = produk.stok_awal !== undefined ? produk.stok_awal : (produk.stok || 0);
                                    const qtyNum = Number(qty) || 1;
                                    const cukup = stok >= qtyNum;
                                    return (
                                        <div style={{ background: cukup ? '#064e3b' : 'rgba(239,68,68,0.1)', borderRadius: '0.75rem', padding: '1rem', border: `1px solid ${cukup ? '#10b981' : '#ef4444'}`, marginBottom: '1rem' }}>
                                            <p style={{ margin: '0 0 0.25rem', fontWeight: 700, color: cukup ? 'white' : '#ef4444', fontSize: '0.8rem' }}>
                                                {cukup ? '✅ Stok Tersedia' : '⚠️ Stok Tidak Cukup!'}
                                            </p>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: cukup ? '#a7f3d0' : '#fca5a5', lineHeight: 1.5 }}>
                                                Stok {produk.nama_produk || produk.nama}: <strong>{stok}</strong> | Qty order: <strong>{qtyNum}</strong>
                                                {!cukup && ' — Kurangi qty atau restok dulu!'}
                                            </p>
                                        </div>
                                    );
                                })()}

                                <div style={{ background: '#064e3b', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #10b981' }}>
                                    <p style={{ margin: '0 0 0.25rem', fontWeight: 700, color: 'white', fontSize: '0.8rem' }}><Sparkles size={14} style={{ display: 'inline', marginRight: '0.4rem' }} /> Analisis Cerdas</p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#a7f3d0', lineHeight: 1.5 }}>Input yang akurat membantu MoneyTOR memberikan proyeksi arus kas 3 bulan kedepan dengan akurasi 95%.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
