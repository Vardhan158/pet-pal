// src/pages/home/HeroIntro.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import bgVideo1 from "../assets/bgVideo.mp4";
import bgVideo2 from "../assets/Bird.mp4";
import bgVideo3 from "../assets/Fish.mp4";

/* ── Poppins ── */
if (!document.head.querySelector("[href*='Poppins']")) {
  const link = document.createElement("link");
  link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

/* ── Keyframes ── */
if (!document.head.querySelector("#hero-keyframes")) {
  const style = document.createElement("style");
  style.id = "hero-keyframes";
  style.textContent = `
    @keyframes hero-float   { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-18px) rotate(8deg)} }
    @keyframes hero-float-r { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(14px) rotate(-8deg)} }
    @keyframes hero-scroll  { 0%,100%{transform:translateY(0);opacity:1} 50%{transform:translateY(8px);opacity:0.5} }
    @keyframes hero-shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
    @keyframes hero-drift   { 0%{transform:translateY(0) rotate(0deg) scale(1)} 33%{transform:translateY(-30px) rotate(15deg) scale(1.1)} 66%{transform:translateY(10px) rotate(-10deg) scale(0.9)} 100%{transform:translateY(0) rotate(0deg) scale(1)} }
    @keyframes dot-pulse    { 0%,100%{opacity:0.4;transform:scaleX(1)} 50%{opacity:1;transform:scaleX(1.3)} }
  `;
  document.head.appendChild(style);
}

const VIDEOS = [bgVideo1, bgVideo2, bgVideo3];
const VIDEO_LABELS = ["Dogs", "Birds", "Fish"];

const DRIFT_EMOJIS = [
  { e: "💖", l: "12%",  t: "18%", d: 5.2 },
  { e: "🐾", l: "78%",  t: "12%", d: 7.1 },
  { e: "🐕", l: "88%",  t: "55%", d: 6.0 },
  { e: "🐈", l: "5%",   t: "65%", d: 8.3 },
  { e: "🐟", l: "55%",  t: "78%", d: 5.8 },
  { e: "🌿", l: "32%",  t: "8%",  d: 9.0 },
  { e: "✨", l: "65%",  t: "42%", d: 6.5 },
];

const S = {
  root: {
    fontFamily: "'Poppins', sans-serif",
    position: "relative",
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    background: "#0a0614",
  },

  /* Video layer */
  videoBg: {
    position: "absolute", inset: 0, zIndex: 0, overflow: "hidden",
  },
  video: {
    position: "absolute", inset: 0,
    width: "100%", height: "100%",
    objectFit: "cover",
    filter: "brightness(0.45) saturate(0.8)",
  },

  /* Overlays */
  gradientTop: {
    position: "absolute", inset: 0,
    background: "linear-gradient(180deg, rgba(10,6,20,0.6) 0%, rgba(10,6,20,0.15) 40%, rgba(10,6,20,0.7) 100%)",
    zIndex: 1,
  },
  gradientSide: {
    position: "absolute", inset: 0,
    background: "radial-gradient(ellipse at 50% 60%, rgba(99,102,241,0.12) 0%, transparent 70%)",
    zIndex: 1,
  },
  noiseOverlay: {
    position: "absolute", inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
    backgroundRepeat: "repeat",
    backgroundSize: "180px",
    opacity: 0.5,
    zIndex: 2,
    pointerEvents: "none",
  },

  /* Video indicator dots */
  dotsRow: {
    position: "absolute", top: 28, left: "50%",
    transform: "translateX(-50%)",
    display: "flex", gap: 8,
    zIndex: 10,
  },
  dot: (active) => ({
    height: 3,
    width: active ? 28 : 10,
    borderRadius: 4,
    background: active ? "#a5b4fc" : "rgba(255,255,255,0.3)",
    animation: active ? "dot-pulse 1.5s ease-in-out infinite" : "none",
    transition: "width 0.4s ease",
  }),

  /* Floating corner pets */
  floatLeft: {
    position: "absolute", left: "7%", top: "14%",
    fontSize: 68, opacity: 0.22,
    zIndex: 3, pointerEvents: "none",
    animation: "hero-float 7s ease-in-out infinite",
  },
  floatRight: {
    position: "absolute", right: "7%", bottom: "18%",
    fontSize: 68, opacity: 0.22,
    zIndex: 3, pointerEvents: "none",
    animation: "hero-float-r 8s ease-in-out infinite",
  },

  /* Drifting background emojis */
  driftEmoji: (item) => ({
    position: "absolute",
    left: item.l, top: item.t,
    fontSize: 20, opacity: 0.15,
    zIndex: 3, pointerEvents: "none",
    animation: `hero-drift ${item.d}s ease-in-out infinite`,
  }),

  /* Main content */
  content: {
    position: "relative", zIndex: 5,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    textAlign: "center",
    minHeight: "85vh",
    padding: "0 24px",
    maxWidth: 860,
  },

  /* Category chip */
  chip: {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "rgba(99,102,241,0.2)",
    border: "1px solid rgba(165,180,252,0.4)",
    backdropFilter: "blur(8px)",
    borderRadius: 30,
    padding: "6px 18px",
    marginBottom: 28,
  },
  chipDot: {
    width: 6, height: 6, borderRadius: "50%",
    background: "#a5b4fc",
    animation: "dot-pulse 2s ease-in-out infinite",
  },
  chipText: {
    fontSize: 12, fontWeight: 600,
    color: "#c7d2fe", letterSpacing: 1,
    textTransform: "uppercase",
  },

  /* Title */
  title: {
    fontSize: "clamp(38px, 7vw, 82px)",
    fontWeight: 900,
    lineHeight: 1.08,
    letterSpacing: "-1.5px",
    color: "#fff",
    margin: "0 0 22px",
    textShadow: "0 2px 40px rgba(0,0,0,0.5)",
  },
  titleAccent: {
    background: "linear-gradient(135deg, #a5b4fc 0%, #818cf8 40%, #c084fc 100%)",
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    animation: "hero-shimmer 4s linear infinite",
  },

  /* Subtitle */
  subtitle: {
    fontSize: "clamp(15px, 2.2vw, 20px)",
    fontWeight: 400,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 1.75,
    maxWidth: 540,
    margin: "0 0 40px",
  },
  subtitleAccent: {
    color: "#a5b4fc", fontWeight: 600,
  },

  /* CTA buttons */
  ctaRow: {
    display: "flex", flexWrap: "wrap",
    gap: 14, justifyContent: "center",
    marginBottom: 0,
  },
  primaryBtn: {
    display: "flex", alignItems: "center", gap: 8,
    background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
    border: "none",
    borderRadius: 50,
    padding: "14px 32px",
    fontSize: 15, fontWeight: 700,
    color: "#fff",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 6px 24px rgba(99,102,241,0.5)",
    transition: "all 0.2s",
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    display: "flex", alignItems: "center", gap: 8,
    background: "rgba(255,255,255,0.08)",
    border: "1.5px solid rgba(255,255,255,0.28)",
    borderRadius: 50,
    padding: "13px 30px",
    fontSize: 15, fontWeight: 600,
    color: "rgba(255,255,255,0.9)",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    backdropFilter: "blur(10px)",
    transition: "all 0.2s",
    letterSpacing: 0.3,
  },

  /* Stats strip */
  statsRow: {
    display: "flex", gap: 32,
    marginTop: 48, flexWrap: "wrap",
    justifyContent: "center",
  },
  statItem: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 2,
  },
  statNum: {
    fontSize: 22, fontWeight: 800,
    color: "#fff", letterSpacing: "-0.5px",
  },
  statLabel: {
    fontSize: 11, fontWeight: 500,
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase", letterSpacing: 0.8,
  },
  statDivider: {
    width: 1, height: 32,
    background: "rgba(255,255,255,0.15)",
    alignSelf: "center",
  },

  /* Scroll indicator */
  scrollWrap: {
    position: "absolute", bottom: 28,
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 6, zIndex: 5,
  },
  scrollText: {
    fontSize: 11, fontWeight: 500,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase", letterSpacing: 1.2,
  },
  scrollBar: {
    width: 1.5, height: 40,
    background: "linear-gradient(180deg, rgba(165,180,252,0.8), transparent)",
    animation: "hero-scroll 1.8s ease-in-out infinite",
    borderRadius: 2,
  },
};

