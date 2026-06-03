import { Link } from 'react-router-dom';

function CTA() {
    return (
        <section className="py-24" id="tentang">

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                <div className="glass-panel p-10 sm:p-12">

                    <div>

                        <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                            Siap Membawa Usaha Anda ke Level Berikutnya?
                        </h2>

                        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                            Mulai kelola bisnis UMKM lebih modern bersama MoneyTOR sekarang juga.
                        </p>

                    </div>

                    <Link to="/register" className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_24px_90px_-30px_rgba(56,189,115,0.8)] transition hover:from-emerald-400 hover:to-teal-400">
                        Coba Gratis Sekarang
                    </Link>

                </div>

            </div>

        </section>
    );
}

export default CTA;