import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

/* ─── Font inject ─── */
if (!document.querySelector("#poppins-font")) {
  const l = document.createElement("link");
  l.id = "poppins-font";
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap";
  document.head.appendChild(l);
}

/* ─── Styles ─── */
const css = `
  .lo-root, .lo-root * { font-family: 'Poppins', sans-serif; box-sizing: border-box; }

  .lo-wrap {
    position: fixed;
    inset: 0;
    z-index: 9999;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      180deg,
      #ddeeff 0%,
      #eaf4ff 30%,
      #f5f9ff 60%,
      #fef3f8 100%
    );
  }

  /* ── Subtle noise grain ── */
  .lo-wrap::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    opacity: 0.4;
  }

  /* ── Sun ── */
  .lo-sun {
    position: absolute;
    top: -60px;
    right: 12%;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: radial-gradient(circle at 40% 40%, #fff8c0, #ffe47a 60%, #ffd04a);
    box-shadow:
      0 0 0 20px rgba(255,220,80,0.1),
      0 0 0 45px rgba(255,220,80,0.07),
      0 0 0 80px rgba(255,220,80,0.04);
  }

  /* ── Cloud track (scrolling strip) ── */
  .lo-cloud-track {
    position: absolute;
    top: 0; left: 0;
    width: 200%;
    height: 100%;
    display: flex;
    align-items: flex-start;
    padding-top: 60px;
    gap: 0;
    pointer-events: none;
  }

  .lo-cloud {
    position: relative;
    flex-shrink: 0;
  }

  /* ── Hills at bottom ── */
  .lo-hills {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 120px;
    pointer-events: none;
  }

  /* ── Dog stage ── */
  .lo-stage {
    position: relative;
    width: 100%;
    height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  /* ── Dog container ── */
  .lo-dog-outer {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    will-change: transform;
  }

  /* Speed lines behind dog */
  .lo-speedlines {
    position: absolute;
    left: -90px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 6px;
    pointer-events: none;
  }
  .lo-line {
    height: 3px;
    border-radius: 99px;
    background: linear-gradient(90deg, transparent, rgba(147,197,253,0.7));
  }

  /* Cape */
  .lo-cape {
    position: absolute;
    top: 4px;
    right: 6px;
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #ff6b6b, #ee0979);
    border-radius: 50% 80% 10% 80% / 50% 80% 10% 80%;
    transform-origin: top right;
    box-shadow: 0 4px 12px rgba(238,9,121,0.35);
    z-index: 2;
  }

  /* Dog image */
  .lo-dog-img {
    width: 110px;
    height: 110px;
    object-fit: contain;
    position: relative;
    z-index: 3;
    filter: drop-shadow(0 12px 24px rgba(0,0,0,0.12));
  }

  /* Star trail */
  .lo-star {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }

  /* ── Text card ── */
  .lo-card {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-top: 8px;
  }

  .lo-label {
    background: rgba(255,255,255,0.75);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.9);
    border-radius: 100px;
    padding: 10px 24px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 4px 20px rgba(100,130,200,0.12);
  }

  .lo-label-text {
    font-size: 0.9rem;
    font-weight: 700;
    color: #2d3a6b;
    letter-spacing: -0.01em;
  }

  /* Progress bar */
  .lo-bar-wrap {
    width: 200px;
    height: 5px;
    background: rgba(180,200,255,0.25);
    border-radius: 99px;
    overflow: hidden;
  }
  .lo-bar-fill {
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, #93c5fd, #818cf8, #c084fc);
    background-size: 200% 100%;
    animation: barSlide 1.6s linear infinite;
  }
  @keyframes barSlide {
    0%   { background-position: 100% 0; }
    100% { background-position: -100% 0; }
  }

  /* Dots sub label */
  .lo-sub {
    font-size: 0.72rem;
    font-weight: 500;
    color: #8899cc;
    letter-spacing: 0.04em;
  }
  .lo-dot {
    display: inline-block;
    animation: blink 1.2s ease infinite;
  }
  .lo-dot:nth-child(2) { animation-delay: 0.2s; }
  .lo-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes blink {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 1; }
  }

  /* Bird flock */
  .lo-bird {
    position: absolute;
    font-size: 0.9rem;
    pointer-events: none;
  }
`;

/* ─── Cloud SVG ─── */
const Cloud = ({ x, y, scale = 1, opacity = 0.9 }) => (
  <div
    className="lo-cloud"
    style={{ position: "absolute", left: x, top: y, transform: `scale(${scale})`, opacity }}
  >
    <svg width="140" height="60" viewBox="0 0 140 60" fill="none">
      <ellipse cx="70" cy="45" rx="65" ry="18" fill="white" />
      <ellipse cx="50" cy="35" rx="35" ry="22" fill="white" />
      <ellipse cx="90" cy="38" rx="30" ry="20" fill="white" />
      <ellipse cx="70" cy="28" rx="28" ry="18" fill="white" />
    </svg>
  </div>
);

/* ─── Star trail particle ─── */
const Star = ({ delay, size, color, top, left }) => (
  <motion.div
    className="lo-star"
    style={{ width: size, height: size, background: color, top, left }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 0.9, 0], scale: [0, 1, 0] }}
    transition={{ duration: 0.6, delay, repeat: Infinity, repeatDelay: 1.4 }}
  />
);

