import financeImage from "../../assets/images/finance.png";

import {
    Wallet,
    Boxes,
    Bot,
    ChartColumn,
} from "lucide-react";

import FeatureCard from "./FeatureCard";

function Features() {
    return (
        <section className="py-24" id="fitur">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                        Solusi Lengkap untuk UMKM
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                        Kami membantu bisnis Anda tumbuh lebih modern dan profesional.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">

                    <div className="h-full">
                        <FeatureCard
                            icon={<Wallet size={28} />}
                            title="Manajemen Keuangan"
                            description="Catat pemasukan, pengeluaran, dan arus kas bisnis dengan mudah."
                            image={financeImage}
                        />
                    </div>

                    <div className="h-full">
                        <FeatureCard
                            icon={<Boxes size={28} />}
                            title="Manajemen Stok"
                            description="Lacak ketersediaan stok secara real-time dan terima notifikasi otomatis saat barang menipis."
                            dark
                            label="Realtime Analytics"
                            iconClass="dark-icon"
                        />
                    </div>

                    <div className="h-full">
                        <FeatureCard
                            icon={<Bot size={28} />}
                            title="AI Chatbot"
                            description="Dapatkan saran bisnis dan analisis otomatis dari AI."
                            green
                            iconClass="chatbot-icon"
                        />
                    </div>

                    <div className="h-full">
                        <FeatureCard
                            icon={<ChartColumn size={28} />}
                            title="Laporan Otomatis"
                            description="Buat laporan laba rugi dan performa bisnis secara instan."
                        />
                    </div>

                </div>

            </div>

        </section>
    );
}

export default Features;