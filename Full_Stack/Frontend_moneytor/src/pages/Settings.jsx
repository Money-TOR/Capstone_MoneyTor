import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import { useNavigate } from 'react-router-dom';
import { getProfil, logout, isLoggedIn, getStokRendah, updateProfil } from '../api';
import AvatarEditor from 'react-avatar-editor';
import '../styles/Dashboard.css';

function Settings() {
    // Profil Usaha
    const [namaUsaha, setNamaUsaha]       = useState('');
    const [jenisUsaha, setJenisUsaha]     = useState('Perdagangan');
    const [alamatUsaha, setAlamatUsaha]   = useState('');
    
    // Profil Pengguna
    const [nama, setNama]                 = useState('');
    const [email, setEmail]               = useState('');
    const [noTelepon, setNoTelepon]       = useState('');
    const [jabatan, setJabatan]           = useState('');
    const [fotoUrl, setFotoUrl]           = useState(null);
    const fotoRef = useRef();

    // --- State & Ref buat fitur Potong Foto ---
    const [tempFile, setTempFile]         = useState(null); 
    const [zoom, setZoom]                 = useState(1); 
    const [showCropModal, setShowCropModal]= useState(false); 
    const editorRef = useRef(null);

    // Notifikasi
    const NOTIF_KEY = 'moneytor_notif_settings';
    const defaultNotif = { stokMenipis: true, laporanMingguan: false, pengeluaranBesar: false };
    const [notif, setNotif] = useState(() => {
        try { return JSON.parse(localStorage.getItem(NOTIF_KEY)) || defaultNotif; }
        catch { return defaultNotif; }
    });

    // UI state
    const [saved, setSaved]               = useState(false);
    const [saveError, setSaveError]       = useState('');
    const [loading, setLoading]           = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn()) { navigate('/login'); return; }
        const load = async () => {
            try {
                const res = await getProfil();
                if (res.success && res.data) {
                    const d = res.data;
                    setNamaUsaha(d.nama_usaha || '');
                    setJenisUsaha(d.jenis_usaha || 'Perdagangan');
                    setAlamatUsaha(d.lokasi_usaha || d.alamat_usaha || '');
                    setNama(d.nama_pemilik || d.nama || '');
                    setEmail(d.email || '');
                    setNoTelepon(d.no_telepon || '');
                    setJabatan(d.jabatan || 'Owner');

                    // Cek foto di localStorage pas pertama kali buka
                    if (d.email) {
                        const savedFoto = localStorage.getItem(`fotoProfile_${d.email}`);
                        if (savedFoto) {
                            setFotoUrl(savedFoto);
                        }
                    }
                }
            } catch (err) { console.error(err); }
        };
        load();
    }, [navigate]);

    useEffect(() => {
        localStorage.setItem(NOTIF_KEY, JSON.stringify(notif));
        if (notif.stokMenipis) {
            checkStokMenipis();
        }
    }, [notif.stokMenipis]);

    const checkStokMenipis = async () => {
        try {
            const res = await getStokRendah();
            const items = res.data || res;
            if (Array.isArray(items) && items.length > 0) {
                const names = items.slice(0, 3).map(p => p.nama_produk || p.nama).join(', ');
                const pesan = `⚠️ Stok menipis: ${names}${items.length > 3 ? ` dan ${items.length - 3} lainnya` : ''}`;
                if ('Notification' in window) {
                    if (Notification.permission === 'granted') {
                        new Notification('MoneyTOR – Peringatan Stok', { body: pesan, icon: '/favicon.svg' });
                    } else if (Notification.permission !== 'denied') {
                        Notification.requestPermission().then(p => {
                            if (p === 'granted') new Notification('MoneyTOR – Peringatan Stok', { body: pesan, icon: '/favicon.svg' });
                        });
                    }
                }
            }
        } catch (err) { console.error('Gagal cek stok:', err); }
    };

    const toggleNotif = (key) => {
        setNotif(prev => {
            const next = { ...prev, [key]: !prev[key] };
            localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
            if (key === 'stokMenipis' && next.stokMenipis) {
                setTimeout(() => checkStokMenipis(), 300);
            }
            return next;
        });
    };

    // 🌟 PERBAIKAN DI SINI: Proses simpan data teks ke database
    const handleSave = async () => {
        setLoading(true);
        setSaveError('');
        try {
            const payload = {
                nama_usaha:   namaUsaha,
                jenis_usaha:  jenisUsaha,
                lokasi_usaha: alamatUsaha, // Jika di API backend-mu namanya 'alamat_usaha', ganti key ini menjadi 'alamat_usaha'
                nama_pemilik: nama,        // Jika di API backend-mu namanya 'nama', ganti key ini menjadi 'nama'
                no_telepon:   noTelepon,
                jabatan:      jabatan || 'Owner',
            };

            const res = await updateProfil(payload);
            console.log("Respon dari server:", res); // Membantu cek isi respon backend di Console F12

            if (res && (res.success || res.status === 'success' || res.data)) {
                setSaved(true);
                window.dispatchEvent(new Event('profileUpdated'));
                setTimeout(() => setSaved(false), 2500);
            } else {
                setSaveError(res.message || 'Gagal menyimpan ke database. Periksa format data.');
            }
        } catch (err) {
            console.error("Error saat menyimpan:", err);
            setSaveError('Terjadi kesalahan koneksi atau internal server.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeluar = () => { if (window.confirm('Yakin ingin keluar?')) logout(); };

    const handleFoto = (e) => { 
        const f = e.target.files[0]; 
        if (f) {
            setTempFile(f); 
            setShowCropModal(true); 
            e.target.value = ''; 
        } 
    };

    const saveCroppedImage = () => {
        if (editorRef.current) {
            const canvas = editorRef.current.getImageScaledToCanvas();
            const base64String = canvas.toDataURL('image/jpeg', 0.7); 
            setFotoUrl(base64String); 
            if (email) {
                localStorage.setItem(`fotoProfile_${email}`, base64String);
            }
            setShowCropModal(false);
            setTempFile(null);
            setZoom(1); 
        }
    };

    const box        = { background: '#111111', borderRadius: '0.75rem', border: '1px solid #222222', padding: '1.5rem', marginBottom: '1.5rem' };
    const inputStyle = { width: '100%', padding: '0.6rem 0.9rem', borderRadius: '0.5rem', border: '1px solid #222222', fontSize: '0.875rem', outline: 'none', marginTop: '0.25rem', boxSizing: 'border-box', background: '#0a0a0a', color: '#f0effe' };
    const labelStyle = { fontSize: '0.875rem', fontWeight: 600, color: '#a09ab8' };

    const modalStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, color: 'white' };
    const modalContentStyle = { background: '#111', padding: '2rem', borderRadius: '1rem', border: '1px solid #222', textAlign: 'center' };

    const notifItems = [
        { key: 'stokMenipis',  title: 'Peringatan stok menipis',      desc: 'Kirim notifikasi jika stok barang kurang dari batas minimum' },
        { key: 'laporanMingguan',  title: 'Laporan mingguan',             desc: 'Kirim ringkasan keuangan setiap akhir pekan' },
        { key: 'pengeluaranBesar', title: 'Peringatan pengeluaran besar', desc: 'Notifikasi jika ada transaksi pengeluaran di atas Rp 1.000.000' },
    ];

    return (
        <div className="dashboard-container">
            <div className="sidebar-area"><Sidebar /></div>
            <div className="main-content">
                <Topbar />
                <div className="dashboard-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ color: '#f0effe' }}>Pengaturan</h2>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            {saved && <div style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '0.5rem 1.25rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem', border: '1px solid rgba(16,185,129,0.4)' }}>✓ Tersimpan!</div>}
                            {saveError && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.5rem 1.25rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem', border: '1px solid rgba(239,68,68,0.4)' }}>{saveError}</div>}
                            <button onClick={handleKeluar}
                                style={{ padding: '0.6rem 1.25rem', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '0.5rem', color: '#ef4444', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
                                 Keluar
                            </button>
                        </div>
                    </div>

                    {/* Profil Usaha */}
                    <div style={box}>
                        <h5 style={{ margin: '0 0 1.25rem', fontWeight: 700, color: '#f0effe' }}> Profil Usaha</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Nama Usaha</label>
                                <input style={inputStyle} value={namaUsaha} onChange={e => setNamaUsaha(e.target.value)} placeholder="Nama toko / usaha" />
                            </div>
                            <div>
                                <label style={labelStyle}>Jenis Usaha</label>
                                <select style={inputStyle} value={jenisUsaha} onChange={e => setJenisUsaha(e.target.value)}>
                                    <option>Perdagangan</option>
                                    <option>Jasa</option>
                                    <option>Manufaktur</option>
                                    <option>Kuliner</option>
                                    <option>F&B</option>
                                    <option>Umum</option>
                                </select>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Alamat Usaha</label>
                                <input style={inputStyle} value={alamatUsaha} onChange={e => setAlamatUsaha(e.target.value)} placeholder="Jl. Contoh No. 1, Kota" />
                            </div>
                        </div>
                    </div>

                    {/* Profil Pengguna */}
                    <div style={box}>
                        <h5 style={{ margin: '0 0 1.25rem', fontWeight: 700, color: '#f0effe' }}> Profil Pengguna</h5>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ position: 'relative', width: 70, height: 70, flexShrink: 0 }}>
                                <div style={{ width: 70, height: 70, borderRadius: '50%', background: '#0f0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.75rem', fontWeight: 700, border: '2px solid #10b981', overflow: 'hidden' }}>
                                    {fotoUrl ? <img src={fotoUrl} alt="foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (nama.charAt(0) || '?')}
                                </div>
                            </div>
                            <div>
                                <button onClick={() => fotoRef.current.click()}
                                    style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #222222', background: '#0a0a0a', color: '#a09ab8', cursor: 'pointer', fontSize: '0.875rem' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#10b981'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = '#222222'}>
                                     Ubah Foto
                                </button>
                                <input ref={fotoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFoto} />
                                <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: '#5c566e' }}>JPG, PNG. Bebas ukuran</p>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Nama Lengkap</label>
                                <input style={inputStyle} value={nama} onChange={e => setNama(e.target.value)} placeholder="Nama pemilik" />
                            </div>
                            <div>
                                <label style={labelStyle}>Email</label>
                                <input style={{...inputStyle, background: '#0a0a0a', opacity: 0.6, cursor: 'not-allowed', borderColor: '#1a1a1a'}} value={email} readOnly placeholder="email@contoh.com"
                                    title="Email tidak dapat diubah - hubungi admin untuk mengubah email"
                                    onFocus={e => e.currentTarget.blur()} />
                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.7rem', color: '#5c566e' }}>✓ Email tidak dapat diubah untuk keamanan</p>
                            </div>
                            <div>
                                <label style={labelStyle}>No. Telepon / WhatsApp</label>
                                <input type="tel" style={inputStyle} value={noTelepon} onChange={e => setNoTelepon(e.target.value)} placeholder="08xxxxxxxxxx" autoComplete="tel" />
                            </div>
                            <div>
                                <label style={labelStyle}>Jabatan / Peran</label>
                                <input style={inputStyle} value={jabatan} onChange={e => setJabatan(e.target.value)} placeholder="Pemilik / Manager / Kasir" autoComplete="organization-title" />
                            </div>
                        </div>
                    </div>

                    {/* Notifikasi */}
                    <div style={box}>
                        <h5 style={{ margin: '0 0 0.5rem', fontWeight: 700, color: '#f0effe' }}> Notifikasi</h5>
                        <p style={{ margin: '0 0 1.25rem', fontSize: '0.75rem', color: '#5c566e' }}>Izinkan notifikasi browser agar peringatan muncul secara langsung.</p>
                        {notifItems.map(({ key, title, desc }, i) => (
                            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: i < notifItems.length - 1 ? '1px solid #222222' : 'none' }}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#f0effe' }}>{title}</p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#5c566e' }}>{desc}</p>
                                </div>
                                <div onClick={() => toggleNotif(key)}
                                    style={{ width: 44, height: 24, borderRadius: 12, background: notif[key] ? '#10b981' : '#334155', cursor: 'pointer', position: 'relative', transition: '0.3s', flexShrink: 0 }}>
                                    <div style={{ width: 18, height: 18, background: '#111111', borderRadius: '50%', position: 'absolute', top: 3, left: notif[key] ? 23 : 3, transition: '0.3s' }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="btn-input" onClick={handleSave} disabled={loading}
                        style={{ padding: '0.75rem 2rem', fontSize: '0.9rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                        {loading ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                    </button>
                </div>
            </div>

            {/* --- Modal / Popup Buat Crop Foto --- */}
            {showCropModal && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <h4 style={{marginBottom: '1rem', marginTop: 0}}>Sesuaikan Foto Profil</h4>
                        
                        <AvatarEditor
                            ref={editorRef}
                            image={tempFile}
                            width={200} 
                            height={200} 
                            border={20} 
                            borderRadius={100} 
                            color={[0, 0, 0, 0.7]} 
                            scale={zoom} 
                            rotate={0}
                        />
                        
                        <div style={{margin: '1.5rem 0'}}>
                            <label style={{fontSize: '0.85rem', color: '#a09ab8', display: 'block', marginBottom: '0.5rem'}}>Zoom Foto</label>
                            <input 
                                type="range" 
                                min="1" max="3" step="0.01" 
                                value={zoom} 
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                style={{width: '100%', cursor: 'pointer'}}
                            />
                        </div>

                        <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
                            <button onClick={() => {setShowCropModal(false); setTempFile(null);}}
                                style={{padding: '0.5rem 1.5rem', background: '#222', border: 'none', borderRadius: '0.5rem', color: '#a09ab8', cursor: 'pointer'}}>
                                Batal
                            </button>
                            <button onClick={saveCroppedImage}
                                style={{padding: '0.5rem 1.5rem', background: '#10b981', border: 'none', borderRadius: '0.5rem', color: '#fff', fontWeight: 600, cursor: 'pointer'}}>
                                Terapkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Settings;