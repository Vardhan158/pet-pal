import React from "react";
import Dogmarquee from "../assets/Dogmarquee.mp4";
import Catmarquee from "../assets/Catmarquee.mp4";
import Birdmarquee from "../assets/Birdmarquee.mp4";
import Fishmarquee from "../assets/Fishmarquee.mp4";
import Bunnymarquee from "../assets/Bunnymarquee.mp4";
import Dogtrainingmarquee from "../assets/Dogtrainingmarquee.mp4";
import Groomingmarquee from "../assets/Groomingmarquee.mp4";
import petfoodmarquee from "../assets/Petfoodmarquee.mp4";

const PetMarquee = () => {
  const [paused, setPaused] = React.useState(false);

  const cardData = [
    { title: "Adopt a Best Friend",     emoji: "🐶", video: Dogmarquee,          accent: "#FEF3C7", dot: "#F59E0B" },
    { title: "Caring Cats Need Homes",  emoji: "🐱", video: Catmarquee,          accent: "#FCE7F3", dot: "#EC4899" },
    { title: "Playful Birds",           emoji: "🦜", video: Birdmarquee,         accent: "#DCFCE7", dot: "#16A34A" },
    { title: "Beautiful Aquarium Fish", emoji: "🐠", video: Fishmarquee,         accent: "#CFFAFE", dot: "#0891B2" },
    { title: "Bunny Hopping with Joy",  emoji: "🐰", video: Bunnymarquee,        accent: "#EDE9FE", dot: "#7C3AED" },
    { title: "Dog Training & Sports",   emoji: "🦮", video: Dogtrainingmarquee,  accent: "#FEF9C3", dot: "#CA8A04" },
    { title: "Pet Grooming & Care",     emoji: "✨", video: Groomingmarquee,     accent: "#FCE7F3", dot: "#DB2777" },
    { title: "Food & Supplies",         emoji: "🍗", video: petfoodmarquee,      accent: "#FEF3C7", dot: "#EA580C" },
  ];

  const doubled = [...cardData, ...cardData];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        .pm-root { font-family: 'Poppins', sans-serif; }

        @keyframes pm-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .pm-track {
          display: flex;
          align-items: stretch;
          width: fit-content;
          animation: pm-scroll linear infinite;
          will-change: transform;
        }

        .pm-card {
          flex-shrink: 0;
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 4px 18px rgba(0,0,0,0.07);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .pm-card:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 18px 44px rgba(0,0,0,0.13);
        }

        /* responsive sizes */
        @media (max-width: 640px) {
          .pm-card { width: 168px; height: 210px; margin: 0 8px; }
        }
        @media (min-width: 641px) and (max-width: 1023px) {
          .pm-card { width: 220px; height: 270px; margin: 0 12px; }
        }
        @media (min-width: 1024px) {
          .pm-card { width: 270px; height: 330px; margin: 0 14px; }
        }

        .pm-card video {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
        }

        /* Gradient overlay — always visible at bottom */
        .pm-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 45%, transparent 70%);
          transition: opacity 0.35s ease;
        }

        /* Title area */
        .pm-label {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 14px 16px 16px;
          transform: translateY(4px);
          transition: transform 0.3s ease;
        }
        .pm-card:hover .pm-label { transform: translateY(0); }

        .pm-emoji-badge {
          display: inline-flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 10px;
          font-size: 1rem; margin-bottom: 7px;
          backdrop-filter: blur(6px);
        }

        .pm-title {
          font-family: 'Poppins', sans-serif;
          font-size: 0.88rem; font-weight: 700;
          color: #fff; line-height: 1.3;
          text-shadow: 0 1px 4px rgba(0,0,0,0.3);
          margin: 0;
        }

        /* Top corner dot indicator */
        .pm-dot {
          position: absolute; top: 12px; right: 12px;
          width: 8px; height: 8px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 0 0 2px rgba(0,0,0,0.15);
        }

        /* Edge fade masks */
        .pm-fade-left, .pm-fade-right {
          position: absolute; top: 0; height: 100%; width: 80px;
          pointer-events: none; z-index: 2;
        }
        .pm-fade-left  { left: 0;  background: linear-gradient(to right, #F8FAFC, transparent); }
        .pm-fade-right { right: 0; background: linear-gradient(to left,  #F8FAFC, transparent); }

        /* Pause hint */
        .pm-pause-hint {
          position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%);
          font-family: 'Poppins', sans-serif;
          font-size: 0.7rem; font-weight: 500;
          color: #9CA3AF; letter-spacing: 0.05em;
          white-space: nowrap; pointer-events: none;
          opacity: 0; transition: opacity 0.3s;
        }
        .pm-root:hover .pm-pause-hint { opacity: 1; }

        @media (max-width: 640px) {
          .pm-fade-left, .pm-fade-right { width: 32px; }
        }
      `}</style>

      <section
        className="pm-root"
        style={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          padding: "72px 0 80px",
          background: "linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 40%, #F8FAFC 100%)",
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Subtle background texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle at 15% 50%, rgba(99,102,241,0.04) 0%, transparent 60%), radial-gradient(circle at 85% 30%, rgba(236,72,153,0.04) 0%, transparent 60%)",
        }} />

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 44, position: "relative", zIndex: 1, padding: "0 24px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#F1F5F9", borderRadius: 999,
            padding: "5px 18px", marginBottom: 16,
            border: "1px solid #E2E8F0",
          }}>
            <span style={{ fontSize: "0.9rem" }}>🎬</span>
            <span style={{
              fontSize: "0.72rem", fontWeight: 700, color: "#64748B",
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              Pet World
            </span>
          </div>

          <h2 style={{
            fontSize: "clamp(1.7rem, 4vw, 2.8rem)",
            fontWeight: 800, color: "#0F172A",
            margin: "0 0 12px", letterSpacing: "-0.03em", lineHeight: 1.15,
          }}>
            Discover Our <span style={{
              background: "linear-gradient(135deg, #6366F1, #EC4899)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Pet Universe</span>
          </h2>

          <p style={{
            fontSize: "0.95rem", color: "#64748B",
            maxWidth: 460, margin: "0 auto",
            lineHeight: 1.7, fontWeight: 400,
          }}>
            Hover to pause and explore the full world of pets, care, and companionship.
          </p>
        </div>

        {/* ── Marquee track ── */}
        <div style={{ position: "relative" }}>
          <div
            className="pm-track"
            style={{
              animationPlayState: paused ? "paused" : "running",
              animationDuration: `${cardData.length * 4.5}s`,
            }}
          >
            {doubled.map((card, i) => (
              <div key={i} className="pm-card">
                <video src={card.video} autoPlay loop muted playsInline />

                {/* Always-on gradient */}
                <div className="pm-overlay" />

                {/* Top dot */}
                <div className="pm-dot" style={{ background: card.dot }} />

                {/* Label */}
                <div className="pm-label">
                  <div
                    className="pm-emoji-badge"
                    style={{ background: card.accent + "CC" }}
                  >
                    {card.emoji}
                  </div>
                  <p className="pm-title">{card.title}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Edge fades */}
          <div className="pm-fade-left" />
          <div className="pm-fade-right" />
        </div>

        {/* Pause hint */}
        <p className="pm-pause-hint">Hover over cards to pause</p>
      </section>
    </>
  );
};

export default PetMarquee;