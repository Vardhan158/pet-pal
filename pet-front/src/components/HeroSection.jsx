import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Dog1 from "../assets/Dog1.jpg";
import Cat  from "../assets/Cat.jpg";
import Bird from "../assets/Bird.jpg";
import Fish from "../assets/Fish.jpg";

/* ─── Font inject (once) ─── */
if (!document.querySelector("#poppins-font")) {
  const l = document.createElement("link");
  l.id = "poppins-font";
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap";
  document.head.appendChild(l);
}

/* ─── Styles ─── */
const css = `
  .hs-root, .hs-root * { font-family: 'Poppins', sans-serif; box-sizing: border-box; }

  /* ── Section ── */
  .hs-section {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .hs-row {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3rem;
    padding: 5.5rem 1.5rem;
    overflow: hidden;
    border-bottom: 1px solid rgba(0,0,0,0.04);
  }
  @media (min-width: 768px) {
    .hs-row {
      flex-direction: row;
      justify-content: space-between;
      padding: 6rem 5rem;
      gap: 4rem;
    }
    .hs-row.reverse { flex-direction: row-reverse; }
  }
  @media (min-width: 1280px) { .hs-row { padding: 7rem 8rem; } }

  /* ── Background glow ── */
  .hs-glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  /* ── Image side ── */
  .hs-img-side {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 420px;
    flex-shrink: 0;
  }
  @media (min-width: 768px) { .hs-img-side { width: 46%; max-width: none; } }

  .hs-img-ring {
    position: absolute;
    inset: -18px;
    border-radius: 50%;
    z-index: 0;
    filter: blur(32px);
    opacity: 0.55;
  }

  .hs-img {
    width: 100%;
    max-width: 340px;
    aspect-ratio: 4/3;
    object-fit: cover;
    border-radius: 28px;
    position: relative;
    z-index: 1;
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.05),
      0 20px 60px rgba(0,0,0,0.12);
  }
  @media (min-width: 1024px) { .hs-img { max-width: 420px; } }

  /* Badge on image */
  .hs-img-badge {
    position: absolute;
    bottom: 16px;
    right: -12px;
    background: #fff;
    border-radius: 14px;
    padding: 0.55rem 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
    z-index: 2;
    border: 1px solid #f0f0f5;
  }
  .hs-badge-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .hs-badge-label {
    font-size: 0.72rem;
    font-weight: 600;
    color: #1a1d3a;
    white-space: nowrap;
  }
  .hs-badge-sub {
    font-size: 0.62rem;
    color: #9da3ba;
    font-weight: 400;
  }

  /* ── Text side ── */
  .hs-text-side {
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 100%;
  }
  @media (min-width: 768px) {
    .hs-text-side { align-items: flex-start; text-align: left; width: 50%; }
  }

  .hs-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 100px;
    margin-bottom: 1.1rem;
    border: 1px solid transparent;
  }

  .hs-title {
    font-size: clamp(1.65rem, 3.5vw, 2.6rem);
    font-weight: 800;
    color: #1a1d3a;
    line-height: 1.18;
    letter-spacing: -0.03em;
    margin: 0 0 1rem;
  }
  .hs-title em {
    font-style: normal;
    background: var(--title-grad);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hs-desc {
    font-size: 0.87rem;
    color: #6b7194;
    line-height: 1.8;
    margin: 0 0 2rem;
    max-width: 440px;
    font-weight: 400;
  }

  .hs-stats {
    display: flex;
    gap: 1.75rem;
    margin-bottom: 2rem;
  }
  .hs-stat-num {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1a1d3a;
    letter-spacing: -0.02em;
    line-height: 1;
  }
  .hs-stat-label {
    font-size: 0.7rem;
    color: #9da3ba;
    font-weight: 500;
    margin-top: 3px;
  }
  .hs-stat-divider {
    width: 1px; background: #e8eaf0; align-self: stretch;
  }

  .hs-btns {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }
  @media (min-width: 768px) { .hs-btns { justify-content: flex-start; } }

  .hs-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-family: 'Poppins', sans-serif;
    font-size: 0.82rem;
    font-weight: 600;
    color: #fff;
    border: none;
    border-radius: 100px;
    padding: 0.7rem 1.5rem;
    cursor: pointer;
    transition: transform 0.15s, opacity 0.15s, box-shadow 0.15s;
    letter-spacing: 0.01em;
  }
  .hs-btn-primary:hover { opacity: 0.9; transform: translateY(-2px); }
  .hs-btn-primary:active { transform: scale(0.97); }

  .hs-btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-family: 'Poppins', sans-serif;
    font-size: 0.82rem;
    font-weight: 600;
    border-radius: 100px;
    padding: 0.68rem 1.4rem;
    cursor: pointer;
    transition: transform 0.15s, background 0.15s;
    background: #fff;
    border: 1.5px solid #e2e5f0;
    color: #4a5068;
    letter-spacing: 0.01em;
  }
  .hs-btn-secondary:hover { background: #f8f9ff; transform: translateY(-2px); }
  .hs-btn-secondary:active { transform: scale(0.97); }
`;

