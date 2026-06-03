function SmartInsight({ insights }) {
    const list = insights || [];
    return (
        <div className="dashboard-card">

            <h5 className="mb-4">
                Smart Insight AI
            </h5>

            <div className="d-flex flex-column gap-3">

                {
                    list.length === 0 ? (
                        <div className="insight-item" style={{ color: '#64748b' }}>
                            Belum ada insight AI saat ini.
                        </div>
                    ) : (
                        list.map((item, index) => (
                            <div
                                key={index}
                                className="insight-item"
                            >
                                {item}
                            </div>
                        ))
                    )
                }

            </div>

        </div>
    );
}

export default SmartInsight;