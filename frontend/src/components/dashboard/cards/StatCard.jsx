function StatCard({ labaRugi, stokData }) {
    const pemasukan = Number((labaRugi && (labaRugi.pendapatan || labaRugi.total_pemasukan)) || 0);
    const pengeluaran = Number((labaRugi && (labaRugi.pengeluaran || labaRugi.total_pengeluaran)) || 0);
    const labaBersih = pemasukan - pengeluaran;
    const totalTransaksi = Number((labaRugi && labaRugi.total_transaksi) || 0);

    // Hitung nilai stok dari data nyata
    const totalNilaiStok = stokData && Array.isArray(stokData)
        ? stokData.reduce((a, b) => {
            const stok = b.stok_awal !== undefined ? b.stok_awal : (b.stok || 0);
            const harga = b.harga_jual || b.harga || 0;
            return a + stok * harga;
          }, 0)
        : 0;

    // Hitung persentase pertumbuhan nyata (pemasukan terhadap total)
    const marginPersen = pemasukan > 0 ? Math.round((labaBersih / pemasukan) * 100) : 0;
    const pengeluaranPersen = pemasukan > 0 ? Math.round((pengeluaran / pemasukan) * 100) : 0;

    const stats = [
        {
            title: "Total Pemasukan",
            amount: `Rp ${pemasukan.toLocaleString('id-ID')}`,
            growth: totalTransaksi > 0 ? `${totalTransaksi} transaksi` : "0 transaksi",
            growthColor: '#10b981',
        },
        {
            title: "Total Pengeluaran",
            amount: `Rp ${pengeluaran.toLocaleString('id-ID')}`,
            growth: pengeluaranPersen > 0 ? `${pengeluaranPersen}% dari pemasukan` : "0%",
            growthColor: pengeluaranPersen > 80 ? '#ef4444' : '#f59e0b',
        },
        {
            title: "Laba Bersih",
            amount: `Rp ${labaBersih.toLocaleString('id-ID')}`,
            growth: `Margin ${marginPersen}%`,
            growthColor: labaBersih >= 0 ? '#10b981' : '#ef4444',
            amountColor: labaBersih >= 0 ? '#10b981' : '#ef4444',
        },
        {
            title: "Nilai Stok",
            amount: `Rp ${totalNilaiStok.toLocaleString('id-ID')}`,
            growth: stokData ? `${stokData.length} produk` : "Memuat...",
            growthColor: 'rgba(16,185,129,0.15)',
            isHighlight: true,
        }
    ];

    return (
        <div className="stat-cards-container">
            {stats.map((item, index) => (
                <div key={index} className={`stat-card ${item.isHighlight ? 'highlight' : ''}`}>
                    <div className="stat-header">
                        <p className="stat-title">{item.title}</p>
                        <span className="stat-growth" style={{ color: item.growthColor }}>
                            {item.growth}
                        </span>
                    </div>
                    <h3 className="stat-amount" style={item.amountColor ? { color: item.amountColor } : {}}>
                        {item.amount}
                    </h3>
                    {item.isHighlight && <p className="stat-desc">Inventaris aktif Anda</p>}
                </div>
            ))}
        </div>
    );
}

export default StatCard;
