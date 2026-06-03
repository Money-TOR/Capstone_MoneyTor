import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function CashflowChart({ data: backendData }) {
    const isDataLoaded = backendData && Array.isArray(backendData) && backendData.length > 0;
    const chartData = {
        labels: isDataLoaded ? backendData.map(d => d.bulan || d.month || d.label || '') : [],
        datasets: [
            {
                label: 'Pemasukan',
                data: isDataLoaded ? backendData.map(d => d.pemasukan || d.income || 0) : [],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16,185,129,0.1)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Pengeluaran',
                data: isDataLoaded ? backendData.map(d => d.pengeluaran || d.expense || 0) : [],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239,68,68,0.1)',
                fill: true,
                tension: 0.4,
            },
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
        },
        scales: {
            y: {
                ticks: {
                    callback: (val) => 'Rp ' + (val / 1000000).toFixed(0) + 'jt'
                }
            }
        }
    };

    return (
        <div>
            <h5 style={{ marginBottom: '1rem', color: '#1f2937' }}>Cashflow Overview</h5>
            <Line data={chartData} options={options} />
        </div>
    );
}

export default CashflowChart;