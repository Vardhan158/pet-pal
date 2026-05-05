import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, MapPin, Edit2, Save, X, Building, Hash, Camera, Loader } from "lucide-react";
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

  /* ── Avatar with upload overlay ── */
  .pp-avatar-wrap {
    position: relative;
    flex-shrink: 0;
    width: 72px;
    height: 72px;
  }

  .pp-avatar {
    width: 72px; height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f9a8d4, #818cf8);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.75rem;
    font-weight: 800;
    color: #fff;
    box-shadow: 0 4px 16px rgba(129,140,248,0.3);
    border: 3px solid #fff;
    outline: 3px solid #eef1ff;
    overflow: hidden;
    cursor: default;
  }
  .pp-avatar img {
    width: 100%; height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  /* Camera overlay — only visible in edit mode */
  .pp-avatar-overlay {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(99,102,241,0.72);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
    backdrop-filter: blur(2px);
  }
  .pp-avatar-wrap.editing .pp-avatar-overlay { opacity: 1; }
  .pp-avatar-wrap.editing:hover .pp-avatar-overlay { opacity: 1; }
  .pp-avatar-overlay span {
    font-size: 0.48rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* Uploading spinner ring on avatar */
  .pp-avatar-uploading::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 3px solid transparent;
    border-top-color: #818cf8;
    animation: ppSpin 0.8s linear infinite;
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
  .pp-avatar-img-hint {
    font-size: 0.68rem;
    color: #a5b4fc;
    margin: 4px 0 0;
    font-weight: 500;
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
  .pp-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

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

/* ─── Cloudinary config — replace with your own values ─── */
const CLOUDINARY_CLOUD_NAME = "dujdjt4l7";   // 🔁 replace
const CLOUDINARY_UPLOAD_PRESET = "petworld";

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
  const fileRef    = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "", email: "", phone: "", address: "", city: "", state: "", zipCode: "",
    profileImage: "",
  });
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [previewImage, setPreviewImage] = useState(""); // local preview before upload

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    (async () => {
      try {
        const res = await axiosInstance.get("/auth/profile");
        setProfileData(res.data);
        setPreviewImage(res.data.profileImage || "");
      } catch {
        setProfileData({
          name: user.name || "", email: user.email || "",
          phone: "", address: "", city: "", state: "", zipCode: "",
          profileImage: "",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [user, navigate]);

  const handleChange = (e) =>
    setProfileData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /* ── Cloudinary upload ── */
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }

    // Instant local preview
    const localUrl = URL.createObjectURL(file);
    setPreviewImage(localUrl);

    // Upload to Cloudinary
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", "petworld/profiles");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await res.json();
      if (!res.ok || !data.secure_url) throw new Error(data.error?.message || "Upload failed");
      const secureUrl = data.secure_url;

      setProfileData((prev) => ({ ...prev, profileImage: secureUrl }));
      setPreviewImage(secureUrl);
      toast.success("Photo uploaded!");
    } catch (err) {
      toast.error(err.message || "Image upload failed. Please try again.");
      // Revert preview to saved image
      setPreviewImage(profileData.profileImage || "");
    } finally {
      setUploading(false);
      // Reset file input so same file can be re-selected
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosInstance.put("/auth/profile", profileData);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Revert preview to last saved image
    setPreviewImage(profileData.profileImage || "");
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
          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageSelect}
          />

          {/* Avatar with camera overlay */}
          <div
            className={`pp-avatar-wrap${isEditing ? " editing" : ""}${uploading ? " pp-avatar-uploading" : ""}`}
            onClick={() => isEditing && !uploading && fileRef.current?.click()}
            title={isEditing ? "Click to change photo" : ""}
          >
            <div className="pp-avatar">
              {previewImage ? (
                <img src={previewImage} alt="Profile" />
              ) : (
                getInitial(profileData.name, profileData.email)
              )}
            </div>

            {/* Overlay only visible in edit mode */}
            {isEditing && (
              <div className="pp-avatar-overlay">
                {uploading ? (
                  <Loader size={18} color="#fff" style={{ animation: "ppSpin 0.8s linear infinite" }} />
                ) : (
                  <>
                    <Camera size={18} color="#fff" />
                    <span>Change</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="pp-avatar-info">
            <p className="pp-avatar-name">{profileData.name || "Your Name"}</p>
            <p className="pp-avatar-email">{profileData.email || "your@email.com"}</p>
            {isEditing && (
              <p className="pp-avatar-img-hint">
                {uploading ? "Uploading…" : "Click photo to change · JPG/PNG · max 5 MB"}
              </p>
            )}
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
                    disabled={saving || uploading}
                  >
                    <Save size={13} />
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    className="pp-btn-edit pp-btn-cancel"
                    onClick={handleCancelEdit}
                    disabled={uploading}
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
