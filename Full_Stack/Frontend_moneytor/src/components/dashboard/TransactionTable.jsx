function TransactionTable({ transactions }) {
    const list = (transactions && Array.isArray(transactions)) ? transactions.slice(0, 10).map(item => ({
        id: item.id_transaksi || item.id || item._id,
        produk: item.nama_produk || item.produk || item.deskripsi || item.kategori || 'Transaksi',
        kategori: item.kategori || 'Umum',
        total: Number(item.total_harga || item.jumlah || item.total || 0),
        tipe: (item.jenis_transaksi || item.tipe || '').toLowerCase(),
        status: item.status_transaksi || item.status || 'selesai',
        tanggal: item.tanggal ? String(item.tanggal).slice(0, 10) : '-',
        metode: item.metode_pembayaran || '-',
    })) : [];

    return (
        <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: '0.75rem', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #222222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h5 style={{ margin: 0, fontWeight: 700, color: '#f0effe' }}>Transaksi Terbaru</h5>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>10 terakhir</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ background: '#0a0a0a' }}>
                            {['Tanggal', 'Produk/Deskripsi', 'Kategori', 'Jenis', 'Total', 'Metode', 'Status'].map(h => (
                                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #222222', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {list.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                                    Belum ada transaksi. Tambah transaksi pertama Anda!
                                </td>
                            </tr>
                        ) : (
                            list.map((item) => {
                                const isPemasukan = item.tipe === 'pemasukan';
                                return (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #111111', transition: '0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#0a0a0a'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '0.875rem 1rem', color: '#5c566e', whiteSpace: 'nowrap' }}>{item.tanggal}</td>
                                        <td style={{ padding: '0.875rem 1rem', color: '#f0effe', fontWeight: 500 }}>{item.produk}</td>
                                        <td style={{ padding: '0.875rem 1rem', color: '#5c566e' }}>{item.kategori}</td>
                                        <td style={{ padding: '0.875rem 1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700,
                                                background: isPemasukan ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                                                color: isPemasukan ? '#10b981' : '#ef4444'
                                            }}>
                                                {item.tipe || 'n/a'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: isPemasukan ? '#10b981' : '#ef4444' }}>
                                            {isPemasukan ? '+' : '-'}Rp {item.total.toLocaleString('id-ID')}
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', color: '#5c566e' }}>{item.metode}</td>
                                        <td style={{ padding: '0.875rem 1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                                                background: 'rgba(16,185,129,0.15)', color: '#10b981'
                                            }}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TransactionTable;