export default function HeroIntro() {
  const navigate = useNavigate();
  const [currentVideo, setCurrentVideo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % VIDEOS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={S.root}>

      {/* ── Video background ── */}
      <div style={S.videoBg}>
        <AnimatePresence mode="wait">
          <motion.video
            key={currentVideo}
            autoPlay loop muted playsInline
            style={S.video}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          >
            <source src={VIDEOS[currentVideo]} type="video/mp4" />
          </motion.video>
        </AnimatePresence>
        <div style={S.gradientTop} />
        <div style={S.gradientSide} />
        <div style={S.noiseOverlay} />
      </div>

      {/* ── Video dots ── */}
      <div style={S.dotsRow}>
        {VIDEOS.map((_, i) => (
          <div key={i} style={S.dot(i === currentVideo)} onClick={() => setCurrentVideo(i)} />
        ))}
      </div>

      {/* ── Floating corner icons ── */}
      <div style={S.floatLeft}>🐾</div>
      <div style={S.floatRight}>🐕</div>

      {/* ── Background drifting emojis ── */}
      {DRIFT_EMOJIS.map((item, i) => (
        <div key={i} style={S.driftEmoji(item)}>{item.e}</div>
      ))}

      {/* ── Main content ── */}
      <motion.section
        style={S.content}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      >
        {/* Category chip */}
        <motion.div
          style={S.chip}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div style={S.chipDot} />
          <span style={S.chipText}>🐾 &nbsp; Find your perfect companion</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          style={S.title}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.9 }}
        >
          Welcome to{" "}
          <span style={S.titleAccent}>Pet Paradise</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          style={S.subtitle}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.8 }}
        >
          Your one-stop shop for{" "}
          <span style={S.subtitleAccent}>pets, care & love</span>.{" "}
          Adopt, shop, or pamper your furry, feathery, and finned friends today 🐾
        </motion.p>

        {/* CTAs */}
        <motion.div
          style={S.ctaRow}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.7 }}
        >
          <motion.button
            style={S.primaryBtn}
            whileHover={{ scale: 1.05, boxShadow: "0 10px 32px rgba(99,102,241,0.65)" }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/pets")}
          >
            <span>🛍️</span> Shop Pets
          </motion.button>

          <motion.button
            style={S.secondaryBtn}
            whileHover={{ background: "rgba(255,255,255,0.16)", borderColor: "rgba(255,255,255,0.5)" }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/sell")}
          >
            <span>🐾</span> Sell a Pet
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          style={S.statsRow}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.7 }}
        >
          {[
            { num: "2,400+", label: "Pets Adopted" },
            null,
            { num: "980+",   label: "Happy Sellers" },
            null,
            { num: "4.9 ★",  label: "Avg. Rating" },
          ].map((item, i) =>
            item === null
              ? <div key={i} style={S.statDivider} />
              : (
                <div key={i} style={S.statItem}>
                  <span style={S.statNum}>{item.num}</span>
                  <span style={S.statLabel}>{item.label}</span>
                </div>
              )
          )}
        </motion.div>
      </motion.section>

      {/* ── Scroll indicator ── */}
      <div style={S.scrollWrap}>
        <span style={S.scrollText}>Scroll to explore</span>
        <div style={S.scrollBar} />
      </div>
    </div>
  );
}