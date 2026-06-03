import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import { sendChat } from '../api';
import { Bot, MessageSquare, Loader2, X, CheckCircle } from 'lucide-react';
import '../styles/Dashboard.css';

const quickReplies = [
    'Bagaimana cara meningkatkan penjualan?',
    'Analisa keuangan bulan ini',
    'Stok mana yang perlu diisi ulang?',
    'Tips hemat pengeluaran usaha',
];



function AIAssistant() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        { from: 'bot', text: 'Halo! Saya MoneyTor AI. Siap membantu analisa keuangan dan operasional usaha kamu.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text) => {
        const msg = text || input.trim();
        if (!msg) return;
        setMessages(prev => [...prev, { from: 'user', text: msg }]);
        setInput('');
        setLoading(true);
        try {
            const res = await sendChat(msg);
            if (res.success && res.data && res.data.jawaban) {
                setMessages(prev => [...prev, { from: 'bot', text: res.data.jawaban }]);
            } else if (res.success && res.message) {
                setMessages(prev => [...prev, { from: 'bot', text: res.message }]);
            } else {
                setMessages(prev => [...prev, { from: 'bot', text: 'Maaf, saya tidak dapat menjawab saat ini.' }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { from: 'bot', text: 'Gagal menghubungi asisten AI.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="sidebar-area"><Sidebar /></div>
            <div className="main-content">
                <Topbar />
                <div className="dashboard-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ color: '#f0effe', margin: 0 }}>AI Assistant</h2>
                        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <X size={24} color="#94a3b8" />
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>

                        {/* Chat */}
                        <div style={{ background: '#111111', borderRadius: '1rem', border: '1px solid #222222', display: 'flex', flexDirection: 'column', height: '70vh' }}>
                            <div style={{ background: '#0f0a1a', color: 'white', padding: '1rem 1.5rem', borderRadius: '1rem 1rem 0 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={20} color="#a7f3d0" /></div>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 700, color: 'white' }}>MoneyTor AI</p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#a7f3d0' }}>● Online</p>
                                </div>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#0a0a0a' }}>
                                {messages.map((m, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
                                        <div style={{
                                            maxWidth: '75%', padding: '0.75rem 1rem',
                                            borderRadius: m.from === 'user' ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
                                            background: m.from === 'user' ? '#10b981' : '#1e293b',
                                            color: '#f0effe',
                                            fontSize: '0.875rem', lineHeight: 1.6,
                                            border: m.from === 'bot' ? '1px solid #334155' : 'none'
                                        }}>{m.text}</div>
                                    </div>
                                ))}
                                {loading && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                        <div style={{ background: '#111111', border: '1px solid #222222', padding: '0.75rem 1rem', borderRadius: '1rem 1rem 1rem 0', fontSize: '0.875rem', color: '#5c566e', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><Loader2 size={16} className="animate-spin" /> Menganalisa...</div>
                                    </div>
                                )}
                                <div ref={bottomRef} />
                            </div>

                            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #222222', display: 'flex', gap: '0.75rem', background: '#111111', borderRadius: '0 0 1rem 1rem' }}>
                                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                    placeholder="Ketik pertanyaan kamu..."
                                    style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #222222', fontSize: '0.875rem', outline: 'none', background: '#0a0a0a', color: '#f0effe' }} />
                                <button onClick={() => sendMessage()} className="btn-input">Kirim</button>
                            </div>
                        </div>

                        {/* Sidebar kanan */}
                        <div>
                            <div style={{ background: '#111111', borderRadius: '1rem', border: '1px solid #222222', padding: '1.5rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><MessageSquare size={18} color="#10b981" /><h5 style={{ margin: 0, fontWeight: 700, color: '#f0effe' }}>Pertanyaan Cepat</h5></div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {quickReplies.map((q, i) => (
                                        <button key={i} onClick={() => sendMessage(q)}
                                            style={{ padding: '0.75rem 1rem', background: '#0a0a0a', border: '1px solid #222222', borderRadius: '0.5rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.8rem', color: '#10b981', fontWeight: 500, transition: '0.2s' }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.background = '#0f172a'; }}>
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ background: '#0f0a1a', borderRadius: '1rem', padding: '1.5rem', color: 'white', border: '1px solid rgba(16,185,129,0.4)' }}>
                                <h5 style={{ margin: '0 0 0.75rem', fontWeight: 700, color: 'white' }}>AI bisa bantu:</h5>
                                {['Analisa tren penjualan', 'Peringatan stok menipis', 'Saran efisiensi biaya', 'Ringkasan laporan keuangan'].map((item, i) => (
                                    <p key={i} style={{ margin: '0.4rem 0', fontSize: '0.8rem', color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#10b981' }}>✓</span>{item}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AIAssistant;