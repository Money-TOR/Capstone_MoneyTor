import { Mail, Lock, Eye, EyeOff, ArrowRight, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginSeller } from '../../api';

function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [savedAccounts, setSavedAccounts] = useState([]);
    const navigate = useNavigate();

    // Load saved accounts dari localStorage saat komponen mount
    useEffect(() => {
        const loadSavedAccounts = () => {
            try {
                const accounts = localStorage.getItem('savedAccounts');
                if (accounts) {
                    setSavedAccounts(JSON.parse(accounts));
                }
            } catch (error) {
                console.error('Error loading saved accounts:', error);
            }
        };
        loadSavedAccounts();
    }, []);

    // Simpan akun ke localStorage
    const saveAccountToStorage = (emailToSave) => {
        try {
            const accounts = JSON.parse(localStorage.getItem('savedAccounts') || '[]');
            if (!accounts.find(acc => acc.email === emailToSave)) {
                accounts.push({ email: emailToSave, savedAt: new Date().toISOString() });
                localStorage.setItem('savedAccounts', JSON.stringify(accounts));
                setSavedAccounts(accounts);
            }
        } catch (error) {
            console.error('Error saving account:', error);
        }
    };

    // Hapus akun yang tersimpan
    const removeAccount = (emailToRemove, e) => {
        e.stopPropagation();
        try {
            const accounts = savedAccounts.filter(acc => acc.email !== emailToRemove);
            localStorage.setItem('savedAccounts', JSON.stringify(accounts));
            setSavedAccounts(accounts);
        } catch (error) {
            console.error('Error removing account:', error);
        }
    };

    // Quick login dengan memilih akun yang tersimpan
    const quickLogin = (emailToUse) => {
        setEmail(emailToUse);
        setPassword("");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            alert('Email dan password wajib diisi!');
            return;
        }
        try {
            const result = await loginSeller(email, password);
            if (result.success) {
                // Simpan akun jika login berhasil
                saveAccountToStorage(email);
                navigate('/dashboard');
            } else {
                alert(result.message || 'Email atau password salah!');
            }
        } catch (error) {
            alert('Gagal konek ke server!');
        }
    };

    return (
        <form onSubmit={handleLogin} autoComplete="on" className="min-h-screen bg-black flex items-center justify-center px-4 py-16 sm:px-6">
            <div className="w-full max-w-md rounded-[32px] border border-slate-800/80 bg-slate-950/90 p-8 shadow-[0_24px_60px_rgba(0,0,0,0.5)]">

                <div className="mb-8 text-center">
                    <img 
                        src="/logo_M.png" 
                        alt="MoneyTOR Logo" 
                        className="mx-auto mb-6 h-14 w-14 object-contain shadow-[0_12px_32px_rgba(56,189,115,0.3)]" 
                    />
                    <h1 className="text-2xl font-semibold text-white">MoneyTOR</h1>
                    <p className="mt-2 text-sm text-slate-400">MSME Partner for Growth</p>
                </div>

                {/* Saved Accounts Section */}
                {savedAccounts.length > 0 && (
                    <div className="mb-6 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                        <p className="text-xs font-medium text-slate-400 mb-3">AKUN TERSIMPAN</p>
                        <div className="space-y-2">
                            {savedAccounts.map((account, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => quickLogin(account.email)}
                                    className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 transition group"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <Mail size={16} className="text-emerald-400" />
                                        <span className="text-sm text-slate-200 truncate">{account.email}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => removeAccount(account.email, e)}
                                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition"
                                    >
                                        <X size={16} />
                                    </button>
                                </button>
                            ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-700">
                            <p className="text-xs text-slate-500">Klik akun untuk melanjutkan, masukkan password kemudian</p>
                        </div>
                    </div>
                )}

                <div className="mb-5">
                    <label className="mb-2 block text-sm font-medium text-slate-300">Email Bisnis</label>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-slate-200 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                        <Mail size={18} />
                        <input
                            name="email"
                            autoComplete="email"
                            type="email"
                            placeholder="nama@perusahaan.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
                        />
                    </div>
                </div>

                <div className="mb-5">
                    <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-300">
                        <span>Kata Sandi</span>
                        {/* <a href="#" className="text-emerald-300 hover:text-emerald-200">Lupa password?</a> */}
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-slate-200 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                        <Lock size={18} />
                        <input
                            name="current-password"
                            autoComplete="current-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:text-emerald-300"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="mb-7 flex items-center gap-3 text-sm text-slate-400">
                    <label className="inline-flex items-center gap-3">
                        <input type="checkbox" className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500" />
                        <span>Ingat saya selama 30 hari</span>
                    </label>
                </div>

                <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:from-emerald-400 hover:to-teal-400">
                    Masuk ke Dashboard
                    <ArrowRight size={18} />
                </button>

                <p className="mt-6 text-center text-sm text-slate-400">
                    Belum punya akun?
                    <a href="/register" className="ml-1 font-semibold text-emerald-300 hover:text-emerald-200">Daftar di sini</a>
                </p>
            </div>
        </form>
    );
}

export default LoginForm;