import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, MapPin, Edit2, Save, X, Building, Hash } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../api/utils/axiosInstance";

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
  .pp-root, .pp-root * { font-family: 'Poppins', sans-serif; box-sizing: border-box; }

  .pp-page {
    min-height: 100vh;
    background: #f6f7ff;
    padding: 2.5rem 1.25rem 5rem;
  }

  .pp-inner { max-width: 860px; margin: 0 auto; }

  /* ── Page header ── */
  .pp-header { margin-bottom: 2rem; }
  .pp-header-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #eef1ff;
    border: 1px solid #dde0ff;
    color: #6366f1;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 100px;
    margin-bottom: 0.85rem;
  }
  .pp-header h1 {
    font-size: clamp(1.6rem, 3vw, 2rem);
    font-weight: 800;
    color: #1a1d3a;
    letter-spacing: -0.03em;
    margin: 0 0 0.35rem;
    line-height: 1.2;
  }
  .pp-header p {
    font-size: 0.82rem;
    color: #8890aa;
    margin: 0;
    font-weight: 400;
  }

  /* ── Avatar card ── */
  .pp-avatar-card {
    background: #fff;
    border: 1px solid #eaecf5;
    border-radius: 22px;
    padding: 1.75rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 1.25rem;
    box-shadow: 0 2px 12px rgba(99,102,241,0.05);
    flex-wrap: wrap;
  }

  .pp-avatar {
    width: 72px; height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f9a8d4, #818cf8);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.75rem;
    font-weight: 800;
    color: #fff;
    flex-shrink: 0;
    box-shadow: 0 4px 16px rgba(129,140,248,0.3);
    border: 3px solid #fff;
    outline: 3px solid #eef1ff;
  }

  .pp-avatar-info { flex: 1; min-width: 0; }
  .pp-avatar-name {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1a1d3a;
    letter-spacing: -0.02em;
    margin: 0 0 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pp-avatar-email {
    font-size: 0.78rem;
    color: #9da3ba;
    font-weight: 400;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pp-avatar-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }

  .pp-btn-edit {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'Poppins', sans-serif;
    font-size: 0.78rem;
    font-weight: 600;
    height: 36px;
    padding: 0 16px;
    border-radius: 100px;
    border: none;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.12s, box-shadow 0.15s;
    white-space: nowrap;
  }
  .pp-btn-edit:active { transform: scale(0.97); }

  .pp-btn-primary {
    background: linear-gradient(135deg, #f472b6, #818cf8);
    color: #fff;
    box-shadow: 0 4px 12px rgba(244,114,182,0.28);
  }
  .pp-btn-primary:hover { opacity: 0.9; box-shadow: 0 6px 18px rgba(244,114,182,0.36); }

  .pp-btn-save {
    background: linear-gradient(135deg, #4ade80, #22c55e);
    color: #fff;
    box-shadow: 0 4px 12px rgba(74,222,128,0.3);
  }
  .pp-btn-save:hover { opacity: 0.9; }

  .pp-btn-cancel {
    background: #f1f3f8;
    color: #6b7280;
    border: 1px solid #e8eaf2 !important;
  }
  .pp-btn-cancel:hover { background: #e8eaf2; }

  /* ── Fields card ── */
  .pp-fields-card {
    background: #fff;
    border: 1px solid #eaecf5;
    border-radius: 22px;
    padding: 1.75rem;
    box-shadow: 0 2px 12px rgba(99,102,241,0.05);
  }

  .pp-fields-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 1.5rem;
  }
  .pp-fields-header-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f472b6, #818cf8);
    flex-shrink: 0;
  }
  .pp-fields-title {
    font-size: 0.78rem;
    font-weight: 700;
    color: #1a1d3a;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .pp-fields-header-line {
    flex: 1; height: 1px; background: #f0f2fa;
  }

  .pp-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.1rem;
  }
  @media (min-width: 600px) { .pp-grid { grid-template-columns: 1fr 1fr; } }

  /* ── Field ── */
  .pp-field { display: flex; flex-direction: column; gap: 0.4rem; }

  .pp-field-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.68rem;
    font-weight: 700;
    color: #8890aa;
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }
  .pp-field-label svg { color: #c4b5fd; flex-shrink: 0; }

  .pp-field-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1a1d3a;
    padding: 0.65rem 0.85rem;
    background: #f8f9ff;
    border: 1.5px solid #eaecf5;
    border-radius: 12px;
    min-height: 42px;
    display: flex;
    align-items: center;
  }
  .pp-field-value.empty { color: #c4c8da; font-weight: 400; font-size: 0.82rem; }

  .pp-field-input {
    font-family: 'Poppins', sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    color: #1a1d3a;
    padding: 0.65rem 0.85rem;
    background: #fff;
    border: 1.5px solid #e2e5f5;
    border-radius: 12px;
    outline: none;
    width: 100%;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .pp-field-input::placeholder { color: #c4b5fd; font-weight: 400; }
  .pp-field-input:focus {
    border-color: #a78bfa;
    box-shadow: 0 0 0 3px rgba(167,139,250,0.12);
  }

  /* ── Loading ── */
  .pp-loading {
    min-height: 100vh;
    background: #f6f7ff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 1rem;
  }
  .pp-spinner {
    width: 42px; height: 42px;
    border: 3px solid #e0e3ff;
    border-top-color: #818cf8;
    border-radius: 50%;
    animation: ppSpin 0.75s linear infinite;
  }
  .pp-loading p { font-family: 'Poppins', sans-serif; font-size: 0.8rem; color: #9da3ba; font-weight: 500; margin: 0; }

  @keyframes ppSpin { to { transform: rotate(360deg); } }
`;

/* ─── Field config ─── */
const FIELDS = [
  { name: "name",    label: "Full Name",  type: "text",  icon: User,     placeholder: "Jane Doe" },
  { name: "email",   label: "Email",      type: "email", icon: Mail,     placeholder: "jane@email.com" },
  { name: "phone",   label: "Phone",      type: "tel",   icon: Phone,    placeholder: "+91 98765 43210" },
  { name: "address", label: "Address",    type: "text",  icon: MapPin,   placeholder: "123 Main Street" },
  { name: "city",    label: "City",       type: "text",  icon: Building, placeholder: "Bangalore" },
  { name: "state",   label: "State",      type: "text",  icon: MapPin,   placeholder: "Karnataka" },
  { name: "zipCode", label: "Zip Code",   type: "text",  icon: Hash,     placeholder: "560001" },
];

const getInitial = (name, email) =>
  (name || email || "U")[0].toUpperCase();

export default function ProfilePage() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "", email: "", phone: "", address: "", city: "", state: "", zipCode: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    (async () => {
      try {
        const res = await axiosInstance.get("/users/profile");
        setProfileData(res.data);
      } catch {
        setProfileData({ name: user.name || "", email: user.email || "", phone: "", address: "", city: "", state: "", zipCode: "" });
      } finally {
        setLoading(false);
      }
    })();
  }, [user, navigate]);

  const handleChange = (e) =>
    setProfileData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosInstance.put("/users/profile", profileData);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="pp-root pp-loading">
      <style>{css}</style>
      <div className="pp-spinner" />
      <p>Loading your profile…</p>
    </div>
  );

  return (
    <div className="pp-root pp-page">
      <style>{css}</style>

      <div className="pp-inner">
        {/* Page header */}
        <motion.div
          className="pp-header"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="pp-header-badge">
            <svg width="7" height="7" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#6366f1"/></svg>
            Account
          </div>
          <h1>My Profile</h1>
          <p>Manage your personal information and preferences</p>
        </motion.div>

        {/* Avatar card */}
        <motion.div
          className="pp-avatar-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
        >
          <div className="pp-avatar">
            {getInitial(profileData.name, profileData.email)}
          </div>

          <div className="pp-avatar-info">
            <p className="pp-avatar-name">{profileData.name || "Your Name"}</p>
            <p className="pp-avatar-email">{profileData.email || "your@email.com"}</p>
          </div>

          <div className="pp-avatar-actions">
            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.button
                  key="edit"
                  className="pp-btn-edit pp-btn-primary"
                  onClick={() => setIsEditing(true)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Edit2 size={13} /> Edit Profile
                </motion.button>
              ) : (
                <motion.div
                  key="save-cancel"
                  style={{ display: "flex", gap: "0.5rem" }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <button
                    className="pp-btn-edit pp-btn-save"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <Save size={13} />
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    className="pp-btn-edit pp-btn-cancel"
                    onClick={() => setIsEditing(false)}
                  >
                    <X size={13} /> Cancel
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Fields card */}
        <motion.div
          className="pp-fields-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
        >
          <div className="pp-fields-header">
            <div className="pp-fields-header-dot" />
            <span className="pp-fields-title">Personal Information</span>
            <div className="pp-fields-header-line" />
          </div>

          <div className="pp-grid">
            {FIELDS.map(({ name, label, type, icon: Icon, placeholder }, i) => (
              <motion.div
                key={name}
                className="pp-field"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.18 + i * 0.04 }}
              >
                <div className="pp-field-label">
                  <Icon size={12} />
                  {label}
                </div>

                <AnimatePresence mode="wait">
                  {isEditing ? (
                    <motion.input
                      key="input"
                      type={type}
                      name={name}
                      value={profileData[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      className="pp-field-input"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    />
                  ) : (
                    <motion.div
                      key="value"
                      className={`pp-field-value${!profileData[name] ? " empty" : ""}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {profileData[name] || "Not provided"}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}