"use client";
import { useState } from "react";
import Link from "next/link";

export default function LabourHomePage() {
    const [available, setAvailable] = useState(false);
    const [name, setName] = useState("");
    const [skill, setSkill] = useState("");
    const [error, setError] = useState("");

    function toggleAvailable() {
        if (available) {
            setAvailable(false);
            setError("");
            return;
        }

        if (!name.trim() || !skill) {
            setError("Pehle naam aur skill daalo");
            return;
        }

        setError("");
        setAvailable(true);
    }

    return (
        <div className="page">
            <div className="card">
                <h1 className="logo">LabourChowk</h1>
                <p className="sub">
                    {name ? `Namaste, ${name}.` : "Namaste. Aaj kaam chahiye?"}
                </p>
                <input
                    className="field"
                    type="text"
                    placeholder="Apna naam"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <select
                    className="field"
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                >
                    <option value="" disabled>
                        Skill chuno
                    </option>
                    <option value="mazdoor">Mazdoor</option>
                    <option value="mistri">Mistri</option>
                    <option value="painter">Painter</option>
                    <option value="plumber">Plumber</option>
                    <option value="electrician">Electrician</option>
                </select>
                <p className="hint">
                    {available ? "Thekedar tumhe dekh sakte hain." : "Pehle button dabaao."}
                </p>
                {error ? <p className="error">{error}</p> : null}

                <button
                    className={available ? "btn btn-thekedar" : "btn btn-labour"}
                    type="button"
                    onClick={toggleAvailable}
                >
                    {available ? "Available hoon" : "Aaj available hoon"}
                </button>

                <Link href="/" className="back">
                    Wapas
                </Link>
            </div>
        </div>
    );
}