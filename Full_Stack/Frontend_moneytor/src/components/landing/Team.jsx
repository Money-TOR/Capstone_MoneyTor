function Team() {

    const members = [
        {
            name: "Justin Valencius Cahyadi",
            role: "AI Engineer",
            university: "Universitas Tarumanagara",
            github: "#https://github.com/JustNap"
        },

        {
            name: "Miguel Valentino William",
            role: "AI Engineer",
            university: "Universitas Tarumanagara",
            github: "#https://github.com/miguelvalentino"
        },

        {
            name: "Ignatius William Alvin",
            role: "Data Scientist",
            university: "Universitas Tarumanagara",
            github: "#https://github.com/tius13"
        },

        {
            name: "Jason Nathannael ",
            role: "Data Scientist",
            university: "Universitas Tarumanagara",
            github: "#https://github.com/JSN05"
        },

        {
            name: "Nurwahdayati",
            role: "Backend Developer",
            university: "Universitas Lancang Kuning",
            github: "#https://github.com/wahdayatinur-debug"
        },

        {
            name: "Leni Wahyuni",
            role: "Frontend Developer",
            university: "Universitas Lancang Kuning",
            github: "#https://github.com/LeniComelll-coder"
        }
    ];

    return (
        <section className="py-24" id="team">

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* TITLE */}
                <div className="text-center mb-12">

                    <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                        Meet Our Team
                    </h2>

                    <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
                        Tim pengembang MoneyTOR.
                    </p>

                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                    {members.map((member, index) => (

                        <div className="rounded-[28px] border border-slate-800/80 bg-slate-950/85 p-8 text-center transition hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)]" key={index}>

                            <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-emerald-500/15 text-emerald-300 text-2xl font-bold shadow-[0_15px_40px_rgba(20,94,51,0.22)]">
                                {member.name.charAt(0)}
                            </div>

                            <h4 className="text-lg font-semibold text-white">
                                {member.name}
                            </h4>

                            <p className="mt-3 text-sm font-medium uppercase tracking-[0.16em] text-emerald-300">
                                {member.role}
                            </p>

                            <p className="mt-4 text-sm leading-7 text-slate-400">
                                {member.university}
                            </p>

                            <a
                                href={member.github}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-6 inline-flex items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/15 hover:text-white"
                            >
                                GitHub →
                            </a>

                        </div>

                    ))}

                </div>

            </div>

        </section>
    );
}

export default Team;