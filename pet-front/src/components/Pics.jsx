import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Wind } from "lucide-react";

import Cat  from "../assets/Cat.jpg";
import Dog  from "../assets/Dog.jpg";
import Bird from "../assets/Bird.jpg";
import Fish from "../assets/Fish.jpg";

/* ── Inject Poppins ── */
if (!document.getElementById("pics-poppins")) {
  const s = document.createElement("style");
  s.id = "pics-poppins";
  s.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
    .pics-root, .pics-root * { font-family: 'Poppins', sans-serif; box-sizing: border-box; }

    .pics-card {
      position: relative; cursor: pointer; overflow: hidden;
      border-radius: 28px;
      border: 1.5px solid rgba(255,255,255,0.7);
      box-shadow: 0 8px 28px rgba(0,0,0,0.1);
      transition: box-shadow 0.3s ease;
      transform-style: preserve-3d;
    }
    .pics-card:hover {
      box-shadow: 0 20px 52px rgba(0,0,0,0.16);
    }
    .pics-card img {
      width: 100%; height: 100%; object-fit: cover; display: block;
      transition: transform 0.6s ease;
    }
    .pics-card:hover img { transform: scale(1.09); }

    .pics-card-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(15,23,42,0.75) 0%, rgba(15,23,42,0.1) 55%, transparent 80%);
      opacity: 0; transition: opacity 0.35s ease;
      display: flex; flex-direction: column;
      align-items: center; justify-content: flex-end;
      padding: 20px 16px;
      border-radius: 28px;
    }
    .pics-card:hover .pics-card-overlay { opacity: 1; }

    .pics-card-label {
      color: #fff; font-weight: 700;
      font-size: 1.1rem; letter-spacing: 0.01em;
      transform: translateY(8px);
      transition: transform 0.3s ease;
    }
    .pics-card:hover .pics-card-label { transform: translateY(0); }

    .pics-card-arrow {
      margin-top: 7px; font-size: 0.75rem; font-weight: 500;
      color: rgba(255,255,255,0.75); letter-spacing: 0.05em;
      transform: translateY(8px);
      transition: transform 0.35s ease 0.05s, opacity 0.3s ease;
      opacity: 0;
    }
    .pics-card:hover .pics-card-arrow { transform: translateY(0); opacity: 1; }

    /* accent dot in corner */
    .pics-accent-dot {
      position: absolute; top: 14px; right: 14px;
      width: 10px; height: 10px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.8);
    }

    /* mobile circle variant */
    .pics-card-circle {
      border-radius: 50%;
    }
    .pics-card-circle .pics-card-overlay,
    .pics-card-circle img {
      border-radius: 50%;
    }

    /* cloud blur */
    @keyframes cloud-drift {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .cloud-track {
      display: flex; gap: 80px;
      animation: cloud-drift 9s linear infinite;
      width: max-content;
    }
  `;
  document.head.appendChild(s);
}

const TILT = 14;

const cards = [
  { image: Dog,  title: "Dogs",  route: "/dogs",  emoji: "🐶", dot: "#F59E0B" },
  { image: Cat,  title: "Cats",  route: "/cats",  emoji: "🐱", dot: "#EC4899" },
  { image: Bird, title: "Birds", route: "/birds", emoji: "🦜", dot: "#16A34A" },
  { image: Fish, title: "Fish",  route: "/fish",  emoji: "🐠", dot: "#0891B2" },
];

/* ── Card ── */
const PetCard = ({ card, index, tilt, onMove, onLeave, onNavigate, delay = 0, circle = false, size = 210 }) => (
  <motion.div
    initial={{ opacity: 0, y: 36, scale: 0.92 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.55, delay }}
    viewport={{ once: true }}
  >
    <motion.div
      className={`pics-card ${circle ? "pics-card-circle" : ""}`}
      style={{
        width: size, height: size,
        transform: `perspective(800px) rotateX(${tilt[index]?.x || 0}deg) rotateY(${tilt[index]?.y || 0}deg)`,
        transition: "transform 0.22s ease-out",
      }}
      onMouseMove={(e) => onMove(e, index)}
      onMouseLeave={() => onLeave(index)}
      onClick={() => onNavigate(card)}
      whileHover={{ scale: 1.04 }}
    >
      <img src={card.image} alt={card.title} />

      {/* Accent dot */}
      <div className="pics-accent-dot" style={{ background: card.dot }} />

      {/* Overlay */}
      <div className="pics-card-overlay">
        <div className="pics-card-label">{card.emoji} {card.title}</div>
        <div className="pics-card-arrow">Explore →</div>
      </div>
    </motion.div>
  </motion.div>
);

/* ── Loading Overlay ── */
const LoadingOverlay = ({ pet }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "linear-gradient(160deg, #EFF6FF 0%, #F0FDF4 40%, #FFF7ED 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", overflow: "hidden",
      fontFamily: "'Poppins', sans-serif",
    }}
  >
    {/* Clouds */}
    <div style={{ position: "absolute", top: 40, left: 0, width: "100%", overflow: "hidden", height: 50 }}>
      <div className="cloud-track">
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            width: 90, height: 28, background: "#fff",
            borderRadius: 999, opacity: 0.7,
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            flexShrink: 0,
          }} />
        ))}
        {[...Array(6)].map((_, i) => (
          <div key={i + 6} style={{
            width: 90, height: 28, background: "#fff",
            borderRadius: 999, opacity: 0.7,
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            flexShrink: 0,
          }} />
        ))}
      </div>
    </div>

    {/* Wind streaks */}
    <motion.div
      style={{ position: "absolute", left: "22%", top: "48%", display: "flex", gap: 8 }}
      initial={{ opacity: 0, x: 0 }}
      animate={{ opacity: [0, 1, 0], x: [0, 70, 140] }}
      transition={{ repeat: Infinity, duration: 1.3, ease: "easeInOut" }}
    >
      <Wind size={22} color="#93C5FD" />
      <Wind size={16} color="#BAE6FD" style={{ marginTop: 4 }} />
    </motion.div>

    {/* Flying dog */}
    <motion.div
      initial={{ x: "-65vw", y: 0, rotate: -4 }}
      animate={{ x: "65vw", y: [-12, 12, -12], rotate: [0, 4, -4, 0] }}
      transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
      style={{ position: "relative", display: "inline-flex" }}
    >
      <img
        src="https://cdn-icons-png.flaticon.com/512/616/616408.png"
        alt="SuperDog"
        style={{ width: 108, height: 108, objectFit: "contain" }}
      />
      {/* Cape */}
      <motion.div
        style={{
          position: "absolute", top: -6, right: 6,
          width: 36, height: 36,
          background: "linear-gradient(135deg, #EF4444, #DC2626)",
          borderRadius: "80% 20% 60% 20%",
          transformOrigin: "top right",
          boxShadow: "0 2px 8px rgba(220,38,38,0.35)",
        }}
        animate={{ rotate: [-18, 18, -18], skewX: [-5, 5, -5] }}
        transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
      />
    </motion.div>

    {/* Text */}
    <motion.div
      style={{ marginTop: 36, textAlign: "center" }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>
        SuperDog is flying you to the <span style={{ color: "#6366F1" }}>{pet}</span> page!
      </p>
      <motion.div
        style={{
          display: "flex", gap: 6, justifyContent: "center", alignItems: "center", marginTop: 4,
        }}
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ repeat: Infinity, duration: 1.2 }}
      >
        {["✈️", "🌍", "🐾"].map((e, i) => (
          <span key={i} style={{ fontSize: "1.2rem" }}>{e}</span>
        ))}
      </motion.div>
    </motion.div>

    {/* Loading bar */}
    <div style={{
      marginTop: 28, width: 200, height: 4, borderRadius: 999,
      background: "#E2E8F0", overflow: "hidden",
    }}>
      <motion.div
        style={{ height: "100%", background: "linear-gradient(90deg, #6366F1, #8B5CF6)", borderRadius: 999 }}
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
    </div>
  </motion.div>
);

/* ── Main Component ── */
const Pics = () => {
  const [tilt, setTilt] = useState({});
  const [loadingPet, setLoadingPet] = useState(null);
  const navigate = useNavigate();

  const handleMove = (e, index) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setTilt((p) => ({ ...p, [index]: { x: y * -TILT, y: x * TILT } }));
  };

  const handleLeave = (index) =>
    setTilt((p) => ({ ...p, [index]: { x: 0, y: 0 } }));

  const handleNavigate = (card) => {
    setLoadingPet(card.title);
    setTimeout(() => { setLoadingPet(null); navigate(card.route); }, 1800);
  };

  return (
    <section className="pics-root" style={{
      position: "relative",
      background: "linear-gradient(175deg, #F8FAFF 0%, #FFFFFF 50%, #F5F8FF 100%)",
      padding: "80px 24px 96px",
      overflow: "hidden",
    }}>
      {/* Background blobs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", width: 340, height: 340, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)",
          top: "10%", left: "10%",
        }} />
        <div style={{
          position: "absolute", width: 280, height: 280, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)",
          bottom: "10%", right: "12%",
        }} />
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {loadingPet && <LoadingOverlay pet={loadingPet} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        style={{ position: "relative", zIndex: 1, textAlign: "center" }}
      >
        {/* Header */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#EEF2FF", borderRadius: 999, padding: "5px 18px",
          marginBottom: 18, border: "1px solid #C7D2FE",
        }}>
          <span style={{ fontSize: "0.9rem" }}>🐾</span>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#4338CA",
            letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Our Pets
          </span>
        </div>

        <h2 style={{
          fontSize: "clamp(1.8rem, 4.5vw, 3rem)",
          fontWeight: 800, color: "#0F172A",
          margin: "0 0 14px", letterSpacing: "-0.03em", lineHeight: 1.15,
        }}>
          Meet Our <span style={{
            background: "linear-gradient(135deg, #6366F1, #EC4899)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Lovely Pets</span>
        </h2>

        <p style={{
          fontSize: "0.95rem", color: "#64748B", maxWidth: 440,
          margin: "0 auto 56px", lineHeight: 1.7, fontWeight: 400,
        }}>
          Find your perfect companion. Hover a card to explore, click to meet them.
        </p>

        {/* Desktop grid */}
        <div className="hidden sm:flex" style={{
          justifyContent: "center", flexWrap: "wrap", gap: 24,
        }}>
          {cards.map((card, i) => (
            <PetCard
              key={i} card={card} index={i} tilt={tilt}
              onMove={handleMove} onLeave={handleLeave}
              onNavigate={handleNavigate}
              delay={i * 0.12} size={210}
            />
          ))}
        </div>

        {/* Mobile: 2×2 circles */}
        <div className="flex sm:hidden" style={{
          flexDirection: "column", alignItems: "center", gap: 20,
        }}>
          {[cards.slice(0, 2), cards.slice(2)].map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap: 20, justifyContent: "center" }}>
              {row.map((card, ci) => {
                const idx = ri * 2 + ci;
                return (
                  <PetCard
                    key={idx} card={card} index={idx} tilt={tilt}
                    onMove={handleMove} onLeave={handleLeave}
                    onNavigate={handleNavigate}
                    delay={idx * 0.1} size={138} circle
                  />
                );
              })}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Pics;