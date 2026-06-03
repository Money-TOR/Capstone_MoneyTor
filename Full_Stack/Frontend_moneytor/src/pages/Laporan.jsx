import React, { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { getTrenBulanan, getLabaRugi, isLoggedIn, getTransaksi, getProfil } from '../api';
import { Download } from 'lucide-react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import '../styles/Dashboard.css';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { exportLaporanPDF } from "../utils/exportLaporanPDF";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const bulanList = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function Laporan() {
    const [periode, setPeriode] = useState('bulanan');
    const [bulan, setBulan] = useState('Mei');
    const [trenData, setTrenData] = useState(null);
    const [summary, setSummary] = useState(null);
    const [transaksi, setTransaksi] = useState(null);
    const [profil, setProfil] = useState(null);

    useEffect(() => {
        if (!isLoggedIn()) {
            window.location.href = '/login';
            return;
        }
        const fetchData = async () => {
            try {
                const tr = await getTrenBulanan();
                if (tr.success) setTrenData(tr.data);

                const lr = await getLabaRugi();
                if (lr.success) setSummary(lr.data);

                const trans = await getTransaksi();
                if (trans.success) setTransaksi(trans.data);

                const prof = await getProfil();
                if (prof.success) setProfil(prof.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const dataBulanan = {
        labels: (trenData && Array.isArray(trenData)) ? trenData.map(d => d.bulan || d.month || d.label) : [],
        datasets: [
            {
                label: 'Pemasukan',
                data: (trenData && Array.isArray(trenData)) ? trenData.map(d => d.pemasukan || d.income || 0) : [],
                borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4
            },
            {
                label: 'Pengeluaran',
                data: (trenData && Array.isArray(trenData)) ? trenData.map(d => d.pengeluaran || d.expense || 0) : [],
                borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4
            }
        ]
    };

    const hitungKomposisiPengeluaran = () => {
    if (!transaksi || !Array.isArray(transaksi)) {
        return {
            labels: ['Bahan Baku', 'Operasional', 'Gaji', 'Marketing', 'Lainnya'],
            datasets: [{ data: [35, 25, 20, 12, 8], backgroundColor: ['#064e3b','#10b981','#34d399','#6ee7b7','#a7f3d0'] }]
        };
    }
    const kategoriMap = {};
    transaksi
        .filter(t => t.tipe === 'pengeluaran' || t.type === 'expense' || t.jenis === 'pengeluaran')
        .forEach(t => {
            const kat = t.kategori || t.category || 'Lainnya';
            const jumlah = Number(t.jumlah || t.amount || 0);
            kategoriMap[kat] = (kategoriMap[kat] || 0) + jumlah;
        });
    if (Object.keys(kategoriMap).length === 0) {
        return {
            labels: ['Belum ada data'],
            datasets: [{ data: [1], backgroundColor: ['#334155'] }]
        };
    }
    const warna = ['#064e3b','#10b981','#34d399','#6ee7b7','#a7f3d0','#059669','#047857'];
    return {
        labels: Object.keys(kategoriMap),
        datasets: [{ data: Object.values(kategoriMap), backgroundColor: warna.slice(0, Object.keys(kategoriMap).length) }]
    };
};
const dataKategori = hitungKomposisiPengeluaran();

    // Hitung data metode pembayaran dari transaksi
    const hitungMetodePembayaran = () => {
        if (!transaksi || !Array.isArray(transaksi)) return { labels: ['Transfer Bank', 'Tunai', 'QRIS'], datasets: [{ data: [45, 35, 20], backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'] }] };
        
        const metodeCounts = { 'Transfer Bank': 0, 'Tunai': 0, 'QRIS': 0 };
        transaksi.forEach(t => {
            const metode = t.metode_pembayaran || 'Tunai';
            if (metode.includes('Transfer')) metodeCounts['Transfer Bank']++;
            else if (metode.includes('Tunai')) metodeCounts['Tunai']++;
            else if (metode.includes('QRIS')) metodeCounts['QRIS']++;
        });
        const total = Object.values(metodeCounts).reduce((a, b) => a + b, 1);
        const percentages = Object.values(metodeCounts).map(v => Math.round((v / total) * 100));
        return {
            labels: ['Transfer Bank', 'Tunai', 'QRIS'],
            datasets: [{ data: percentages, backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'] }]
        };
    };
    
    const dataMetodePembayaran = hitungMetodePembayaran();

    const dataBar = {
        labels: (trenData && Array.isArray(trenData)) ? trenData.map(d => d.bulan || d.month || d.label) : [],
        datasets: [{
            label: 'Laba Bersih',
            data: (trenData && Array.isArray(trenData)) ? trenData.map(d => (d.pemasukan || d.income || 0) - (d.pengeluaran || d.expense || 0)) : [],
            backgroundColor: '#064e3b',
            borderRadius: 6,
        }]
    };

    const chartOpts = {
        responsive: true,
        plugins: { legend: { position: 'top' } },
        scales: { y: { ticks: { callback: v => 'Rp '+(v/1000000).toFixed(0)+'jt' } } }
    };

    const ringkasan = [
        { label: 'Total Pemasukan', value: summary ? `Rp ${Number(summary.total_pemasukan || summary.pendapatan || 0).toLocaleString('id-ID')}` : 'Rp 0', color: '#10b981' },
        { label: 'Total Pengeluaran', value: summary ? `Rp ${Number(summary.total_pengeluaran || summary.pengeluaran || 0).toLocaleString('id-ID')}` : 'Rp 0', color: '#ef4444' },
        { label: 'Laba Bersih', value: summary ? `Rp ${Number(summary.laba_bersih || (summary.total_pemasukan - summary.total_pengeluaran) || 0).toLocaleString('id-ID')}` : 'Rp 0', color: '#10b981' },
        { label: 'Margin Laba', value: summary ? (summary.margin_laba || `${((summary.laba_bersih / summary.total_pemasukan) * 100 || 0).toFixed(1)}%`) : '0%', color: '#f59e0b' },
    ];

    // Logika export yang murni dari data database
    const handleExportPDF = () => {
        // Kalau data belum kelar loading atau emang database-nya masih kosong, kita stop di sini
        if (!trenData || !Array.isArray(trenData) || trenData.length === 0) {
            alert("Belum ada data laporan UMKM yang bisa di-export.");
            return;
        }

        exportLaporanPDF({
            periode,
            bulan,
            trenData,
            summary,
            profil,
            tanggalEkspor: new Date()
        });
    };

    return (
        <div className="dashboard-container">
            <div className="sidebar-area"><Sidebar /></div>
            <div className="main-content">
                <Topbar />
                <div className="dashboard-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ color: '#f0effe' }}>Laporan Keuangan</h2>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <select value={periode} onChange={e => setPeriode(e.target.value)}
                                style={{ 
                                    padding: '0.625rem 1rem', 
                                    borderRadius: '0.5rem', 
                                    border: '2px solid #10b981',
                                    backgroundColor: '#1a1a1a',
                                    color: '#10b981',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}>
                                <option value="bulanan">Bulanan</option>
                                <option value="tahunan">Tahunan</option>
                            </select>
                            {periode === 'bulanan' && (
                                <select value={bulan} onChange={e => setBulan(e.target.value)}
                                    style={{ 
                                        padding: '0.625rem 1rem', 
                                        borderRadius: '0.5rem', 
                                        border: '2px solid #10b981',
                                        backgroundColor: '#1a1a1a',
                                        color: '#10b981',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}>
                                    {bulanList.map(b => <option key={b} style={{backgroundColor: '#000', color: '#10b981'}}>{b}</option>)}
                                </select>
                            )}
                            <button className="btn-input" onClick={handleExportPDF} style={{ 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem', 
                                background: 'linear-gradient(135deg, #10b981, #059669)', 
                                color: 'white', 
                                border: 'none',
                                padding: '0.625rem 1.25rem',
                                borderRadius: '0.5rem',
                                fontWeight: 600,
                                transition: 'all 0.3s ease'
                            }}>
                                <Download size={16} />
                                Export PDF
                            </button>
                        </div>
                    </div>

                    {/* Ringkasan */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
                        {ringkasan.map((r, i) => (
                            <div key={i} style={{ background: '#111111', border: '1px solid #222222', borderRadius: '0.75rem', padding: '1.25rem' }}>
                                <p style={{ fontSize: '0.8rem', color: '#5c566e', margin: '0 0 0.5rem' }}>{r.label}</p>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: r.color, margin: 0 }}>{r.value}</h3>
                            </div>
                        ))}
                    </div>

                    {/* Charts */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="content-box">
                            <h5 style={{ marginBottom: '1rem', fontWeight: 700 }}>Komposisi Pengeluaran</h5>
                            <Doughnut data={dataKategori} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                        </div>
                        <div className="content-box">
                            <h5 style={{ marginBottom: '1rem', fontWeight: 700 }}>Metode Pembayaran</h5>
                            <Doughnut data={dataMetodePembayaran} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                        </div>
                        <div className="content-box">
                            <h5 style={{ marginBottom: '1rem', fontWeight: 700 }}>Tren Pemasukan & Pengeluaran</h5>
                            <Line data={dataBulanan} options={chartOpts} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="content-box">
                            <h5 style={{ marginBottom: '1rem', fontWeight: 700 }}>Laba Bersih per Bulan</h5>
                            <Bar data={dataBar} options={chartOpts} />
                        </div>
                    </div>

                    {/* Tabel Rincian */}
                    <div style={{ background: '#111111', borderRadius: '0.75rem', border: '1px solid #222222', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #222222' }}>
                            <h5 style={{ margin: 0, fontWeight: 700 }}>Rincian per Bulan</h5>
                        </div>
                        <table className="table">
                            <thead>
                                <tr>
                                    {['Bulan','Pemasukan','Pengeluaran','Laba Bersih','Margin'].map(h => <th key={h}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Kondisi: kalau data dari database ada, tampilin. Kalau kosong, kasi tau user */}
                                {trenData && Array.isArray(trenData) && trenData.length > 0 ? (
                                    trenData.map((d, i) => {
                                        const pem = d.pemasukan || d.income || 0;
                                        const pen = d.pengeluaran || d.expense || 0;
                                        const lab = pem - pen;
                                        const marg = pem > 0 ? `${((lab / pem) * 100).toFixed(0)}%` : '0%';
                                        const row = [
                                            d.bulan || d.month || d.label,
                                            `Rp ${pem.toLocaleString('id-ID')}`,
                                            `Rp ${pen.toLocaleString('id-ID')}`,
                                            `Rp ${lab.toLocaleString('id-ID')}`,
                                            marg
                                        ];

                                        return (
                                            <tr key={i}>
                                                {row.map((cell, j) => (
                                                    <td key={j} style={{
                                                        color: j === 1 ? '#10b981' : j === 2 ? '#ef4444' : j === 3 ? '#34d399' : '#f0effe',
                                                        fontWeight: j >= 3 ? 700 : 400
                                                    }}>{cell}</td>
                                                ))}
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', color: '#5c566e', padding: '2rem' }}>
                                            Belum ada data transaksi untuk UMKM ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Laporan;