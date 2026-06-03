import { useState } from "react";
import { registerSeller } from "../../api";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert("Semua field wajib diisi!");
      return;
    }

    if (password !== confirmPassword) {
      alert("Password tidak sama!");
      return;
    }

    try {
      const result = await registerSeller({
        nama_usaha: name,
        jenis_usaha: "Umum",
        lokasi_usaha: "-",
        email,
        password,
        nama_pemilik: name,
      });

      if (result.success) {
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        alert("Akun berhasil dibuat! Silakan login.");
        window.location.href = "/login";
      } else {
        alert(result.message || "Registrasi gagal!");
      }
    } catch (error) {
      alert("Gagal konek ke server!");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-16 sm:px-6">
      <form onSubmit={handleRegister} autoComplete="off" className="w-full max-w-md rounded-[32px] border border-slate-800/80 bg-slate-950/90 p-8 shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-white">MoneyTOR</h1>
          <p className="mt-2 text-sm text-slate-400">Kelola keuanganmu dengan lebih mudah</p>
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-slate-300">Nama Lengkap</label>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-slate-200 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
            <User size={18} />
            <input
              name="name"
              autoComplete="name"
              type="text"
              placeholder="Nama Lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-slate-200 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
            <Mail size={18} />
            <input
              name="email"
              autoComplete="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-slate-200 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
            <Lock size={18} />
            <input
              name="new-password"
              autoComplete="new-password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
            />
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:text-emerald-300"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-slate-300">Konfirmasi Password</label>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-slate-200 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
            <Lock size={18} />
            <input
              name="confirm-password"
              autoComplete="new-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Konfirmasi Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
            />
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:text-emerald-300"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:from-emerald-400 hover:to-teal-400"
        >
          Daftar
          <ArrowRight size={18} />
        </button>

        <p className="mt-6 text-center text-sm text-slate-400">
          Sudah punya akun?
          <a href="/login" className="ml-1 font-semibold text-emerald-300 hover:text-emerald-200">
            Masuk
          </a>
        </p>
      </form>
    </div>
  );
}
