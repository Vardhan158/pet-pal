// src/components/OfferBanner.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

/* ── Inject Poppins ── */
if (!document.getElementById("poppins-banner-font")) {
  const s = document.createElement("style");
  s.id = "poppins-banner-font";
  s.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

    .ob-root * { box-sizing: border-box; }

    @keyframes ob-marquee {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes ob-pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.5; transform: scale(0.75); }
    }
    @keyframes ob-shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }

    .ob-code {
      display: inline-flex; align-items: center; gap: 5px;
      background: rgba(255,255,255,0.22);
      border: 1px solid rgba(255,255,255,0.38);
      border-radius: 8px;
      padding: 2px 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      font-size: 0.82rem;
      color: #fff;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: background 0.2s;
      backdrop-filter: blur(4px);
    }
    .ob-code::after {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
      background-size: 200% 100%;
      animation: ob-shimmer 2.4s ease infinite;
    }
    .ob-code:hover { background: rgba(255,255,255,0.32); }

    .ob-pip {
      width: 5px; height: 5px; border-radius: 50%;
      background: rgba(255,255,255,0.55);
      animation: ob-pulse-dot 1.6s ease infinite;
      flex-shrink: 0;
    }

    .ob-chip {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 0.82rem; font-weight: 500;
      padding: 4px 12px; border-radius: 999px;
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.28);
      white-space: nowrap; color: #fff;
    }

    .ob-divider {
      width: 1px; height: 20px;
      background: rgba(255,255,255,0.3);
      flex-shrink: 0;
    }

    /* scrolling ticker for mobile */
    .ob-ticker-wrap {
      overflow: hidden;
      display: flex;
      width: 100%;
    }
    .ob-ticker-track {
      display: flex; align-items: center; gap: 32px;
      animation: ob-marquee 18s linear infinite;
      width: max-content;
    }
    .ob-ticker-track:hover { animation-play-state: paused; }
  `;
  document.head.appendChild(s);
}

const itemVariants = {
  hidden:  { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  exit:    { opacity: 0, y: 10,  transition: { duration: 0.3 } },
};

function CopyCode({ code }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <span className="ob-code" onClick={handleCopy} title="Click to copy">
      {copied ? "✓ Copied!" : code}
    </span>
  );
}

function OfferChips({ offer }) {
  const msg      = offer?.message  || "Free Shipping on Orders Above ₹999";
  const discount = offer?.discount ? `${offer.discount}% OFF on Pet Essentials` : "20% OFF on Pet Essentials";
  const code     = offer?.code     || "PETLOVE20";

  return (
    <motion.div
      key={offer?._id || "default"}
      variants={itemVariants}
      initial="hidden" animate="visible" exit="exit"
      style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "center" }}
    >
      <span className="ob-chip">🚚 {msg}</span>
      <div className="ob-divider" />
      <span className="ob-chip">🎁 {discount}</span>
      <div className="ob-divider" />
      <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "rgba(255,255,255,0.9)", whiteSpace: "nowrap" }}>
        🐾 Use Code: <CopyCode code={code} />
      </span>
    </motion.div>
  );
}

function MobileTicker({ offer }) {
  const msg      = offer?.message  || "Free Shipping on Orders Above ₹999";
  const discount = offer?.discount ? `${offer.discount}% OFF` : "20% OFF";
  const code     = offer?.code     || "PETLOVE20";
  const items    = [`🚚 ${msg}`, `🎁 ${discount} on Pet Essentials`, `🐾 Code: ${code}`];
  const doubled  = [...items, ...items]; // seamless loop

  return (
    <div className="ob-ticker-wrap">
      <div className="ob-ticker-track">
        {doubled.map((item, i) => (
          <span key={i} style={{ fontSize: "0.8rem", fontWeight: 500, color: "#fff", whiteSpace: "nowrap" }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function OfferBanner() {
  const [offer, setOffer] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  const fetchActiveOffer = async () => {
    try {
      const { data } = await axios.get("https://pet-pal-x74f.onrender.com/api/offers");
      setOffer(data.success && data.offer ? data.offer : null);
    } catch {
      setOffer(null);
    }
  };

  useEffect(() => {
    fetchActiveOffer();
    const interval = setInterval(fetchActiveOffer, 30000);
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => { clearInterval(interval); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <motion.div
      className="ob-root"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        fontFamily: "'Poppins', sans-serif",
        /* warm peach-to-coral gradient — feels pet-brand, light and friendly */
        background: "linear-gradient(100deg, #FF8C69 0%, #FF6B6B 40%, #FF8E53 80%, #FFA94D 100%)",
        boxShadow: "0 2px 16px rgba(255,107,107,0.28)",
      }}
    >
      {/* Soft background texture blobs */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", width: 120, height: 120, borderRadius: "50%",
          background: "rgba(255,255,255,0.10)", top: -40, left: -30,
        }} />
        <div style={{
          position: "absolute", width: 80, height: 80, borderRadius: "50%",
          background: "rgba(255,255,255,0.08)", bottom: -30, right: 80,
        }} />
        <div style={{
          position: "absolute", width: 60, height: 60, borderRadius: "50%",
          background: "rgba(255,255,255,0.07)", top: -20, right: "30%",
        }} />
      </div>

      {/* Decorative paws */}
      <span style={{
        position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
        fontSize: "1.6rem", opacity: 0.15, pointerEvents: "none", userSelect: "none",
      }}>🐾</span>
      <span style={{
        position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
        fontSize: "1.6rem", opacity: 0.15, pointerEvents: "none", userSelect: "none",
      }}>🐾</span>

      {/* Live dot */}
      <div style={{
        position: "absolute", top: "50%", left: isMobile ? 32 : 44,
        transform: "translateY(-50%)",
        display: "flex", alignItems: "center", gap: 4,
        opacity: 0.8,
      }}>
        <span className="ob-pip" />
      </div>

      {/* Content area */}
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: isMobile ? "10px 44px" : "11px 56px",
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: 44,
      }}>
        <AnimatePresence mode="wait">
          {isMobile
            ? <MobileTicker key="ticker" offer={offer} />
            : <OfferChips key="chips" offer={offer} />
          }
        </AnimatePresence>
      </div>
    </motion.div>
  );
}