/* ─── Theme per pet ─── */
const PETS = [
  {
    id: 1,
    emoji: "🐕",
    pill: "Dogs",
    pillBg: "#fff7ed",
    pillBorder: "#fed7aa",
    pillColor: "#c2410c",
    dotColor: "#f97316",
    titleGrad: "linear-gradient(135deg, #f97316, #fb923c)",
    pageBg: "linear-gradient(160deg, #fffbf5 0%, #fff7ed 50%, #ffffff 100%)",
    glowColor: "rgba(251,146,60,0.18)",
    ringColor: "linear-gradient(135deg, rgba(251,146,60,0.35), transparent)",
    btnBg: "linear-gradient(135deg, #f97316, #fb923c)",
    btnShadow: "0 6px 18px rgba(249,115,22,0.35)",
    badgeLabel: "Top Rated",
    badgeSub: "1,200+ happy owners",
    title: <>Find Your Perfect <em>Dog Companion</em></>,
    desc: "Discover adorable, loyal, and playful dogs — from premium breeds to rescue pups. Everything you need to bring your new best friend home.",
    image: Dog1,
    route: "/category/dogs",
    stats: [{ num: "500+", label: "Dog Breeds" }, { num: "4.9★", label: "Avg Rating" }],
  },
  {
    id: 2,
    emoji: "🐱",
    pill: "Cats",
    pillBg: "#fff1f5",
    pillBorder: "#fecdd3",
    pillColor: "#be185d",
    dotColor: "#f43f8e",
    titleGrad: "linear-gradient(135deg, #ec4899, #f43f8e)",
    pageBg: "linear-gradient(160deg, #fff5f8 0%, #fff1f5 50%, #ffffff 100%)",
    glowColor: "rgba(244,63,142,0.15)",
    ringColor: "linear-gradient(135deg, rgba(244,63,142,0.3), transparent)",
    btnBg: "linear-gradient(135deg, #ec4899, #f43f8e)",
    btnShadow: "0 6px 18px rgba(236,72,153,0.35)",
    badgeLabel: "Most Loved",
    badgeSub: "800+ cat families",
    title: <>Charming <em>Cats</em> Waiting for You</>,
    desc: "From fluffy kittens to graceful adults, find a cat that matches your lifestyle — along with grooming tools, toys, and premium care products.",
    image: Cat,
    route: "/category/cats",
    stats: [{ num: "300+", label: "Cat Breeds" }, { num: "4.8★", label: "Avg Rating" }],
  },
  {
    id: 3,
    emoji: "🦜",
    pill: "Birds",
    pillBg: "#eff8ff",
    pillBorder: "#bfdbfe",
    pillColor: "#1d4ed8",
    dotColor: "#3b82f6",
    titleGrad: "linear-gradient(135deg, #3b82f6, #60a5fa)",
    pageBg: "linear-gradient(160deg, #f5f9ff 0%, #eff8ff 50%, #ffffff 100%)",
    glowColor: "rgba(59,130,246,0.14)",
    ringColor: "linear-gradient(135deg, rgba(96,165,250,0.3), transparent)",
    btnBg: "linear-gradient(135deg, #3b82f6, #60a5fa)",
    btnShadow: "0 6px 18px rgba(59,130,246,0.35)",
    badgeLabel: "New Arrivals",
    badgeSub: "Fresh stock weekly",
    title: <>Colorful <em>Birds</em> for Your Home</>,
    desc: "Brighten every morning with songbirds and parrots. Shop premium cages, nutritious food, and accessories crafted for your winged companions.",
    image: Bird,
    route: "/category/birds",
    stats: [{ num: "200+", label: "Bird Species" }, { num: "4.7★", label: "Avg Rating" }],
  },
  {
    id: 4,
    emoji: "🐠",
    pill: "Aquatics",
    pillBg: "#f0fdfa",
    pillBorder: "#99f6e4",
    pillColor: "#0f766e",
    dotColor: "#14b8a6",
    titleGrad: "linear-gradient(135deg, #14b8a6, #2dd4bf)",
    pageBg: "linear-gradient(160deg, #f5fffe 0%, #f0fdfa 50%, #ffffff 100%)",
    glowColor: "rgba(20,184,166,0.14)",
    ringColor: "linear-gradient(135deg, rgba(45,212,191,0.3), transparent)",
    btnBg: "linear-gradient(135deg, #14b8a6, #2dd4bf)",
    btnShadow: "0 6px 18px rgba(20,184,166,0.35)",
    badgeLabel: "Exotic Picks",
    badgeSub: "Rare aquatic species",
    title: <>Discover <em>Aquatic</em> Beauty</>,
    desc: "Transform your space with exotic fish and thriving aquariums. Explore décor, filtration systems, and expert care guides for a stunning underwater world.",
    image: Fish,
    route: "/category/fish",
    stats: [{ num: "400+", label: "Fish Species" }, { num: "4.8★", label: "Avg Rating" }],
  },
];

