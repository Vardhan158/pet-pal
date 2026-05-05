import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/utils/axiosInstance";

import Dog1 from "../assets/Dog1.jpg";
import Cat  from "../assets/Cat.jpg";
import Bird from "../assets/Bird.jpg";
import Fish from "../assets/Fish.jpg";

/* ── Poppins ── */
if (!document.head.querySelector("[href*='Poppins']")) {
  const link = document.createElement("link");
  link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

/* ── Keyframes ── */
if (!document.head.querySelector("#auth-keyframes")) {
  const style = document.createElement("style");
  style.id = "auth-keyframes";
  style.textContent = `
    @keyframes auth-pulse  { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
    @keyframes auth-float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes auth-spin   { to{transform:rotate(360deg)} }
    @keyframes auth-shimmer{ 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    @keyframes dot-bounce  { 0%,100%{transform:translateY(0);opacity:1} 50%{transform:translateY(-4px);opacity:0.5} }
  `;
  document.head.appendChild(style);
}

const SLIDES = [
  { img: Dog1, title: "Shop for Happy Paws",   emoji: "🐾", sub: "Find your perfect furry companion" },
  { img: Cat,  title: "Cozy Cats, Warm Hearts", emoji: "🐱", sub: "Adopt a purring bundle of joy"      },
  { img: Bird, title: "Chirpy Companions",      emoji: "🦜", sub: "Brighten your home with birdsong"   },
  { img: Fish, title: "Dive into Pet Joy",      emoji: "🐠", sub: "Explore aquatic wonders"            },
];

const S = {
  root: {
    display: "flex", flexDirection: "column", minHeight: "100vh", width: "100%",
    overflow: "hidden", fontFamily: "'Poppins', sans-serif",
    background: "linear-gradient(135deg, #f0f4ff 0%, #fafaff 50%, #f5f0ff 100%)",
    position: "relative",
  },

  /* Background blobs */
  blob1: {
    position: "absolute", top: -100, left: -80,
    width: 380, height: 380, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(165,180,252,0.25) 0%, transparent 70%)",
    animation: "auth-pulse 6s ease-in-out infinite", pointerEvents: "none",
  },
  blob2: {
    position: "absolute", bottom: -60, right: -60,
    width: 440, height: 440, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(196,181,253,0.2) 0%, transparent 70%)",
    animation: "auth-pulse 8s ease-in-out infinite 1s", pointerEvents: "none",
  },
  blob3: {
    position: "absolute", top: "40%", right: "30%",
    width: 200, height: 200, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
    pointerEvents: "none",
  },

  /* ── LEFT PANEL ── */
  leftPanel: {
    display: "flex",
    width: "100%", padding: "20px 20px 0",
    alignItems: "center", justifyContent: "center",
    position: "relative", zIndex: 1,
  },
  imgFrame: {
    position: "relative", width: "100%", height: "44vw",
    minHeight: 220, maxHeight: "88vh",
    borderRadius: 22, overflow: "hidden",
    boxShadow: "0 24px 64px rgba(99,102,241,0.2), 0 4px 20px rgba(0,0,0,0.1)",
    border: "1.5px solid rgba(165,180,252,0.4)",
  },
  imgSlide: {
    position: "absolute", inset: 0,
    width: "100%", height: "100%", objectFit: "cover",
  },
  imgOverlay: {
    position: "absolute", inset: 0,
    background: "linear-gradient(180deg, rgba(10,6,20,0.15) 0%, rgba(10,6,20,0.55) 100%)",
  },

  /* Image dots */
  dotsRow: {
    position: "absolute", top: 20, left: "50%",
    transform: "translateX(-50%)",
    display: "flex", gap: 6, zIndex: 2,
  },
  dot: (active) => ({
    height: 3, width: active ? 24 : 8, borderRadius: 4,
    background: active ? "#a5b4fc" : "rgba(255,255,255,0.35)",
    transition: "width 0.4s ease",
  }),

  /* Caption */
  caption: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    padding: "24px 28px 28px",
    background: "linear-gradient(0deg, rgba(10,6,20,0.7) 0%, transparent 100%)",
    zIndex: 2,
    animation: "auth-float 4s ease-in-out infinite",
  },
  captionEmoji: { fontSize: 28, marginBottom: 6, display: "block" },
  captionTitle: { fontSize: 20, fontWeight: 800, color: "#fff", margin: "0 0 4px", letterSpacing: "-0.3px" },
  captionSub: { fontSize: 13, color: "rgba(255,255,255,0.7)", margin: 0, fontWeight: 400 },

  /* Brand pill on image */
  brandPill: {
    position: "absolute", top: 20, right: 20,
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: 30, padding: "6px 14px",
    display: "flex", alignItems: "center", gap: 6, zIndex: 2,
  },
  brandPillText: { fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: 0.3 },

  /* ── RIGHT PANEL ── */
  rightPanel: {
    flex: 1, display: "flex",
    flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: "24px 20px 40px", position: "relative", zIndex: 1,
  },

  /* Form card */
  card: {
    width: "100%", maxWidth: 420,
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(20px)",
    borderRadius: 24,
    border: "1.5px solid #ede9fe",
    boxShadow: "0 8px 40px rgba(99,102,241,0.12), 0 2px 12px rgba(0,0,0,0.04)",
    padding: "36px 32px 32px",
  },

  /* Header */
  logoRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 6 },
  logoBox: {
    width: 38, height: 38, borderRadius: 10,
    background: "linear-gradient(135deg, #6366f1, #818cf8)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 17, boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
  },
  logoName: { fontSize: 20, fontWeight: 800, color: "#1e1b4b", letterSpacing: "-0.4px" },
  logoAccent: { color: "#6366f1" },

  formTitle: {
    fontSize: 22, fontWeight: 800, color: "#1e1b4b",
    textAlign: "center", margin: "14px 0 4px", letterSpacing: "-0.3px",
  },
  formSub: {
    fontSize: 12, color: "#94a3b8", textAlign: "center",
    margin: "0 0 24px", fontWeight: 400,
  },

  /* Tab switcher */
  tabRow: {
    display: "flex", background: "#f5f3ff",
    border: "1.5px solid #ede9fe", borderRadius: 14,
    padding: 4, marginBottom: 22, gap: 4,
  },
  tab: (active) => ({
    flex: 1, padding: "8px",
    borderRadius: 10, border: "none",
    background: active ? "linear-gradient(135deg, #6366f1, #818cf8)" : "transparent",
    color: active ? "#fff" : "#94a3b8",
    fontSize: 12, fontWeight: 700,
    cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    boxShadow: active ? "0 3px 10px rgba(99,102,241,0.3)" : "none",
    transition: "all 0.22s",
    letterSpacing: 0.2,
  }),

  /* Input group */
  fieldGroup: { marginBottom: 13 },
  inputLabel: {
    fontSize: 10, fontWeight: 700, color: "#6366f1",
    textTransform: "uppercase", letterSpacing: 0.8,
    display: "flex", alignItems: "center", gap: 5,
    marginBottom: 6,
  },
  input: {
    width: "100%", height: 44,
    border: "1.5px solid #e8e4fc", borderRadius: 12,
    padding: "0 14px", fontSize: 13, fontWeight: 400,
    color: "#1e1b4b", fontFamily: "'Poppins', sans-serif",
    background: "#fafaff", outline: "none",
    transition: "border 0.2s, box-shadow 0.2s, background 0.2s",
    boxSizing: "border-box",
  },

  /* Submit button */
  submitBtn: (loading) => ({
    width: "100%", height: 46, marginTop: 6,
    border: "none", borderRadius: 12,
    background: loading ? "#e8e4fc" : "linear-gradient(135deg, #6366f1, #818cf8)",
    color: loading ? "#a5b4fc" : "#fff",
    fontSize: 14, fontWeight: 700,
    fontFamily: "'Poppins', sans-serif",
    cursor: loading ? "not-allowed" : "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    boxShadow: loading ? "none" : "0 5px 18px rgba(99,102,241,0.42)",
    transition: "all 0.2s", letterSpacing: 0.2,
  }),

  /* Toggle text */
  toggleRow: {
    textAlign: "center", marginTop: 18,
    fontSize: 12, color: "#94a3b8",
  },
  toggleBtn: {
    color: "#6366f1", fontWeight: 700,
    background: "none", border: "none",
    cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    fontSize: 12, padding: 0, marginLeft: 4,
  },

  /* Trust row */
  trustRow: {
    display: "flex", justifyContent: "center",
    gap: 16, marginTop: 20, flexWrap: "wrap",
  },
  trustItem: {
    display: "flex", alignItems: "center", gap: 4,
    fontSize: 10, fontWeight: 600, color: "#a5b4fc",
  },
};

