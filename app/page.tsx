"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_META, SKILLS } from "@/lib/skills";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";

const slides = [
  {
    kicker: "Ghar ka kaam",
    title: "Paint karwana hai? Yahan se labour dhundo",
    text: "Category chuno, aaj available log dekho, call ya WhatsApp karo.",
    cta: "Labour dhundo",
    href: "/search",
    tone: "banner-green",
  },
  {
    kicker: "Simple",
    title: "Search karo, contact karo",
    text: "Plumber, carpenter, welder, electrician — jo chahiye, seedha baat karo.",
    cta: "Abhi dhundo",
    href: "/search",
    tone: "banner-peach",
  },
  {
    kicker: "Labour",
    title: "Aaj available hoon, ghar wale tumhe dekhen",
    text: "Apna skill aur area daalo. Aaj ke kaam yahin se milte hain.",
    cta: "Labour login",
    href: "/labour",
    tone: "banner-brown",
  },
];

function SkillIcon({ skill }) {
  const common = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (skill === "Plumber") {
    return (
      <svg {...common}>
        <path d="M8 4v6a4 4 0 0 0 8 0V4" />
        <path d="M12 14v6" />
        <path d="M9 20h6" />
      </svg>
    );
  }
  if (skill === "Carpenter") {
    return (
      <svg {...common}>
        <path d="M4 20 14 4h3l3 3-10 16H4z" />
        <path d="M14 4 8 20" />
      </svg>
    );
  }
  if (skill === "Welder") {
    return (
      <svg {...common}>
        <path d="M8 15h8" />
        <path d="M12 15V8" />
        <path d="M9 8h6" />
        <path d="m9 5 3-2 3 2" />
        <path d="M7 19h10" />
      </svg>
    );
  }
  if (skill === "Electrician") {
    return (
      <svg {...common}>
        <path d="M13 2 4 14h7l-1 8 10-14h-7l0-6z" />
      </svg>
    );
  }
  if (skill === "Painter") {
    return (
      <svg {...common}>
        <path d="M5 20h6a3 3 0 0 0 0-6H8V4h10v5" />
        <circle cx="16" cy="16" r="3" />
      </svg>
    );
  }
  if (skill === "Mistri") {
    return (
      <svg {...common}>
        <rect x="4" y="10" width="16" height="8" rx="1" />
        <path d="M8 10V7h8v3" />
        <path d="M4 14h16" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M4 20V9l8-5 8 5v11" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const [stats, setStats] = useState([]);
  const [artists, setArtists] = useState(0);
  const [qSkill, setQSkill] = useState("");
  const [qArea, setQArea] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((current) => (current + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.categories)) {
          setStats(data.categories);
        }
        if (typeof data.artists === "number") {
          setArtists(data.artists);
        }
      })
      .catch(() => {
        setStats(SKILLS.map((skill) => ({ skill, total: 0 })));
      });
  }, []);

  const categories = stats.length
    ? stats
    : SKILLS.map((skill) => ({ skill, total: 0 }));
  const maxTotal = Math.max(1, ...categories.map((item) => item.total));

  function goSearch(event) {
    event.preventDefault();
    const q = new URLSearchParams();
    if (qSkill) {
      q.set("skill", qSkill);
    }
    if (qArea.trim()) {
      q.set("area", qArea.trim());
    }
    router.push("/search" + (q.toString() ? "?" + q.toString() : ""));
  }

  return (
    <div className="home">
      <SiteHeader />

      <section className="banner" aria-label="Banner">
        <div className="banner-frame">
          {slides.map((item, index) => (
            <div
              key={item.title}
              className={
                "banner-slide " +
                item.tone +
                (index === slide ? " is-active" : "")
              }
            >
              <div className="container">
                <div className="banner-copy">
                  <p className="banner-kicker">{item.kicker}</p>
                  <h2 className="banner-title">{item.title}</h2>
                  <p className="banner-text">{item.text}</p>
                  <Link href={item.href} className="banner-cta">
                    {item.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}
          <button
            className="banner-arrow banner-arrow-left"
            type="button"
            aria-label="Pichhla banner"
            onClick={() =>
              setSlide((current) =>
                current === 0 ? slides.length - 1 : current - 1
              )
            }
          >
            ‹
          </button>
          <button
            className="banner-arrow banner-arrow-right"
            type="button"
            aria-label="Agla banner"
            onClick={() => setSlide((current) => (current + 1) % slides.length)}
          >
            ›
          </button>
          <div className="banner-dots">
            {slides.map((item, index) => (
              <button
                key={item.title}
                className={index === slide ? "dot active" : "dot"}
                type="button"
                aria-label={"Slide " + (index + 1)}
                onClick={() => setSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      <main className="home-main">
        <div className="container">
          <form className="search-bar" onSubmit={goSearch}>
            <select
              className="field"
              value={qSkill}
              onChange={(e) => setQSkill(e.target.value)}
            >
              <option value="">Kaun si skill?</option>
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
              value={qArea}
              onChange={(e) => setQArea(e.target.value)}
            />
            <button className="btn btn-labour search-submit" type="submit">
              Dhundo
            </button>
          </form>

          <section className="home-section">
            <div className="section-head">
              <div>
                <p className="section-kicker">Skills</p>
                <h2 className="home-heading">Categories</h2>
              </div>
              <p className="home-lead">Jo kaam chahiye, us category pe jaao.</p>
            </div>
            <div className="cat-grid">
              {categories.map((item) => {
                const meta = CATEGORY_META[item.skill] || {};
                return (
                  <Link
                    key={item.skill}
                    href={"/search?skill=" + encodeURIComponent(item.skill)}
                    className="cat-card"
                  >
                    <span
                      className="cat-mark"
                      style={{ background: meta.color || "#1f6b3a" }}
                    >
                      <SkillIcon skill={item.skill} />
                    </span>
                    <span className="cat-copy">
                      <span className="cat-name">{item.skill}</span>
                      <span className="cat-hint">{meta.hint || "Skill"}</span>
                    </span>
                    <span className="cat-count">{item.total}</span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="home-section">
            <div className="section-head">
              <div>
                <p className="section-kicker">Network</p>
                <h2 className="home-heading">Total artists</h2>
              </div>
              <p className="home-lead">
                {artists
                  ? `${artists} log registered — category wise.`
                  : "Category wise registered labour."}
              </p>
            </div>
            <div className="stat-hero">
              <p className="stat-hero-num">{artists}</p>
              <p className="stat-hero-label">Total registered artists</p>
            </div>
            <div className="stat-grid">
              {categories.map((item) => (
                <Link
                  className="stat-card"
                  key={item.skill}
                  href={"/search?skill=" + encodeURIComponent(item.skill)}
                >
                  <p className="stat-skill">{item.skill}</p>
                  <p className="stat-num">{item.total}</p>
                  <div className="stat-bar">
                    <span
                      style={{
                        width: Math.round((item.total / maxTotal) * 100) + "%",
                      }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
