"use client";

import Link from "next/link";

export function DashShell({
  kicker,
  title,
  nav,
  active,
  user,
  onLogout,
  children,
}) {
  return (
    <div className="dash">
      <aside className="dash-side">
        <Link href="/" className="dash-brand">
          <span className="brand-mark">LC</span>
          <div>
            <p className="dash-brand-name">LabourChowk</p>
            <p className="dash-brand-tag">{kicker}</p>
          </div>
        </Link>
        <nav className="dash-nav">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                "dash-link" + (active === item.href ? " is-active" : "")
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button className="dash-logout" type="button" onClick={onLogout}>
          Logout
        </button>
      </aside>
      <div className="dash-body">
        <header className="dash-top">
          <div>
            <p className="section-kicker">{kicker}</p>
            <h1 className="dash-title">{title}</h1>
          </div>
          {user ? (
            <div className="dash-user">
              {user.photo ? (
                <img src={user.photo} alt="" />
              ) : (
                <span>{user.initial || "A"}</span>
              )}
              <div>
                <p className="dash-user-name">{user.name}</p>
                <p className="dash-user-meta">{user.meta}</p>
              </div>
            </div>
          ) : null}
        </header>
        <div className="dash-content">{children}</div>
      </div>
    </div>
  );
}