/* ─── Single Row ─── */
const PetRow = ({ pet, index }) => {
  const navigate = useNavigate();
  const isEven = index % 2 === 0;

  return (
    <div
      className={`hs-row${isEven ? "" : " reverse"}`}
      style={{ background: pet.pageBg, "--title-grad": pet.titleGrad }}
    >
      {/* Glow */}
      <div
        className="hs-glow"
        style={{
          background: `radial-gradient(ellipse 55% 65% at ${isEven ? "15%" : "85%"} 50%, ${pet.glowColor}, transparent 70%)`,
        }}
      />

      {/* Image side */}
      <motion.div
        className="hs-img-side"
        initial={{ opacity: 0, x: isEven ? -60 : 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="hs-img-ring" style={{ background: pet.ringColor }} />
        <motion.img
          src={pet.image}
          alt={pet.pill}
          className="hs-img"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating badge */}
        <motion.div
          className="hs-img-badge"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <div className="hs-badge-dot" style={{ background: pet.dotColor }} />
          <div>
            <div className="hs-badge-label">{pet.badgeLabel}</div>
            <div className="hs-badge-sub">{pet.badgeSub}</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Text side */}
      <motion.div
        className="hs-text-side"
        initial={{ opacity: 0, x: isEven ? 60 : -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Pill */}
        <div
          className="hs-pill"
          style={{
            background: pet.pillBg,
            borderColor: pet.pillBorder,
            color: pet.pillColor,
          }}
        >
          <span>{pet.emoji}</span>
          {pet.pill}
        </div>

        {/* Title */}
        <h2 className="hs-title">{pet.title}</h2>

        {/* Description */}
        <p className="hs-desc">{pet.desc}</p>

        {/* Mini stats */}
        <div className="hs-stats">
          {pet.stats.map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="hs-stat-divider" />}
              <div>
                <div className="hs-stat-num">{s.num}</div>
                <div className="hs-stat-label">{s.label}</div>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Buttons */}
        <div className="hs-btns">
          <motion.button
            className="hs-btn-primary"
            style={{
              background: pet.btnBg,
              boxShadow: pet.btnShadow,
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(pet.route)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="3" y1="6" x2="21" y2="6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              <path d="M16 10a4 4 0 01-8 0" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Shop Now
          </motion.button>

          <motion.button
            className="hs-btn-secondary"
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/wishlist")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={pet.dotColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Add to Wishlist
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

/* ─── Hero Section ─── */
const HeroSection = () => (
  <section className="hs-root hs-section">
    <style>{css}</style>
    {PETS.map((pet, i) => (
      <PetRow key={pet.id} pet={pet} index={i} />
    ))}
  </section>
);

export default HeroSection;