const focusIn  = e => { e.target.style.border = "1.5px solid #6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; e.target.style.background = "#fff"; };
const focusOut = e => { e.target.style.border = "1.5px solid #e8e4fc"; e.target.style.boxShadow = "none"; e.target.style.background = "#fafaff"; };

/* ── Inline loading dots ── */
const LoadingDots = () => (
  <span style={{ display: "inline-flex", gap: 4 }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#a5b4fc", display: "inline-block", animation: `dot-bounce 0.9s ease-in-out ${i * 0.18}s infinite` }} />
    ))}
  </span>
);

export default function LoginSignup() {
  const [isLogin, setIsLogin]           = useState(true);
  const [formData, setFormData]         = useState({ name: "", email: "", password: "" });
  const [loading, setLoading]           = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPass, setShowPass]         = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const id = setInterval(() => setCurrentSlide(p => (p + 1) % SLIDES.length), 3500);
    return () => clearInterval(id);
  }, []);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
      toast.error("⚠️ Please fill in all required fields"); return;
    }
    setLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload  = isLogin
        ? { email: formData.email.trim(), password: formData.password.trim() }
        : { name: formData.name.trim(), email: formData.email.trim(), password: formData.password.trim() };

      const { data } = await axiosInstance.post(endpoint, payload);
      if (!data?.token) throw new Error("Invalid server response");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      login(data);

      if (isLogin) {
        toast.success("🎉 Welcome back!");
        setTimeout(() => {
          if (data.role === "admin")       navigate("/admin/dashboard",  { replace: true });
          else if (data.role === "seller") navigate("/seller/dashboard", { replace: true });
          else                             navigate("/shop",             { replace: true });
        }, 1600);
      } else {
        toast.success("🐾 Account created! Please log in.");
        setIsLogin(true);
        setFormData({ name: "", email: "", password: "" });
      }
    } catch (err) {
      console.error("❌ Auth error:", err.response?.data || err.message);
      const status  = err.response?.status;
      const message = err.response?.data?.message ||
        (status === 401 ? "Invalid email or password" : status === 409 ? "Account already exists" : "⚠️ Something went wrong. Please try again.");
      toast.error(message);
      setFormData(p => ({ ...p, password: "" }));
    } finally {
      setLoading(false);
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <div style={S.root}>
      {/* Blobs */}
      <div style={S.blob1} /><div style={S.blob2} /><div style={S.blob3} />

      {/* ── Responsive layout wrapper ── */}
      <style>{`
        @media(min-width:768px){
          .auth-inner { flex-direction: row !important; flex: 1; }
          .auth-left  { width: 50% !important; padding: 32px 24px 32px 32px !important; }
          .auth-left .auth-imgframe { height: 88vh !important; }
          .auth-right { padding: 32px 32px 32px 16px !important; }
        }
      `}</style>
      <div className="auth-inner" style={{ display: "flex", flexDirection: "column", flex: 1, position: "relative", zIndex: 1 }}>

      {/* ── Left image panel ── */}
      <div className="auth-left" style={S.leftPanel}>
        <div className="auth-imgframe" style={S.imgFrame}>
          {/* Dots */}
          <div style={S.dotsRow}>
            {SLIDES.map((_, i) => <div key={i} style={S.dot(i === currentSlide)} />)}
          </div>

          {/* Brand pill */}
          <div style={S.brandPill}>
            <span style={{ fontSize: 14 }}>🐾</span>
            <span style={S.brandPillText}>Pet<span style={{ color: "#a5b4fc" }}>World</span></span>
          </div>

          {/* Sliding image */}
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              src={slide.img}
              alt={slide.title}
              style={S.imgSlide}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
            />
          </AnimatePresence>

          <div style={S.imgOverlay} />

          {/* Caption */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`cap-${currentSlide}`}
              style={S.caption}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
            >
              <span style={S.captionEmoji}>{slide.emoji}</span>
              <p style={S.captionTitle}>{slide.title}</p>
              <p style={S.captionSub}>{slide.sub}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <motion.div
        className="auth-right"
        style={S.rightPanel}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <div style={S.card}>

          {/* Logo */}
          <div style={S.logoRow}>
            <div style={S.logoBox}>🐾</div>
            <span style={S.logoName}>Pet<span style={S.logoAccent}>World</span></span>
          </div>

          {/* Title */}
          <AnimatePresence mode="wait">
            <motion.div key={isLogin ? "login-title" : "signup-title"}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}>
              <p style={S.formTitle}>{isLogin ? "Welcome Back 👋" : "Create Account 🌟"}</p>
              <p style={S.formSub}>{isLogin ? "Sign in to continue to PetWorld" : "Join thousands of pet lovers today"}</p>
            </motion.div>
          </AnimatePresence>

          {/* Tab switcher */}
          <div style={S.tabRow}>
            <button style={S.tab(isLogin)}  onClick={() => setIsLogin(true)}  type="button">Sign In</button>
            <button style={S.tab(!isLogin)} onClick={() => setIsLogin(false)} type="button">Sign Up</button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 13 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: "hidden" }}
                >
                  <label style={S.inputLabel}>👤 Full Name</label>
                  <input
                    style={S.input} type="text" name="name"
                    placeholder="e.g. Ravi Kumar"
                    value={formData.name} onChange={handleChange}
                    onFocus={focusIn} onBlur={focusOut}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div style={S.fieldGroup}>
              <label style={S.inputLabel}>✉️ Email Address</label>
              <input
                style={S.input} type="email" name="email"
                placeholder="you@example.com"
                value={formData.email} onChange={handleChange}
                onFocus={focusIn} onBlur={focusOut}
              />
            </div>

            <div style={{ ...S.fieldGroup, position: "relative" }}>
              <label style={S.inputLabel}>🔒 Password</label>
              <input
                style={S.input} type={showPass ? "text" : "password"} name="password"
                placeholder="Min. 6 characters"
                value={formData.password} onChange={handleChange}
                onFocus={focusIn} onBlur={focusOut}
              />
              <button type="button" onClick={() => setShowPass(p => !p)}
                style={{ position: "absolute", right: 12, top: 30, background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#94a3b8", fontFamily: "inherit" }}>
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>

            <motion.button
              type="submit"
              style={S.submitBtn(loading)}
              disabled={loading}
              whileHover={!loading ? { scale: 1.02, boxShadow: "0 10px 28px rgba(99,102,241,0.5)" } : {}}
              whileTap={!loading ? { scale: 0.97 } : {}}
            >
              {loading ? <LoadingDots /> : isLogin ? "🐾 Sign In" : "✨ Create Account"}
            </motion.button>
          </form>

          {/* Toggle */}
          <div style={S.toggleRow}>
            {isLogin ? "Don't have an account?" : "Already a member?"}
            <button type="button" style={S.toggleBtn} onClick={() => { setIsLogin(p => !p); setFormData({ name: "", email: "", password: "" }); }}>
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </div>

          {/* Trust */}
          <div style={S.trustRow}>
            {[["🔒","Secure"], ["🐾","10k+ Pets"], ["⭐","4.9 Rated"]].map(([icon, label]) => (
              <div key={label} style={S.trustItem}>{icon} {label}</div>
            ))}
          </div>
        </div>
      </motion.div>
      </div>{/* end auth-inner */}
    </div>
  );
}