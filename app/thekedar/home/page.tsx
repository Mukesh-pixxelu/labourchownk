import Link from "next/link";

export default function ThekedarHomePage() {
    const workers = [
        { name: "Raju", skill: "Mistri" },
        { name: "Imran", skill: "Painter" },
        { name: "Sita", skill: "Mazdoor" },
    ];
    return (
        <div className="page">
            <div className="card">
                <h1 className="logo">Labour dhundo</h1>
                <p className="sub">Aaj available log</p>

                {workers.map((worker) => (
                    <div className="worker" key={worker.name}>
                        <p className="worker-name">{worker.name}</p>
                        <p className="worker-skill">{worker.skill}</p>
                        <button className="btn btn-thekedar" type="button">
                            Call karo
                        </button>
                    </div>
                ))}

                <Link href="/" className="back">
                    Wapas
                </Link>
            </div>
        </div>
    );
}