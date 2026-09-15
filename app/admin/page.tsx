"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function login(event) {
    event.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, password }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Login nahi hua");
      return;
    }
    router.push("/admin/dashboard");
  }

  return (
    <div className="page">
      <form className="card" onSubmit={login}>
        <h1 className="logo">Admin login</h1>
        <p className="sub">LabourChowk control panel</p>
        <input
          className="field"
          type="text"
          placeholder="Username"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          autoComplete="username"
        />
        <input
          className="field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error ? <p className="error">{error}</p> : null}
        <button className="btn btn-labour" type="submit" disabled={saving}>
          {saving ? "Login ho raha hai..." : "Dashboard kholo"}
        </button>
        <Link href="/" className="back">
          Wapas
        </Link>
      </form>
    </div>
  );
}
