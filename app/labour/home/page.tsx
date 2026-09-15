"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashShell } from "../../components/DashShell";

const nav = [
  { href: "/labour/home", label: "Dashboard" },
  { href: "/labour/profile", label: "Meri profile" },
];

export default function LabourHomePage() {
  const router = useRouter();
  const [available, setAvailable] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [name, setName] = useState("");
  const [skill, setSkill] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [photo, setPhoto] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then(async (res) => {
        if (!res.ok) {
          router.replace("/labour");
          return;
        }
        const data = await res.json();
        if (data.role !== "labour") {
          router.replace("/");
          return;
        }
        setPhone(data.phone);
      });
  }, [router]);

  useEffect(() => {
    if (!phone) {
      return;
    }

    fetch("/api/workers?self=1")
      .then((res) => res.json())
      .then((data) => {
        if (!data || !data.name || !data.skill) {
          router.replace("/labour/profile");
          return;
        }
        setName(data.name || "");
        setSkill(data.skill || "");
        setArea(data.area || "");
        setPhoto(data.photo || "");
        setAvailable(data.available === 1);
        setBlocked(Number(data.blocked) === 1);
        setReady(true);
      });
  }, [phone, router]);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/");
  }

  async function toggleAvailable() {
    if (!name.trim() || !skill || !area.trim()) {
      router.replace("/labour/profile");
      return;
    }

    const nextAvailable = !available;
    const res = await fetch("/api/workers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        skill,
        area,
        available: nextAvailable,
      }),
    });
    if (!res.ok) {
      setError("Save nahi hua");
      return;
    }
    setError("");
    setAvailable(nextAvailable);
  }

  if (!ready) {
    return (
      <DashShell
        kicker="Labour"
        title="Dashboard"
        nav={nav}
        active="/labour/home"
        onLogout={logout}
      >
        <p className="hint">Dashboard load ho raha hai...</p>
      </DashShell>
    );
  }

  return (
    <DashShell
      kicker="Labour"
      title={"Namaste, " + name}
      nav={nav}
      active="/labour/home"
      user={{
        name,
        meta: skill + (area ? " · " + area : ""),
        photo,
        initial: name.slice(0, 1).toUpperCase(),
      }}
      onLogout={logout}
    >
      {blocked ? (
        <div className="dash-alert">
          Admin ne profile search se hide ki hai. Available on karne se bhi
          ghar wale abhi nahi dekhenge.
        </div>
      ) : null}

      <div className="dash-kpis">
        <div className="dash-kpi">
          <p className="dash-kpi-label">Status</p>
          <p className="dash-kpi-value">
            {blocked ? "Hidden" : available ? "Live" : "Offline"}
          </p>
          <p className="hint">
            {blocked
              ? "Search me nahi"
              : available
                ? "Aaj dhundha ja sakta hai"
                : "Abhi list me nahi"}
          </p>
        </div>
        <div className="dash-kpi">
          <p className="dash-kpi-label">Profession</p>
          <p className="dash-kpi-value">{skill}</p>
          <p className="hint">Ghar wale isi skill pe dhundhte hain</p>
        </div>
        <div className="dash-kpi">
          <p className="dash-kpi-label">Area</p>
          <p className="dash-kpi-value">{area || "—"}</p>
          <p className="hint">Number: {phone}</p>
        </div>
      </div>

      <div className="dash-split">
        <section className="dash-panel">
          <p className="section-kicker">Availability</p>
          <h2 className="dash-heading">Aaj kaam chahiye?</h2>
          <p className="hint">
            {available
              ? "Tum search results me ho. Kal midnight pe yeh off ho jayega."
              : "Button on karo. Sirf aaj ke liye ghar wale tumhe dekhenge."}
          </p>
          {error ? <p className="error">{error}</p> : null}
          <button
            className={available ? "btn btn-thekedar" : "btn btn-labour"}
            type="button"
            onClick={toggleAvailable}
            disabled={blocked}
          >
            {available ? "Available hoon — Off karo" : "Aaj available hoon"}
          </button>
        </section>

        <section className="dash-panel">
          <p className="section-kicker">Profile</p>
          <h2 className="dash-heading">Meri details</h2>
          <div className="dash-profile">
            {photo ? (
              <img className="avatar" src={photo} alt={name} />
            ) : (
              <span className="avatar avatar-fallback">
                {name.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div>
              <p className="worker-name">{name}</p>
              <p className="worker-skill">
                {skill} · {area || "Area nahi"}
              </p>
              <p className="hint">{phone}</p>
              <Link href="/labour/profile" className="btn-sm btn-labour">
                Profile edit karo
              </Link>
            </div>
          </div>
        </section>
      </div>
    </DashShell>
  );
}
