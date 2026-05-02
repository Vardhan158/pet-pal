import React from "react";
import LOGO from "../assets/Logo.jpg";

/* ── Poppins via Google Fonts ── */
if (!document.head.querySelector("[href*='Poppins']")) {
  const link = document.createElement("link");
  link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

/* ── Keyframes ── */
if (!document.head.querySelector("#footer-keyframes")) {
  const style = document.createElement("style");
  style.id = "footer-keyframes";
  style.textContent = `
    @keyframes footer-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.6; transform: scale(0.85); }
    }
    @keyframes footer-float {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-4px); }
    }
  `;
  document.head.appendChild(style);
}

const NAV_LINKS = [
  { href: "/shop",     label: "Shop",     icon: "🛍️" },
  { href: "/adopt",    label: "Adopt",    icon: "🐾" },
  { href: "/services", label: "Grooming", icon: "✂️" },
  { href: "/contact",  label: "Contact",  icon: "📞" },
  { href: "/about",    label: "About Us", icon: "💖" },
];

const SOCIALS = [
  {
    href: "https://facebook.com",
    label: "Facebook",
    color: "#6366f1",
    path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
  },
  {
    href: "https://instagram.com",
    label: "Instagram",
    color: "#818cf8",
    path: "M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5",
    extra: "M16 11.37a4 4 0 1 1-7.914 1.173A4 4 0 0 1 16 11.37m1.5-4.87h.01",
  },
  {
    href: "https://twitter.com",
    label: "Twitter / X",
    color: "#a5b4fc",
    path: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2",
  },
];

const S = {
  footer: {
    fontFamily: "'Poppins', sans-serif",
    background: "linear-gradient(180deg, #fafaff 0%, #f5f3ff 40%, #eef2ff 100%)",
    borderTop: "1px solid #e8e4fc",
    padding: "56px 24px 32px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },

  /* Decorative blobs */
  blob1: {
    position: "absolute", top: -80, right: -60,
    width: 260, height: 260, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  blob2: {
    position: "absolute", bottom: -40, left: -50,
    width: 200, height: 200, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
    pointerEvents: "none",
  },

  /* Brand */
  brandWrap: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 14,
    textAlign: "center", position: "relative", zIndex: 1,
    marginBottom: 40,
  },
  logoRow: {
    display: "flex", alignItems: "center", gap: 12,
  },
  logoImgWrap: {
    width: 48, height: 48, borderRadius: "50%",
    border: "2.5px solid #c7d2fe",
    boxShadow: "0 4px 16px rgba(99,102,241,0.2)",
    overflow: "hidden", flexShrink: 0,
  },
  logoImg: { width: "100%", height: "100%", objectFit: "cover" },
  logoText: {
    fontSize: 26, fontWeight: 800,
    color: "#1e1b4b", margin: 0, letterSpacing: "-0.5px",
  },
  logoAccent: { color: "#6366f1" },
  tagline: {
    fontSize: 13, fontWeight: 400,
    color: "#64748b", maxWidth: 380,
    lineHeight: 1.65, margin: 0,
  },
  emojiRow: {
    display: "flex", gap: 6, fontSize: 18,
    marginTop: 2,
  },
  emojiBounce: (i) => ({
    display: "inline-block",
    animation: `footer-float 2.4s ease-in-out ${i * 0.3}s infinite`,
  }),

  /* Divider */
  divider: {
    width: "100%", maxWidth: 560,
    height: 1,
    background: "linear-gradient(90deg, transparent, #c7d2fe, transparent)",
    marginBottom: 36, position: "relative", zIndex: 1,
  },

  /* Nav links */
  navRow: {
    display: "flex", flexWrap: "wrap",
    justifyContent: "center", gap: 8,
    marginBottom: 36, position: "relative", zIndex: 1,
  },
  navLink: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "8px 16px",
    borderRadius: 30,
    background: "#fff",
    border: "1.5px solid #e8e4fc",
    color: "#4338ca",
    fontSize: 13, fontWeight: 500,
    textDecoration: "none",
    transition: "all 0.2s",
    boxShadow: "0 2px 8px rgba(99,102,241,0.06)",
  },

  /* Socials */
  socialsRow: {
    display: "flex", alignItems: "center", gap: 12,
    marginBottom: 36, position: "relative", zIndex: 1,
  },
  socialBtn: {
    width: 42, height: 42,
    borderRadius: 12,
    background: "#fff",
    border: "1.5px solid #e8e4fc",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 10px rgba(99,102,241,0.08)",
    transition: "all 0.2s",
    textDecoration: "none",
    flexShrink: 0,
  },

  /* Bottom bar */
  bottomBar: {
    display: "flex", flexWrap: "wrap",
    alignItems: "center", justifyContent: "center",
    gap: 6, position: "relative", zIndex: 1,
  },
  copyright: {
    fontSize: 12, fontWeight: 400,
    color: "#94a3b8", margin: 0, textAlign: "center",
  },
  copyrightBrand: { color: "#6366f1", fontWeight: 600 },
  heartPulse: {
    display: "inline-block",
    animation: "footer-pulse 1.8s ease-in-out infinite",
  },
  badge: {
    display: "inline-flex", alignItems: "center", gap: 4,
    background: "#ede9fe", color: "#6366f1",
    fontSize: 11, fontWeight: 600,
    padding: "3px 10px", borderRadius: 20,
    border: "1px solid #c7d2fe",
  },
};

const EMOJIS = ["🐶", "🐱", "🐦", "🐠", "🐰"];

export default function Footer() {
  return (
    <footer style={S.footer}>
      {/* Blobs */}
      <div style={S.blob1} />
      <div style={S.blob2} />

      {/* ── Brand ── */}
      <div style={S.brandWrap}>
        <div style={S.logoRow}>
          <div style={S.logoImgWrap}>
            <img src={LOGO} alt="PetWorld" style={S.logoImg} />
          </div>
          <h1 style={S.logoText}>
            Pet<span style={S.logoAccent}>World</span>
          </h1>
        </div>

        <p style={S.tagline}>
          Your one-stop destination for pet adoption, care, food, and supplies.
          Bringing love and joy to every home.
        </p>

        <div style={S.emojiRow}>
          {EMOJIS.map((e, i) => (
            <span key={i} style={S.emojiBounce(i)}>{e}</span>
          ))}
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={S.divider} />

      {/* ── Nav links ── */}
      <nav style={S.navRow}>
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            style={S.navLink}
            onMouseEnter={e => {
              e.currentTarget.style.background = "linear-gradient(135deg, #6366f1, #818cf8)";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.border = "1.5px solid transparent";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(99,102,241,0.3)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.color = "#4338ca";
              e.currentTarget.style.border = "1.5px solid #e8e4fc";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(99,102,241,0.06)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </a>
        ))}
      </nav>

      {/* ── Socials ── */}
      <div style={S.socialsRow}>
        {SOCIALS.map((s) => (
          <a
            key={s.href}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            aria-label={s.label}
            style={S.socialBtn}
            onMouseEnter={e => {
              e.currentTarget.style.background = s.color;
              e.currentTarget.style.borderColor = s.color;
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = `0 6px 16px ${s.color}55`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.borderColor = "#e8e4fc";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(99,102,241,0.08)";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d={s.path} stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {s.extra && <path d={s.extra} stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
            </svg>
          </a>
        ))}
      </div>

      {/* ── Bottom bar ── */}
      <div style={S.bottomBar}>
        <p style={S.copyright}>
          © 2025 <span style={S.copyrightBrand}>PetWorld</span>. All rights reserved.
          Crafted with <span style={S.heartPulse}>🐾</span> love for pets everywhere.
        </p>
        <span style={S.badge}>
          <span>✨</span> Made with care
        </span>
      </div>
    </footer>
  );
}