import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportLaporanPDF = ({ periode, bulan, trenData, summary, profil, tanggalEkspor }) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // Format tanggal
    const formatTanggal = (date) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString('id-ID', options);
    };

    let y = 15;

    // ===== HEADER JUDUL =====
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('LAPORAN KEUANGAN', 14, y);
    y += 8;

    // Periode
    const periodeText = periode === 'bulanan' ? `Periode: ${bulan}` : `Periode: ${new Date().getFullYear()}`;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(periodeText, 14, y);
    y += 6;

    // Tanggal cetak
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`Dicetak pada: ${formatTanggal(tanggalEkspor)}`, 14, y);
    y += 10;

    // ===== TABEL 1: INFO PEMILIK =====
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('INFORMASI PEMILIK USAHA', 14, y);
    y += 8;

    const infoRows = [
        ['Nama Pemilik', profil?.nama || '-'],
        ['Lokasi', profil?.lokasi || '-'],
        ['Jenis Usaha', profil?.jenis_usaha || '-'],
        ['Jabatan', profil?.jabatan || 'Owner']
    ];

    autoTable(doc, {
        head: [['Keterangan', 'Detail']],
        body: infoRows,
        startY: y,
        theme: 'striped',
        headStyles: {
            fillColor: [16, 185, 129],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'left'
        },
        bodyStyles: {
            textColor: [50, 50, 50],
            halign: 'left'
        },
        columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: doc.internal.pageSize.getWidth() - 78 }
        },
        margin: { left: 14, right: 14 }
    });

    y = doc.lastAutoTable.finalY + 10;

    // ===== TABEL 2: RINGKASAN KEUANGAN =====
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('RINGKASAN KEUANGAN', 14, y);
    y += 8;

    const summaryRows = [];

    // Hitung total pemasukan dari penjualan
    const totalPemasukan = summary?.total_pemasukan || summary?.pendapatan || 0;
    const totalPengeluaran = summary?.total_pengeluaran || summary?.pengeluaran || 0;
    const labaBersih = summary?.laba_bersih || (totalPemasukan - totalPengeluaran) || 0;

    summaryRows.push([
        'Pemasukan dari Penjualan',
        `Rp ${Number(totalPemasukan).toLocaleString('id-ID')}`
    ]);

    summaryRows.push([
        'Pengeluaran dari Pembelian',
        `Rp ${Number(totalPengeluaran).toLocaleString('id-ID')}`
    ]);

    summaryRows.push([
        'Laba Bersih',
        `Rp ${Number(labaBersih).toLocaleString('id-ID')}`
    ]);

    const marginLaba = totalPemasukan > 0 ? ((labaBersih / totalPemasukan) * 100).toFixed(1) : 0;
    summaryRows.push([
        'Margin Laba',
        `${marginLaba}%`
    ]);

    autoTable(doc, {
        head: [['Item', 'Jumlah']],
        body: summaryRows,
        startY: y,
        theme: 'striped',
        headStyles: {
            fillColor: [16, 185, 129],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'left'
        },
        bodyStyles: {
            textColor: [50, 50, 50],
            halign: 'left'
        },
        columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: doc.internal.pageSize.getWidth() - 108 }
        },
        margin: { left: 14, right: 14 },
        didDrawPage: (data) => {
            // Jika ada halaman baru, reset posisi y
            if (data.startPageNumber > 1) {
                y = data.startPageNumber * 10 + 15;
            }
        }
    });

    // Tambah halaman baru untuk detail transaksi jika diperlukan
    const finalY = doc.lastAutoTable.finalY;

    if (finalY > 220) {
        doc.addPage();
        y = 15;
    } else {
        y = finalY + 10;
    }

    // ===== TABEL 3: DETAIL TRANSAKSI (BULANAN ATAU TAHUNAN) =====
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    const detailTitle = periode === 'bulanan' ? `DETAIL TRANSAKSI - ${bulan}` : `DETAIL TRANSAKSI - ${new Date().getFullYear()}`;
    doc.text(detailTitle, 14, y);
    y += 8;

const detailRows = (trenData || []).map(d => {
        const pem = d.pemasukan || d.income || 0;
        const pen = d.pengeluaran || d.expense || 0;
        const lab = pem - pen;
        const marg = pem > 0 ? `${((lab / pem) * 100).toFixed(0)}%` : '0%';
        return [
            d.bulan || d.month || d.label || 'N/A',
            `Rp ${Number(pem).toLocaleString('id-ID')}`,
            `Rp ${Number(pen).toLocaleString('id-ID')}`,
            `Rp ${Number(lab).toLocaleString('id-ID')}`,
            marg
        ];
    });

    autoTable(doc, {
        head: [['Periode', 'Pemasukan', 'Pengeluaran', 'Laba Bersih', 'Margin']],
        body: detailRows,
        startY: y,
        theme: 'striped',
        headStyles: {
            fillColor: [16, 185, 129],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
        },
        bodyStyles: {
            textColor: [50, 50, 50],
            halign: 'right'
        },
        columnStyles: {
            0: { halign: 'left' },
            1: { halign: 'right' },
            2: { halign: 'right' },
            3: { halign: 'right' },
            4: { halign: 'center' }
        },
        margin: { left: 14, right: 14 }
    });

    // ===== FOOTER =====
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        const pageCount = `Halaman ${i} dari ${pages}`;
        doc.text(pageCount, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    // ===== SAVE PDF =====
    const filename = `Laporan-Keuangan-${periode === 'bulanan' ? bulan : 'Tahunan'}-${new Date().getTime()}.pdf`;
    doc.save(filename);
};