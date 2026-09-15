"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SKILLS } from "@/lib/skills";
import { DashShell } from "../../components/DashShell";

const nav = [{ href: "/admin/dashboard", label: "Dashboard" }];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    live: 0,
    hidden: 0,
    categories: [],
  });
  const [workers, setWorkers] = useState([]);
  const [q, setQ] = useState("");
  const [skill, setSkill] = useState("");
  const [status, setStatus] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then(async (res) => {
        if (!res.ok) {
          router.replace("/admin");
          return;
        }
        const data = await res.json();
        if (data.role !== "admin") {
          router.replace("/admin");
          return;
        }
        setReady(true);
      });
  }, [router]);

  async function load() {
    const query = new URLSearchParams();
    if (q.trim()) {
      query.set("q", q.trim());
    }
    if (skill) {
      query.set("skill", skill);
    }
    if (status !== "all") {
      query.set("status", status);
    }
    const [statsRes, listRes] = await Promise.all([
      fetch("/api/admin/stats"),
      fetch("/api/admin/workers" + (query.toString() ? "?" + query.toString() : "")),
    ]);
    if (statsRes.status === 401 || listRes.status === 401) {
      router.replace("/admin");
      return;
    }
    const statsData = await statsRes.json();
    const listData = await listRes.json();
    if (statsData && typeof statsData.total === "number") {
      setStats(statsData);
    }
    setWorkers(Array.isArray(listData) ? listData : []);
  }

  useEffect(() => {
    if (!ready) {
      return;
    }
    load();
  }, [ready, skill, status]);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/admin");
  }

  async function patchWorker(id, body) {
    setError("");
    const res = await fetch("/api/admin/workers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    if (!res.ok) {
      setError("Update nahi hua");
      return;
    }
    await load();
  }

  async function removeWorker(worker) {
    if (!window.confirm(worker.name + " ko delete karein?")) {
      return;
    }
    setError("");
    const res = await fetch("/api/admin/workers?id=" + worker.id, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("Delete nahi hua");
      return;
    }
    await load();
  }

  function search(event) {
    event.preventDefault();
    load();
  }

  if (!ready) {
    return (
      <DashShell
        kicker="Admin"
        title="Dashboard"
        nav={nav}
        active="/admin/dashboard"
        onLogout={logout}
      >
        <p className="hint">Admin check ho raha hai...</p>
      </DashShell>
    );
  }

  return (
    <DashShell
      kicker="Admin"
      title="Control panel"
      nav={nav}
      active="/admin/dashboard"
      user={{ name: "Admin", meta: "LabourChowk", initial: "A" }}
      onLogout={logout}
    >
      <div className="dash-kpis">
        <div className="dash-kpi">
          <p className="dash-kpi-label">Total labour</p>
          <p className="dash-kpi-value">{stats.total}</p>
          <p className="hint">Registered profiles</p>
        </div>
        <div className="dash-kpi">
          <p className="dash-kpi-label">Aaj live</p>
          <p className="dash-kpi-value">{stats.live}</p>
          <p className="hint">Search me dikh rahe hain</p>
        </div>
        <div className="dash-kpi">
          <p className="dash-kpi-label">Hidden</p>
          <p className="dash-kpi-value">{stats.hidden}</p>
          <p className="hint">Search se hataaye hue</p>
        </div>
      </div>

      <section className="dash-panel">
        <p className="section-kicker">Professions</p>
        <h2 className="dash-heading">Category wise labour</h2>
        <div className="dash-cats">
          {(stats.categories || []).map((item) => (
            <button
              key={item.skill}
              className={"dash-cat" + (skill === item.skill ? " is-active" : "")}
              type="button"
              onClick={() => setSkill(skill === item.skill ? "" : item.skill)}
            >
              <span>{item.skill}</span>
              <strong>
                {item.live}/{item.total}
              </strong>
            </button>
          ))}
        </div>
      </section>

      <section className="dash-panel">
        <p className="section-kicker">Labour</p>
        <h2 className="dash-heading">Profiles manage karo</h2>
        <form className="dash-filters" onSubmit={search}>
          <input
            className="field"
            type="text"
            placeholder="Naam, phone ya area"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="field"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">Saari status</option>
            <option value="live">Live aaj</option>
            <option value="offline">Offline</option>
            <option value="hidden">Hidden</option>
          </select>
          <button className="btn btn-labour dash-filter-btn" type="submit">
            Filter
          </button>
        </form>
        {error ? <p className="error">{error}</p> : null}

        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Labour</th>
                <th>Profession</th>
                <th>Area</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {workers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="hint">
                    Is filter pe koi labour nahi.
                  </td>
                </tr>
              ) : (
                workers.map((worker) => (
                  <tr key={worker.id}>
                    <td>
                      <div className="dash-person">
                        {worker.photo ? (
                          <img src={worker.photo} alt="" />
                        ) : (
                          <span>
                            {(worker.name || "L").slice(0, 1).toUpperCase()}
                          </span>
                        )}
                        <div>
                          <p className="worker-name">{worker.name}</p>
                          <p className="hint">{worker.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td>{worker.skill}</td>
                    <td>{worker.area || "—"}</td>
                    <td>
                      <span
                        className={
                          "pill " +
                          (worker.blocked
                            ? "pill-off"
                            : worker.live
                              ? "pill-on"
                              : "pill-muted")
                        }
                      >
                        {worker.blocked
                          ? "Hidden"
                          : worker.live
                            ? "Live"
                            : "Offline"}
                      </span>
                    </td>
                    <td>
                      <div className="dash-actions">
                        <button
                          className="btn-sm btn-labour"
                          type="button"
                          onClick={() =>
                            patchWorker(worker.id, {
                              available: !worker.live,
                            })
                          }
                          disabled={worker.blocked}
                        >
                          {worker.live ? "Off" : "Live"}
                        </button>
                        <button
                          className="btn-sm btn-thekedar"
                          type="button"
                          onClick={() =>
                            patchWorker(worker.id, {
                              blocked: !worker.blocked,
                            })
                          }
                        >
                          {worker.blocked ? "Unhide" : "Hide"}
                        </button>
                        <button
                          className="btn-sm btn-danger"
                          type="button"
                          onClick={() => removeWorker(worker)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </DashShell>
  );
}
