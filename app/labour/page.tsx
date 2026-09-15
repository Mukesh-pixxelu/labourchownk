"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LabourPage() {
    const router = useRouter();
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const [step, setStep] = useState("phone");
    const [otp, setOtp] = useState("");
    const [saving, setSaving] = useState(false);

    function sendOtp() {
        if (phone.length != 10) {
            setError("10 digit number daalo");
            return;
        }
        setError("");
        setStep("otp");
    }

    async function login() {
        if (phone.length != 10) {
            setError("10 digit number daalo");
            return;
        }
        setSaving(true);
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, otp, role: "labour" }),
        });
        setSaving(false);
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data.error || "Login nahi hua");
            return;
        }
        setError("");
        router.push("/labour/home");
    }

    return (
        <div className="page">
            <div className="card">
                <h1 className="logo">Labour login</h1>
                {step == "phone" ? (
                    <>
                        <p className="sub">Number daalo, phir apni profile banao</p>
                        <input
                            className="field"
                            type="tel"
                            placeholder="10 digit number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        {error ? <p className="error">{error}</p> : null}
                        <button className="btn btn-labour" type="button" onClick={sendOtp}>
                            OTP bhejo
                        </button>
                    </>
                ) : (
                    <>
                        <p className="sub">{phone} pe OTP daalo</p>
                        <p className="hint">Testing OTP: 123456 (SMS nahi jaayegi)</p>
                        <input className="field" type="tel" placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                        {error ? <p className="error">{error}</p> : null}
                        <button className="btn btn-labour" type="button" onClick={login} disabled={saving}>
                            {saving ? "Login ho raha hai..." : "Login"}
                        </button>
                    </>
                )}

                <Link href="/" className="back">
                    Wapas
                </Link>
            </div>
        </div>
    );
}
