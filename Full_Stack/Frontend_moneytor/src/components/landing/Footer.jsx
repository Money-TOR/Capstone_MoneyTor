function Footer() {
    return (
        <footer className="border-t border-slate-800/70 bg-slate-950/90 py-16" id="resources">

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.9fr_1fr]">

                    {/* KOLOM 1 */}
                    <div>

                        <h3 className="text-2xl font-semibold text-white">
                            MoneyTOR
                        </h3>

                        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
                            Partner teknologi terpercaya digitalisasi keuangan dengan solusi cerdas dan terjangkau untuk pertumbuhan berkelanjutan.
                        </p>

                    </div>

                    {/* KOLOM 2 */}
                    <div>

                        <h5 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                            Navigasi
                        </h5>

                        <ul className="space-y-3 text-sm text-slate-400">

                            <li>Beranda</li>
                            <li>Fitur</li>
                            <li>Tentang</li>
                            <li>Tim</li>

                        </ul>

                    </div>

                    {/* KOLOM 3 */}
                    <div>

                        <h5 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                            Program
                        </h5>

                        <ul className="space-y-3 text-sm text-slate-400">

                            <li>Coding Camp 2026</li>
                            <li>DBS Foundation</li>
                            <li>Dicoding</li>
                        </ul>

                    </div>

                    {/* KOLOM 4 */}
                    <div>

                        <h5 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                            Resources
                        </h5>

                        <ul className="space-y-3 text-sm text-slate-400">

                            <li>
                                <a
                                    href="https://github.com/Money-TOR"
                                    className="transition hover:text-emerald-300"
                                >
                                    GitHub Repository
                                </a>
                            </li>

                            <li>
                                <a
                                    href="https://www.figma.com/design/Ragb7sxmYUtPyiXHgmpBgS/Mockup-new?node-id=0-1&t=71NmfYuL41RuwVxn-1"
                                    className="transition hover:text-emerald-300"
                                >
                                    Figma Design
                                </a>
                            </li>

                            <li>
                                <a
                                    href="#"
                                    className="transition hover:text-emerald-300"
                                >
                                    API Documentation
                                </a>
                            </li>

                        </ul>

                    </div>
                </div>

                <div className="mt-10 border-t border-slate-800/70 pt-8 text-center">
                    <p className="text-sm text-slate-500">
                        © 2026 MoneyTOR Team.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;