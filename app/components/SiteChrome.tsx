import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="home-nav">
      <div className="container">
        <div className="home-top">
          <Link href="/" className="brand">
            <span className="brand-mark">LC</span>
            <div>
              <p className="home-logo">LabourChowk</p>
              <p className="brand-tag">Ghar ka kaam, yahin se</p>
            </div>
          </Link>
          <div className="home-actions">
            <Link href="/search" className="btn-mini btn-thekedar">
              Labour dhundo
            </Link>
            <Link href="/labour" className="btn-mini btn-labour">
              Main labour hoon
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="home-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-brand">
              <span className="brand-mark">LC</span>
              <p className="footer-logo">LabourChowk</p>
            </div>
            <p className="footer-intro">
              Ghar me paint, plumbing, ya koi kaam hai? Yahan se aaj available
              labour dhundo, call karo ya WhatsApp karo.
            </p>
          </div>
          <div className="footer-col">
            <p className="footer-heading">Quick links</p>
            <div className="footer-links">
              <Link href="/terms">Terms &amp; Conditions</Link>
              <Link href="/privacy">Privacy Policy</Link>
            </div>
          </div>
          <div className="footer-col">
            <p className="footer-heading">Social</p>
            <div className="footer-social">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
                Instagram
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1z"
                  />
                </svg>
                Facebook
              </a>
            </div>
          </div>
        </div>
        <p className="footer-copy">© 2026 LabourChowk. All rights reserved.</p>
      </div>
    </footer>
  );
}
