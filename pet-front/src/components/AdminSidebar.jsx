import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Poppins via Google Fonts ── */
if (!document.head.querySelector("[href*='Poppins']")) {
  const link = document.createElement("link");
  link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

/* ── Keyframes ── */
if (!document.head.querySelector("#sidebar-keyframes")) {
  const style = document.createElement("style");
  style.id = "sidebar-keyframes";
  style.textContent = `
    @keyframes shimmer-line {
      0%   { transform: translateX(-100%); }
      100% { transform: translateX(250%); }
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.5; transform: scale(0.8); }
    }
  `;
  document.head.appendChild(style);
}

const NAV_LINKS = [
  { id: "pending",   label: "Pending Pets",    icon: "⏳", desc: "Awaiting review"   },
  { id: "approved",  label: "Approved Pets",   icon: "✅", desc: "Live listings"      },
  { id: "rejected",  label: "Rejected Pets",   icon: "❌", desc: "Declined entries"   },
  { id: "sellers",   label: "Sellers",         icon: "🏪", desc: "Manage sellers"     },
  { id: "users",     label: "Users",           icon: "👥", desc: "All registered"     },
  { id: "offers",    label: "Manage Offers",   icon: "🎁", desc: "Promos & deals"     },
  { id: "addSeller", label: "Add Seller",      icon: "➕", desc: "Onboard new seller" },
];

const S = {
  aside: {
    width: 260,
    minHeight: "100vh",
    background: "linear-gradient(180deg, #fafaff 0%, #f5f3ff 60%, #eef2ff 100%)",
    borderRight: "1px solid #e8e4fc",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Poppins', sans-serif",
    boxShadow: "4px 0 24px rgba(99,102,241,0.07)",
    flexShrink: 0,
    position: "relative",
    overflow: "hidden",
  },

  /* Decorative blob */
  blob: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  blob2: {
    position: "absolute",
    bottom: 80,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
    pointerEvents: "none",
  },

  /* Brand header */
  header: {
    padding: "28px 22px 20px",
    borderBottom: "1px solid #ede9fe",
    position: "relative",
    zIndex: 1,
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    marginBottom: 4,
  },
  logoBox: {
    width: 38,
    height: 38,
    background: "linear-gradient(135deg, #6366f1, #818cf8)",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 17,
    boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
    flexShrink: 0,
  },
  logoText: {
    fontSize: 16,
    fontWeight: 800,
    color: "#1e1b4b",
    letterSpacing: "-0.4px",
    margin: 0,
    lineHeight: 1.2,
  },
  logoSub: {
    fontSize: 10,
    fontWeight: 500,
    color: "#a5b4fc",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    margin: 0,
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    padding: "6px 10px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#22c55e",
    animation: "pulse-dot 2s ease-in-out infinite",
    flexShrink: 0,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 600,
    color: "#15803d",
    letterSpacing: 0.4,
  },

  /* Nav */
  nav: {
    flex: 1,
    padding: "16px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    overflowY: "auto",
    position: "relative",
    zIndex: 1,
  },
  navLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: "#c4b5fd",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    padding: "4px 10px 8px",
    margin: 0,
  },

  /* Nav item */
  navItem: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "10px 12px",
    borderRadius: 12,
    cursor: "pointer",
    border: "none",
    width: "100%",
    textAlign: "left",
    fontFamily: "'Poppins', sans-serif",
    background: active
      ? "linear-gradient(135deg, #6366f1, #818cf8)"
      : "transparent",
    boxShadow: active ? "0 4px 14px rgba(99,102,241,0.3)" : "none",
    transition: "background 0.2s, box-shadow 0.2s",
    position: "relative",
    overflow: "hidden",
  }),
  navIcon: (active) => ({
    width: 32,
    height: 32,
    borderRadius: 8,
    background: active ? "rgba(255,255,255,0.2)" : "#ede9fe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    flexShrink: 0,
    transition: "background 0.2s",
  }),
  navTextWrap: { flex: 1, minWidth: 0 },
  navLabel_: (active) => ({
    fontSize: 13,
    fontWeight: active ? 700 : 500,
    color: active ? "#fff" : "#3730a3",
    margin: 0,
    lineHeight: 1.3,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    transition: "color 0.2s",
  }),
  navDesc: (active) => ({
    fontSize: 10,
    fontWeight: 400,
    color: active ? "rgba(255,255,255,0.7)" : "#a5b4fc",
    margin: 0,
    lineHeight: 1,
    transition: "color 0.2s",
  }),
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.7)",
    flexShrink: 0,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "40%",
    height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
    animation: "shimmer-line 1.6s ease-in-out",
    pointerEvents: "none",
  },

  divider: {
    height: 1,
    background: "linear-gradient(90deg, transparent, #e8e4fc, transparent)",
    margin: "8px 14px",
  },

  /* Footer */
  footer: {
    padding: "14px 14px 22px",
    borderTop: "1px solid #ede9fe",
    position: "relative",
    zIndex: 1,
  },
  logoutBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "11px",
    borderRadius: 12,
    border: "1.5px solid #fecdd3",
    background: "#fff1f2",
    color: "#be123c",
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "'Poppins', sans-serif",
    cursor: "pointer",
    transition: "all 0.2s",
  },
};

export default function AdminSidebar({ setView, currentView }) {
  const [justActivated, setJustActivated] = useState(null);

  const handleNav = (id) => {
    setJustActivated(id);
    setView(id);
    setTimeout(() => setJustActivated(null), 1600);
  };

  return (
    <motion.aside
      style={S.aside}
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.34, 1.1, 0.64, 1] }}
    >
      {/* Decorative blobs */}
      <div style={S.blob} />
      <div style={S.blob2} />

      {/* ── Brand header ── */}
      <div style={S.header}>
        <div style={S.logoWrap}>
          <div style={S.logoBox}>🛠</div>
          <div>
            <p style={S.logoText}>Admin Panel</p>
            <p style={S.logoSub}>Management Console</p>
          </div>
        </div>
        <div style={S.statusRow}>
          <div style={S.statusDot} />
          <span style={S.statusText}>System Online · All systems normal</span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={S.nav}>
        <p style={S.navLabel}>Navigation</p>

        {NAV_LINKS.map((link) => {
          const active = currentView === link.id;
          const shimmerActive = justActivated === link.id;

          return (
            <motion.button
              key={link.id}
              style={S.navItem(active)}
              onClick={() => handleNav(link.id)}
              whileHover={!active ? { backgroundColor: "#f0edff", x: 2 } : {}}
              whileTap={{ scale: 0.97 }}
            >
              {/* Shimmer on activation */}
              {shimmerActive && <span style={S.shimmer} />}

              <div style={S.navIcon(active)}>{link.icon}</div>

              <div style={S.navTextWrap}>
                <p style={S.navLabel_(active)}>{link.label}</p>
                <p style={S.navDesc(active)}>{link.desc}</p>
              </div>

              {active && (
                <motion.div
                  style={S.activeDot}
                  layoutId="active-dot"
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                />
              )}
            </motion.button>
          );
        })}

        <div style={S.divider} />
      </nav>

      {/* ── Footer / Logout ── */}
      <div style={S.footer}>
        <motion.button
          style={S.logoutBtn}
          whileHover={{ background: "#ffe4e6", boxShadow: "0 4px 14px rgba(190,18,60,0.15)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { localStorage.clear(); window.location.href = "/auth"; }}
        >
          <span>🚪</span>
          <span>Logout</span>
        </motion.button>
      </div>
    </motion.aside>
  );
}