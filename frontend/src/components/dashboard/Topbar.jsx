import { useState, useEffect } from 'react';
import { Bell, X, AlertCircle, CheckCircle, FileText, Mail, Phone, MapPin, Shield, BarChart3, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProfil, isLoggedIn } from '../../api';

const checklistAwal = [
    { done: true, judul: 'NIB (Nomor Induk Berusaha)', desc: 'Identitas wajib untuk legalitas usaha.' },
    { done: true, judul: 'NPWP Usaha/Pribadi', desc: 'Untuk urusan pelaporan pajak bisnis.' },
    { done: false, judul: 'Surat Izin Tempat Usaha (SITU)', desc: 'Bukti izin lokasi usaha.' },
    { done: false, judul: 'Sertifikat Halal / BPOM', desc: 'Jika usahanya di bidang makanan/minuman.' },
    { done: false, judul: 'Akta Pendirian', desc: 'Jika UMKM sudah berbentuk CV atau PT.' },
];

function Topbar({ onInputTransaksi }) {
    const [showNotif, setShowNotif] = useState(false);
    const [showProfil, setShowProfil] = useState(false);
    const [checklist, setChecklist] = useState(checklistAwal);
    const [profil, setProfil] = useState({ nama: '', role: '', email: '', wa: '', lokasi: '' });
    // FIX: Tambah state fotoUrl untuk foto profil dari localStorage
    const [fotoUrl, setFotoUrl] = useState(null);

    // State Pengaturan Notifikasi (On/Off)
    const [notifSettings, setNotifSettings] = useState({ stokMenipis: true, laporanMingguan: false, pengeluaranBesar: false });

    // State Baru: Data Notifikasi Dinamis (Kosong by default untuk akun baru)
    const [notifikasiList, setNotifikasiList] = useState([]);

    const location = useLocation();
    const isDashboard = location.pathname === '/dashboard';
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('moneytor_notif_settings'));
            if (stored) setNotifSettings(stored);
        } catch (err) {
            console.error('Gagal baca pengaturan notifikasi:', err);
        }
    }, []);

    useEffect(() => {
        if (!isLoggedIn()) return;

        // 1. Fetch Data Profil
        const fetchProfil = async () => {
            try {
                const res = await getProfil();
                if (res.success && res.data) {
                    const loadedProfil = {
                        nama: res.data.nama_pemilik || 'Budi Sutomo',
                        role: res.data.jabatan || 'Owner',
                        email: res.data.email || 'kelontong@toko.com',
                        wa: res.data.no_telepon || '+62 812-3456-7890',
                        lokasi: res.data.lokasi_usaha || 'Jakarta Selatan'
                    };
                    setProfil(loadedProfil);
                    // FIX: Baca foto profil dari localStorage, di dalam blok yang sama
                    // setelah setProfil, bukan di luar fungsi
                    if (res.data.email) {
                        const savedFoto = localStorage.getItem(`fotoProfile_${res.data.email}`);
                        if (savedFoto) setFotoUrl(savedFoto);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };

        // 2. Simulasi Fetch Data Notifikasi (Misal cek dari tabel Stok Backend)
        const fetchNotifikasi = async () => {
            try {
                // Di sini nanti kamu panggil API getStok() dari backend.
                // Karena ini akun baru, kita simulasikan data dari backend MASIH KOSONG ([]).
                const dataStokDariBackend = [];

                /* CONTOH LOGIKA KALAU ADA DATA STOK:
                const stokMenipis = dataStokDariBackend.filter(item => item.stok <= item.min_stok);
                if (stokMenipis.length > 0) {
                    setNotifikasiList(prev => [...prev, {
                        id: 'notif-1',
                        key: 'stokMenipis',
                        icon: 'warning',
                        bg: '#fef3c7',
                        judul: 'Peringatan Stok',
                        isi: `Ada ${stokMenipis.length} produk yang stoknya sudah di bawah batas minimum!`,
                        waktu: 'Baru saja',
                        aksi: 'Restok Sekarang →',
                        link: '/stok' // Link redirect kalau notif di-klik
                    }]);
                }
                */

                // Untuk sementara set kosong agar titik merah hilang
                setNotifikasiList([]);
            } catch (err) {
                console.error(err);
            }
        };

        fetchProfil();
        fetchNotifikasi();
    }, []);

    const toggleChecklist = (i) => {
        const baru = [...checklist];
        baru[i] = { ...baru[i], done: !baru[i].done };
        setChecklist(baru);
    };

    const handleFoto = (e) => {
        const file = e.target.files[0];
        if (file) console.log('Upload foto feature - akan diimplementasikan di Settings');
    };

    // Function untuk refresh data profil dari API
    const refreshProfil = async () => {
        try {
            const res = await getProfil();
            if (res.success && res.data) {
                const loadedProfil = {
                    nama: res.data.nama_pemilik || 'Budi Sutomo',
                    role: res.data.jabatan || 'Owner',
                    email: res.data.email || 'kelontong@toko.com',
                    wa: res.data.no_telepon || '+62 812-3456-7890',
                    lokasi: res.data.lokasi_usaha || 'Jakarta Selatan'
                };
                setProfil(loadedProfil);
                // FIX: Baca foto di dalam blok if, bukan di luar try/catch
                if (res.data.email) {
                    const savedFoto = localStorage.getItem(`fotoProfile_${res.data.email}`);
                    if (savedFoto) setFotoUrl(savedFoto);
                }
            }
        } catch (err) {
            console.error('Gagal refresh profil:', err);
        }
    };

    // Listen for profile updates from Settings page
    useEffect(() => {
        const handleProfileUpdate = () => {
            refreshProfil();
            // Re-baca foto dari localStorage saat ada update dari Settings
            const currentEmail = profil.email;
            if (currentEmail) {
                const savedFoto = localStorage.getItem(`fotoProfile_${currentEmail}`);
                setFotoUrl(savedFoto || null);
            }
        };
        window.addEventListener('profileUpdated', handleProfileUpdate);
        return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
    }, [profil.email]);

    // Fungsi Kosongkan Notifikasi
    const tandaiSemuaDibaca = () => {
        setNotifikasiList([]);
    };

    const terverifikasi = checklist.filter(c => c.done).length;

    // Filter notifikasi sesuai settingan user (apakah dihidupkan/dimatikan)
    const notifAktif = notifikasiList.filter(n => notifSettings[n.key]);

    return (
        <>
            <header className="topbar">
                <div className="topbar-left">
                    <h2>{isDashboard ? 'Ringkasan Bisnis' : location.pathname === '/keuangan' ? 'Keuangan' : location.pathname === '/stok' ? 'Manajemen Stok' : location.pathname === '/laporan' ? 'Laporan Keuangan' : location.pathname === '/chatbot' ? 'AI Assistant' : location.pathname === '/settings' ? 'Pengaturan' : 'MoneyTor'}</h2>
                    <p>Selamat pagi, {profil.nama.split(' ')[0]}. Berikut adalah performa keuangan Anda hari ini.</p>
                </div>

                <div className="topbar-right">
                    {isDashboard && (
                        <button className="btn-input" onClick={onInputTransaksi}>+ Input Transaksi</button>
                    )}

                    {/* Bell */}
                    <div style={{ position: 'relative' }}>
                        <button onClick={() => { setShowNotif(!showNotif); setShowProfil(false); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '0.5rem' }}>
                            <Bell size={22} color="#5c566e" />
                            {/* Titik Merah hanya muncul kalau ada notifikasi aktif */}
                            {notifAktif.length > 0 && (
                                <span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, background: '#ef4444', borderRadius: '50%', fontSize: '0.6rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                    {notifAktif.length}
                                </span>
                            )}
                        </button>

                        {showNotif && (
                            <div style={{ position: 'absolute', right: 0, top: '120%', width: 360, background: '#111111', borderRadius: '1rem', boxShadow: '0 10px 40px rgba(0,0,0,0.7)', border: '1px solid #222222', zIndex: 999 }}>
                                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #222222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontWeight: 700 }}>Notifikasi</span>
                                        {notifAktif.length > 0 && (
                                            <span style={{ background: '#10b981', color: 'white', borderRadius: '9999px', padding: '0.1rem 0.5rem', fontSize: '0.7rem', fontWeight: 700 }}>{notifAktif.length} Aktif</span>
                                        )}
                                    </div>
                                    {/* Tombol Clear All / Tandai Dibaca */}
                                    {notifAktif.length > 0 && (
                                        <span onClick={tandaiSemuaDibaca} style={{ fontSize: '0.75rem', color: '#10b981', cursor: 'pointer', fontWeight: 600 }}>Tandai semua dibaca</span>
                                    )}
                                </div>

                                {/* Kondisi Jika Data Notifikasi Kosong */}
                                {notifAktif.length === 0 ? (
                                    <div style={{ padding: '2.5rem 1.5rem', color: '#5c566e', textAlign: 'center' }}>
                                        <CheckCircle size={32} color="#10b981" style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                                        <p style={{ margin: 0, fontSize: '0.875rem' }}>Belum ada notifikasi baru.<br />Semua aktivitas UMKM kamu aman!</p>
                                    </div>
                                ) : notifAktif.map((n, i) => (
                                    <div key={n.id || i} style={{ padding: '1rem 1.25rem', borderBottom: i < notifAktif.length - 1 ? '1px solid #1a1a1a' : 'none', display: 'flex', gap: '0.75rem' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: n.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {n.icon === 'warning' && <AlertCircle size={20} color="#f59e0b" />}
                                            {n.icon === 'check' && <CheckCircle size={20} color="#10b981" />}
                                            {n.icon === 'file' && <FileText size={20} color="#ef4444" />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{n.judul}</span>
                                                <span style={{ fontSize: '0.7rem', color: '#4a4460' }}>{n.waktu}</span>
                                            </div>
                                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#5c566e' }}>{n.isi}</p>

                                            {/* Teks Aksi & Logic Navigate Redirect */}
                                            {n.aksi && (
                                                <span
                                                    onClick={() => {
                                                        setShowNotif(false); // Tutup popup lonceng
                                                        if (n.link) navigate(n.link); // Pindah halaman
                                                    }}
                                                    style={{ display: 'inline-block', marginTop: '0.3rem', fontSize: '0.75rem', color: '#10b981', fontWeight: 600, cursor: 'pointer' }}
                                                >
                                                    {n.aksi}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {notifAktif.length > 0 && (
                                    <div style={{ padding: '0.875rem', textAlign: 'center', borderTop: '1px solid #1a1a1a' }}>
                                        <span style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', color: '#94a3b8' }}>Lihat Riwayat Lintas</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Avatar — FIX: render foto dari localStorage kalau ada, fallback ke DiceBear */}
                    <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                        onClick={() => { setShowProfil(true); setShowNotif(false); }}>
                        <div className="user-info">
                            <p className="user-name">{profil.nama}</p>
                            <p className="user-role">{profil.role}</p>
                        </div>
                        <div className="avatar">
                            {fotoUrl
                                ? <img src={fotoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                : <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Budi" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            }
                        </div>
                    </div>
                </div>
            </header>

            {/* Overlay tutup notif */}
            {showNotif && <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setShowNotif(false)} />}

            {/* Modal Profil Fullscreen */}
            {showProfil && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                    <div style={{ background: '#111111', borderRadius: '1.25rem', width: '100%', maxWidth: 860, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
                        {/* Header */}
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #222222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#111111', zIndex: 1 }}>
                            <div>
                                <h3 style={{ margin: 0, fontWeight: 700 }}>Profil Bisnis</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>View Only - Edit di Pengaturan</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => { setShowProfil(false); navigate('/settings'); }}
                                    style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Settings size={16} />
                                    Edit Profil
                                </button>
                                <button onClick={() => { setShowProfil(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#6b7280" /></button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 0 }}>
                            {/* Kiri */}
                            <div style={{ padding: '1.5rem', borderRight: '1px solid #222222' }}>
                                {/* Foto — FIX: render foto dari localStorage kalau ada, fallback ke DiceBear */}
                                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                                    <div style={{ position: 'relative', width: 90, height: 90, margin: '0 auto 0.75rem' }}>
                                        <div style={{ width: 90, height: 90, borderRadius: '50%', border: '2px solid #10b981', overflow: 'hidden', background: '#1a1a1a' }}>
                                            {fotoUrl
                                                ? <img src={fotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                : <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Budi" alt="" style={{ width: '100%' }} />
                                            }
                                        </div>
                                    </div>

                                    <p style={{ margin: 0, fontWeight: 700 }}>{profil.nama}</p>
                                    <p style={{ margin: '0.2rem 0', fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>{profil.role}</p>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                                        <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', fontSize: '0.65rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontWeight: 700 }}>UMKM Platinum</span>
                                        <span style={{ background: 'rgba(255,255,255,0.05)', color: '#a09ab8', fontSize: '0.65rem', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>Retail</span>
                                    </div>
                                </div>

                                {/* Info kontak */}
                                {[['mail', 'Email Bisnis', 'email'], ['phone', 'WhatsApp', 'wa'], ['map', 'Lokasi', 'lokasi']].map(([ic, label, key]) => (
                                    <div key={key} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.875rem', alignItems: 'flex-start' }}>
                                        <div style={{ marginTop: '0.125rem' }}>
                                            {ic === 'mail' && <Mail size={16} color="#a09ab8" />}
                                            {ic === 'phone' && <Phone size={16} color="#a09ab8" />}
                                            {ic === 'map' && <MapPin size={16} color="#a09ab8" />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontSize: '0.65rem', color: '#4a4460' }}>{label}</p>
                                            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600 }}>{profil[key]}</p>
                                        </div>
                                    </div>
                                ))}

                                <div style={{ background: '#0f0a1a', borderRadius: '0.75rem', padding: '1rem', marginTop: '0.75rem' }}>
                                    <p style={{ margin: '0 0 0.4rem', fontSize: '0.7rem', color: '#a7f3d0', fontStyle: 'italic' }}>&quot;Lengkapi profil untuk analisis lebih akurat.&quot;</p>
                                    <button onClick={() => navigate('/chatbot')} style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: 'none', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, width: '100%' }}>Tanya AI Lebih Lanjut →</button>
                                </div>
                            </div>

                            {/* Kanan — Checklist */}
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <h5 style={{ margin: 0, fontWeight: 700 }}>Checklist Kelengkapan Usaha</h5>
                                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#5c566e' }}>Lengkapi dokumen untuk memperkuat legalitas bisnismu</p>
                                    </div>
                                    <div style={{ background: 'rgba(16,185,129,0.12)', borderRadius: '0.75rem', padding: '0.5rem 1rem', textAlign: 'center', flexShrink: 0 }}>
                                        <p style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem', color: '#f0effe' }}>{terverifikasi} / {checklist.length}</p>
                                        <p style={{ margin: 0, fontSize: '0.6rem', color: '#10b981', fontWeight: 700 }}>TERVERIFIKASI</p>
                                    </div>
                                </div>

                                {checklist.map((item, i) => (
                                    <div key={i} onClick={() => toggleChecklist(i)}
                                        style={{ display: 'flex', gap: '0.875rem', padding: '1rem', borderBottom: '1px solid #1a1a1a', alignItems: 'center', cursor: 'pointer', borderRadius: '0.5rem', transition: '0.15s', background: '#111111' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#141414'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#111111'}>
                                        <div style={{ width: 22, height: 22, borderRadius: '0.4rem', border: item.done ? 'none' : '2px solid #2a2a2a', background: item.done ? '#10b981' : '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: '0.2s' }}>
                                            {item.done && <CheckCircle size={16} color="white" />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? '#f0effe' : '#f0effe' }}>{item.judul}</p>
                                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#4a4460' }}>{item.desc}</p>
                                        </div>
                                        <span style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', borderRadius: '0.3rem', background: item.done ? 'rgba(16,185,129,0.15)' : '#1a1a1a', color: item.done ? '#f0effe' : '#5c566e', fontWeight: 700, flexShrink: 0 }}>
                                            {item.done ? 'COMPLETED' : 'PENDING'}
                                        </span>
                                    </div>
                                ))}

                                <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '0.75rem', padding: '0.875rem 1rem', marginTop: '1rem', textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#10b981' }}>Lengkapi semua dokumen untuk mendapatkan akses fitur <strong>MoneyTOR Pro</strong> secara gratis!</p>
                                </div>

                                {/* Status & Keamanan */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                    <div style={{ border: '1px solid #222222', borderRadius: '0.75rem', padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <BarChart3 size={18} color="#10b981" />
                                            <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Status Verifikasi</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#5c566e' }}>ID Verifikasi</span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>MT-8829-LW</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#5c566e' }}>Tier Keanggotaan</span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Gold Partner</span>
                                        </div>
                                        <div style={{ height: 6, background: '#1a1a1a', borderRadius: 9999 }}>
                                            <div style={{ width: `${(terverifikasi / checklist.length) * 100}%`, height: '100%', background: '#10b981', borderRadius: 9999, transition: '0.4s' }} />
                                        </div>
                                    </div>

                                    <div style={{ border: '1px solid #222222', borderRadius: '0.75rem', padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <Shield size={18} color="#10b981" />
                                            <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Keamanan Akun</span>
                                        </div>
                                        {[['check', '2FA Aktif (SMS)'], ['check', 'Login Biometrik Aktif'], ['circle', 'Kunci Email Recovery']].map(([ic, label], i) => (
                                            <p key={i} style={{ margin: '0.35rem 0', fontSize: '0.75rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                {ic === 'check' && <CheckCircle size={14} color="#10b981" />}
                                                {ic === 'circle' && <AlertCircle size={14} color="#94a3b8" />}
                                                {label}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Topbar;