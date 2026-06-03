function FeatureCard({
    icon,
    title,
    description,
    image,
    label,
    dark,
    green,
    iconClass,
}) {
    return (
        <div
            className={`group h-full rounded-[28px] border p-8 shadow-[0_28px_80px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_35px_90px_rgba(0,0,0,0.35)] ${dark ? "border-slate-700/90 bg-slate-900/90" : "border-slate-800/80 bg-slate-950/85"} ${green ? "border-emerald-400/30 bg-emerald-500/10" : ""}`}
        >
            <div className={`flex h-14 w-14 items-center justify-center rounded-3xl border ${green ? "border-emerald-300/40 bg-emerald-500/10 text-emerald-300" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"} ${iconClass || ""}`}>
                {icon}
            </div>

            {label && (
                <span className="mt-5 inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
                    {label}
                </span>
            )}

            <h3 className="mt-6 text-xl font-semibold text-white">{title}</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">{description}</p>

            {image && (
                <img
                    src={image}
                    alt={title}
                    className="mt-6 w-full rounded-[28px] object-cover"
                />
            )}
        </div>
    );
}

export default FeatureCard;