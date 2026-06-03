import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Package, ChartColumn, Bot, Settings, Truck } from 'lucide-react';

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const menu = [
        { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/keuangan', icon: <Wallet size={20} />, label: 'Keuangan' },
        { path: '/stok', icon: <Package size={20} />, label: 'Stok' },
        { path: '/supplier', icon: <Truck size={20} />, label: 'Supplier' },
        { path: '/laporan', icon: <ChartColumn size={20} />, label: 'Laporan' },
        { path: '/chatbot', icon: <Bot size={20} />, label: 'AI Assistant' },
    ];

    return (
        <aside className="sidebar">
            <div>
                <div className="sidebar-logo">MoneyTor</div>
                <nav className="sidebar-menu">
                    {menu.map(item => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`sidebar-link ${location.pathname === item.path || location.pathname.startsWith(item.path + '/') ? 'active' : ''}`}
                            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div>
                <button
                    onClick={() => navigate('/settings')}
                    className={`sidebar-link ${location.pathname === '/settings' ? 'active' : ''}`}
                    style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                    <Settings size={20} />
                    Settings
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
