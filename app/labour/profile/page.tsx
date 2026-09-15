"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SKILLS } from "@/lib/skills";
import { DashShell } from "../../components/DashShell";

const nav = [
  { href: "/labour/home", label: "Dashboard" },
  { href: "/labour/profile", label: "Meri profile" },
];

export default function LabourProfilePage() {
  const router = useRouter();
  const fileRef = useRef(null);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [skill, setSkill] = useState("");
  const [area, setArea] = useState("");
  const [photo, setPhoto] = useState("");
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState(null);
  const [exists, setExists] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

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
        if (!data || !data.id) {
          return;
        }
        setExists(true);
        setName(data.name || "");
        setSkill(data.skill || "");
        setArea(data.area || "");
        setPhoto(data.photo || "");
      });
  }, [phone]);

  function pickPhoto(event) {
    const next = event.target.files && event.target.files[0];
    if (!next) {
      return;
    }
    setFile(next);
    setSaved(false);
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result || ""));
    reader.readAsDataURL(next);
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/");
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (!name.trim() || !skill || !area.trim()) {
      setError("Naam, profession aur area daalo");
      return;
    }
    setSaving(true);
    setError("");
    setSaved(false);

    const form = new FormData();
    form.set("name", name.trim());
    form.set("skill", skill);
    form.set("area", area.trim());
    if (file) {
      form.set("photo", file);
    }

    const res = await fetch("/api/workers/profile", {
      method: "POST",
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Profile save nahi hui");
      return;
    }
    setExists(true);
    setSaved(true);
    setFile(null);
    if (data.photo) {
      setPhoto(data.photo);
      setPreview("");
    }
    if (!exists) {
      router.push("/labour/home");
    }
  }

  const imageSrc = preview || photo;

  return (
    <DashShell
      kicker="Labour"
      title={exists ? "Meri profile" : "Profile banao"}
      nav={nav}
      active="/labour/profile"
      user={
        phone
          ? {
              name: name || "Naya labour",
              meta: phone,
              photo: imageSrc,
              initial: (name || "L").slice(0, 1).toUpperCase(),
            }
          : null
      }
      onLogout={logout}
    >
      <form className="dash-panel dash-form" onSubmit={saveProfile}>
        <p className="hint">
          {exists
            ? "Photo, naam aur profession yahan se update hota hai."
            : "Pehle profile complete karo, phir dashboard khulega."}
        </p>

        <div className="avatar-wrap">
          {imageSrc ? (
            <img className="avatar" src={imageSrc} alt={name || "Profile"} />
          ) : (
            <span className="avatar avatar-fallback">
              {(name || "L").trim().slice(0, 1).toUpperCase()}
            </span>
          )}
          <button
            className="avatar-edit"
            type="button"
            onClick={() => fileRef.current && fileRef.current.click()}
          >
            Photo
          </button>
          <input
            ref={fileRef}
            className="file-hidden"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={pickPhoto}
          />
        </div>
        <p className="hint">JPG, PNG ya WEBP. Max 2MB.</p>

        <label className="field-block">
          <span className="field-label">Naam</span>
          <input
            className="field"
            type="text"
            placeholder="Apna naam"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
          />
        </label>

        <label className="field-block">
          <span className="field-label">Phone</span>
          <input className="field field-locked" type="tel" value={phone} readOnly />
        </label>

        <label className="field-block">
          <span className="field-label">Profession</span>
          <select
            className="field"
            value={skill}
            onChange={(e) => {
              setSkill(e.target.value);
              setSaved(false);
            }}
          >
            <option value="" disabled>
              Profession chuno
            </option>
            {SKILLS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="field-block">
          <span className="field-label">Area</span>
          <input
            className="field"
            type="text"
            placeholder="Jaise Jaipur, Andheri"
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              setSaved(false);
            }}
          />
        </label>

        {error ? <p className="error">{error}</p> : null}
        {saved ? <p className="hint success-hint">Profile save ho gayi.</p> : null}

        <button className="btn btn-labour" type="submit" disabled={saving}>
          {saving
            ? "Save ho raha hai..."
            : exists
              ? "Profile update karo"
              : "Register karo"}
        </button>
      </form>
    </DashShell>
  );
}