/* ─── Component ─── */
export default function LoadingOverlay() {
  return (
    <div className="lo-root lo-wrap">
      <style>{css}</style>

      {/* Sun */}
      <motion.div
        className="lo-sun"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Scrolling clouds — layer 1 (back, slow) */}
      <motion.div
        style={{ position: "absolute", inset: 0, width: "200%", pointerEvents: "none" }}
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        {[0, 1].map((rep) => (
          <React.Fragment key={rep}>
            <Cloud x={`${rep * 50 + 2}%`}  y={40}  scale={1.1} opacity={0.75} />
            <Cloud x={`${rep * 50 + 22}%`} y={15}  scale={0.8} opacity={0.6} />
            <Cloud x={`${rep * 50 + 42}%`} y={55}  scale={1.3} opacity={0.8} />
            <Cloud x={`${rep * 50 + 65}%`} y={25}  scale={0.95} opacity={0.7} />
            <Cloud x={`${rep * 50 + 80}%`} y={60}  scale={0.75} opacity={0.55} />
          </React.Fragment>
        ))}
      </motion.div>

      {/* Scrolling clouds — layer 2 (front, faster) */}
      <motion.div
        style={{ position: "absolute", inset: 0, width: "200%", pointerEvents: "none" }}
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      >
        {[0, 1].map((rep) => (
          <React.Fragment key={rep}>
            <Cloud x={`${rep * 50 + 10}%`} y={85}  scale={0.65} opacity={0.5} />
            <Cloud x={`${rep * 50 + 35}%`} y={110} scale={1.0}  opacity={0.65} />
            <Cloud x={`${rep * 50 + 72}%`} y={90}  scale={0.8}  opacity={0.55} />
          </React.Fragment>
        ))}
      </motion.div>

      {/* Bird flock */}
      {[
        { t: "18%", l: "15%", d: 0 },
        { t: "14%", l: "18%", d: 0.3 },
        { t: "20%", l: "21%", d: 0.6 },
      ].map((b, i) => (
        <motion.div
          key={i}
          className="lo-bird"
          style={{ top: b.t, left: b.l }}
          animate={{ y: [0, -5, 0], x: [0, 4, 0] }}
          transition={{ duration: 2.4, delay: b.d, repeat: Infinity, ease: "easeInOut" }}
        >
          🐦
        </motion.div>
      ))}

      {/* ── Dog stage ── */}
      <div className="lo-stage">
        {/* Flying dog */}
        <motion.div
          className="lo-dog-outer"
          animate={{
            x: ["-52vw", "52vw"],
            y: [0, -18, 8, -12, 0],
          }}
          transition={{
            x: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          {/* Speed lines */}
          <div className="lo-speedlines">
            {[70, 55, 45, 60, 40].map((w, i) => (
              <motion.div
                key={i}
                className="lo-line"
                style={{ width: w }}
                animate={{ scaleX: [1, 0.4, 1], opacity: [0.8, 0.2, 0.8] }}
                transition={{ duration: 0.5, delay: i * 0.08, repeat: Infinity }}
              />
            ))}
          </div>

          {/* Star trail particles */}
          <Star delay={0}    size={8}  color="#fbbf24" top={-10} left={-30} />
          <Star delay={0.25} size={6}  color="#c084fc" top={20}  left={-50} />
          <Star delay={0.5}  size={5}  color="#60a5fa" top={40}  left={-20} />
          <Star delay={0.75} size={7}  color="#f472b6" top={5}   left={-65} />

          {/* Cape */}
          <motion.div
            className="lo-cape"
            animate={{ rotate: [-18, 18, -18], scaleX: [1, 1.15, 1] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Dog */}
          <motion.img
            src="https://cdn-icons-png.flaticon.com/512/616/616408.png"
            alt="SuperDog"
            className="lo-dog-img"
            animate={{ rotate: [0, 4, -4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>

      {/* ── Info card ── */}
      <div className="lo-card">
        <div className="lo-label">
          <motion.span
            animate={{ rotate: [0, 20, -20, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ fontSize: "1.2rem" }}
          >
            🦸
          </motion.span>
          <span className="lo-label-text">SuperDog is on the way!</span>
          <motion.span
            animate={{ rotate: [0, -20, 20, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}
            style={{ fontSize: "1.2rem" }}
          >
            🐾
          </motion.span>
        </div>

        <div className="lo-bar-wrap">
          <div className="lo-bar-fill" />
        </div>

        <div className="lo-sub">
          Fetching your page
          <span className="lo-dot">.</span>
          <span className="lo-dot">.</span>
          <span className="lo-dot">.</span>
        </div>
      </div>

      {/* Hills */}
      <svg
        className="lo-hills"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,80 C200,20 400,100 600,60 C800,20 1000,90 1200,50 C1350,25 1400,65 1440,55 L1440,120 L0,120 Z"
          fill="rgba(200,220,255,0.25)"
        />
        <path
          d="M0,100 C180,60 360,110 540,80 C720,50 900,105 1080,75 C1260,48 1380,90 1440,80 L1440,120 L0,120 Z"
          fill="rgba(210,230,255,0.35)"
        />
      </svg>
    </div>
  );
}