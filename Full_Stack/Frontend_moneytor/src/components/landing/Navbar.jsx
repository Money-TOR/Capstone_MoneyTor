import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
    const [active, setActive] = useState("beranda");
    const [open, setOpen] = useState(false);
    const links = [
        ["beranda", "#beranda", "Beranda"],
        ["fitur", "#fitur", "Fitur"],
        ["tentang", "#tentang", "Tentang"],
        ["kontak", "#resources", "Resources"]
    ];

    return (
        <nav className="fixed inset-x-0 top-0 z-50 border-b border-slate-800/70 bg-slate-950/90 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
                <Link to="/" className="text-2xl font-extrabold tracking-tight text-emerald-300 md:text-3xl">
                    MoneyTOR
                </Link>

                <div className="hidden md:flex md:flex-1 md:justify-center">
                    <ul className="flex items-center gap-6 text-sm text-slate-300">
                        {links.map(([key, href, label]) => (
                            <li key={key}>
                                <a
                                    href={href}
                                    className={`block rounded-full px-4 py-2 transition ${active === key ? "bg-emerald-500/15 text-emerald-200" : "hover:bg-slate-800/70"}`}
                                    onClick={() => setActive(key)}
                                >
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex items-center gap-3 md:gap-4">
                    <Link
                        to="/login"
                        className="hidden rounded-2xl border border-emerald-500/30 bg-slate-900/90 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:border-emerald-400/40 hover:bg-slate-800/90 md:inline-flex"
                    >
                        Login
                    </Link>
                    <Link
                        to="/register"
                        className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                    >
                        Register
                    </Link>
                    <button
                        type="button"
                        className="inline-flex items-center rounded-2xl border border-slate-800/90 bg-slate-900/75 p-2 text-slate-300 transition hover:bg-slate-800 md:hidden"
                        onClick={() => setOpen((prev) => !prev)}
                        aria-label="Toggle navigation"
                    >
                        <span className="block h-0.5 w-5 bg-current"></span>
                        <span className="mt-1 block h-0.5 w-5 bg-current"></span>
                    </button>
                </div>

                <div className={`${open ? "block" : "hidden"} w-full md:hidden`}>
                    <div className="mt-3 flex flex-col gap-3 rounded-3xl border border-slate-800/70 bg-slate-950/95 p-4 shadow-xl shadow-slate-950/40">
                        <ul className="flex flex-col gap-3 text-sm text-slate-300">
                            {links.map(([key, href, label]) => (
                                <li key={key}>
                                    <a
                                        href={href}
                                        className={`block rounded-full px-4 py-2 transition ${active === key ? "bg-emerald-500/15 text-emerald-200" : "hover:bg-slate-800/70"}`}
                                        onClick={() => {
                                            setActive(key);
                                            setOpen(false);
                                        }}
                                    >
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>

                        <div className="flex flex-col gap-2">
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center rounded-2xl border border-emerald-500/30 bg-slate-900/90 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:border-emerald-400/40 hover:bg-slate-800/90"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                            >
                                Register
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;