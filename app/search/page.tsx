"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SKILLS } from "@/lib/skills";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";

function SearchBody() {
  const router = useRouter();
  const params = useSearchParams();
  const skill = params.get("skill") || "";
  const area = params.get("area") || "";
  const [skillInput, setSkillInput] = useState(skill);
  const [areaInput, setAreaInput] = useState(area);
  const [workers, setWorkers] = useState([]);
  const [openPhone, setOpenPhone] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSkillInput(skill);
    setAreaInput(area);
  }, [skill, area]);

  useEffect(() => {
    const q = new URLSearchParams();
    if (skill) {
      q.set("skill", skill);
    }
    if (area.trim()) {
      q.set("area", area.trim());
    }
    setLoading(true);
    fetch("/api/workers" + (q.toString() ? "?" + q.toString() : ""))
      .then((res) => res.json())
      .then((data) => {
        setWorkers(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }, [skill, area]);

  function goSearch(event) {
    event.preventDefault();
    const q = new URLSearchParams();
    if (skillInput) {
      q.set("skill", skillInput);
    }
    if (areaInput.trim()) {
      q.set("area", areaInput.trim());
    }
    router.push("/search" + (q.toString() ? "?" + q.toString() : ""));
  }

  return (
    <main className="home-main">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="section-kicker">Search</p>
            <h1 className="home-heading">Labour dhundo</h1>
          </div>
          <p className="home-lead">
            Paint, plumbing, welding — skill chuno, area daalo, call karo.
          </p>
        </div>

        <form className="search-bar" onSubmit={goSearch}>
          <select
            className="field"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
          >
            <option value="">Saari skills</option>
            {SKILLS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <input
            className="field"
            type="text"
            placeholder="Area (jaise Jaipur)"
            value={areaInput}
            onChange={(e) => setAreaInput(e.target.value)}
          />
          <button className="btn btn-labour search-submit" type="submit">
            Dhundo
          </button>
        </form>

        {loading ? (
          <p className="hint">List aa rahi hai...</p>
        ) : workers.length === 0 ? (
          <p className="hint">Is search pe aaj koi available nahi.</p>
        ) : (
          workers.map((worker) => (
            <div className="worker search-card" key={worker.id}>
              <div className="worker-row">
                {worker.photo ? (
                  <img
                    className="worker-photo"
                    src={worker.photo}
                    alt={worker.name}
                  />
                ) : (
                  <span className="worker-photo worker-photo-fallback">
                    {(worker.name || "L").trim().slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div>
                  <p className="worker-name">{worker.name}</p>
                  <p className="worker-skill">
                    {worker.skill} · {worker.area || "Area nahi"}
                  </p>
                </div>
              </div>
              {openPhone === worker.phone ? (
                <>
                  <a className="btn btn-thekedar" href={`tel:${worker.phone}`}>
                    Call {worker.phone}
                  </a>
                  <a
                    className="btn btn-labour"
                    href={`https://wa.me/91${worker.phone}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp
                  </a>
                </>
              ) : (
                <button
                  className="btn btn-thekedar"
                  type="button"
                  onClick={() => setOpenPhone(worker.phone)}
                >
                  Contact karo
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <div className="home">
      <SiteHeader />
      <Suspense fallback={<p className="hint">Search khul rahi hai...</p>}>
        <SearchBody />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
