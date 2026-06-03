import { Link } from 'react-router-dom';
import heroImage from "../../assets/images/hero.png";

function Hero() {
    return (
        <section className="relative overflow-hidden py-28" id="beranda">

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center">

                    {/* KIRI */}
                    <div className="flex flex-col justify-center gap-8">

                        <span className="inline-flex max-w-fit items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-emerald-200 whitespace-nowrap">
                            SILENT PARTNER ANDA
                        </span>

                        <h1 className="max-w-3xl text-5xl font-extrabold leading-tight tracking-[-0.04em] text-white sm:text-6xl">
                            Kelola Keuangan UMKM Lebih Profesional dengan MoneyTOR
                        </h1>

                        <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                            Solusi manajemen keuangan, stok, dan laporan otomatis untuk pertumbuhan usaha Anda.
                        </p>

                        <div className="flex flex-wrap gap-4">

                            <Link to="/register" className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_20px_60px_-20px_rgba(56,189,115,0.55)] transition hover:from-emerald-400 hover:to-emerald-500">
                                Mulai Sekarang
                            </Link>

                            <a href="#fitur" className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/80 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-emerald-500/40 hover:bg-slate-900/95">
                                Pelajari Fitur
                            </a>

                        </div>

                    </div>

                    {/* KANAN */}
                    <div className="flex items-center justify-center">

                        <img
                            src={heroImage}
                            alt="Hero Dashboard"
                            className="w-full max-w-xl rounded-[32px] shadow-[0_30px_90px_rgba(0,0,0,0.4)]"
                        />

                    </div>

                </div>

            </div>

        </section>
    );
}

export default Hero;