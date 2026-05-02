import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/utils/axiosInstance";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, UserPlus, Loader2 } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import OfferManagement from "./OfferManagement";

/* ── Inject Poppins once ── */
if (!document.getElementById("ad-poppins")) {
  const s = document.createElement("style");
  s.id = "ad-poppins";
  s.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
    .ad-root, .ad-root * { font-family: 'Poppins', sans-serif; box-sizing: border-box; }

    .ad-card {
      background: #fff; border-radius: 20px;
      border: 1px solid rgba(0,0,0,0.05);
      box-shadow: 0 2px 14px rgba(0,0,0,0.06);
      overflow: hidden; display: flex; flex-direction: column;
      transition: transform 0.26s ease, box-shadow 0.26s ease;
    }
    .ad-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 16px 40px rgba(99,102,241,0.12);
    }
    .ad-card-img {
      width: 100%; height: 180px; object-fit: cover; display: block;
      transition: transform 0.45s ease;
    }
    .ad-card:hover .ad-card-img { transform: scale(1.06); }
    .ad-card-img-wrap { overflow: hidden; }

    .ad-approve-btn {
      display: flex; align-items: center; gap: 7px;
      padding: 8px 16px; border-radius: 11px; border: none;
      background: #F0FDF4; color: #16A34A;
      font-family: 'Poppins', sans-serif;
      font-size: 0.8rem; font-weight: 600; cursor: pointer;
      border: 1px solid #BBF7D0;
      transition: all 0.2s;
    }
    .ad-approve-btn:hover { background: #DCFCE7; box-shadow: 0 3px 12px rgba(22,163,74,0.18); }

    .ad-reject-btn {
      display: flex; align-items: center; gap: 7px;
      padding: 8px 16px; border-radius: 11px; border: none;
      background: #FEF2F2; color: #DC2626;
      font-family: 'Poppins', sans-serif;
      font-size: 0.8rem; font-weight: 600; cursor: pointer;
      border: 1px solid #FECACA;
      transition: all 0.2s;
    }
    .ad-reject-btn:hover { background: #FEE2E2; box-shadow: 0 3px 12px rgba(220,38,38,0.15); }

    .ad-input {
      width: 100%; padding: 11px 14px;
      border: 1.5px solid #E5E7EB; border-radius: 12px;
      font-family: 'Poppins', sans-serif;
      font-size: 0.88rem; color: #0F172A; background: #FAFAFA;
      outline: none; transition: border-color 0.2s, box-shadow 0.2s;
    }
    .ad-input:focus {
      border-color: #6366F1;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
      background: #fff;
    }
    .ad-input::placeholder { color: #9CA3AF; }

    .ad-submit-btn {
      width: 100%; padding: 12px; border: none; border-radius: 13px;
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      color: #fff; font-family: 'Poppins', sans-serif;
      font-size: 0.9rem; font-weight: 700; cursor: pointer;
      box-shadow: 0 4px 16px rgba(99,102,241,0.3);
      transition: opacity 0.2s, box-shadow 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .ad-submit-btn:hover { opacity: 0.91; box-shadow: 0 6px 22px rgba(99,102,241,0.4); }

    .ad-skeleton {
      background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
      background-size: 200% 100%;
      animation: ad-shimmer 1.4s ease infinite;
      border-radius: 12px;
    }
    @keyframes ad-shimmer {
      0%   { background-position: 200% center; }
      100% { background-position: -200% center; }
    }

    .ad-status-badge {
      display: inline-flex; align-items: center;
      padding: 3px 10px; border-radius: 999px;
      font-size: 0.7rem; font-weight: 700;
      letter-spacing: 0.03em; text-transform: uppercase;
    }
  `;
  document.head.appendChild(s);
}

const FIELD_LABELS = { name: "Full Name", email: "Email", password: "Password", shopName: "Shop Name" };

const viewTitles = {
  pending:   "Pending Reviews",
  approved:  "Approved Pets",
  rejected:  "Rejected Pets",
  sellers:   "All Sellers",
  users:     "All Users",
  addSeller: "Add New Seller",
  offers:    "Manage Offers",
};

function SkeletonCard() {
  return (
    <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden",
      border: "1px solid #F1F5F9", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
      <div className="ad-skeleton" style={{ height: 180 }} />
      <div style={{ padding: "16px 18px" }}>
        <div className="ad-skeleton" style={{ height: 18, width: "65%", marginBottom: 10 }} />
        <div className="ad-skeleton" style={{ height: 13, width: "45%", marginBottom: 18 }} />
        <div style={{ display: "flex", gap: 10 }}>
          <div className="ad-skeleton" style={{ height: 36, flex: 1 }} />
          <div className="ad-skeleton" style={{ height: 36, flex: 1 }} />
        </div>
      </div>
    </div>
  );
}

const cardVariant = {
  hidden:  { opacity: 0, y: 20, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function AdminDashboard() {
  const [view, setView] = useState("pending");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sellerForm, setSellerForm] = useState({ name: "", email: "", password: "", shopName: "" });
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      setLoading(true);
      if (!token) { toast.error("Unauthorized — please log in again."); return; }
      if (view === "addSeller" || view === "offers") return;

      const endpoints = {
        pending:  "/admin/pets/pending",
        approved: "/admin/pets/approved",
        rejected: "/admin/pets/rejected",
        sellers:  "/admin/sellers",
        users:    "/admin/users",
      };

      const endpoint = endpoints[view];
      if (!endpoint) return toast.error("Invalid view selected");

      const res = await axiosInstance.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setData(
        res.data.pendingPets || res.data.approvedPets ||
        res.data.rejectedPets || res.data.sellers ||
        res.data.users || []
      );
    } catch (err) {
      if (err.response?.status === 401) toast.error("Session expired. Please log in again.");
      else toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view !== "addSeller" && view !== "offers") fetchData();
  }, [view]);

  const handleReview = async (id, action) => {
    try {
      await axiosInstance.put(`/admin/review/${id}`, { action }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Pet ${action}ed successfully!`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating status");
    }
  };

  const handleAddSeller = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/admin/create-seller", sellerForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Seller created successfully!");
      setSellerForm({ name: "", email: "", password: "", shopName: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding seller");
    }
  };

  return (
    <div className="ad-root" style={{
      display: "flex", minHeight: "100vh",
      background: "linear-gradient(160deg, #F8FAFF 0%, #FFFFFF 55%, #F5F8FF 100%)",
    }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "'Poppins', sans-serif", fontSize: "0.87rem",
            fontWeight: 500, borderRadius: "14px", padding: "11px 18px",
            background: "#fff", color: "#0F172A",
            boxShadow: "0 8px 28px rgba(0,0,0,0.10)",
            border: "1px solid rgba(0,0,0,0.06)",
          },
          success: { style: { background: "#EEF2FF", color: "#3730A3", border: "1px solid #C7D2FE" } },
          error:   { style: { background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA" } },
        }}
      />

      <AdminSidebar setView={setView} currentView={view} />

      <main style={{ flex: 1, padding: "40px 36px", overflowY: "auto" }}>

        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ marginBottom: 32 }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#EEF2FF", borderRadius: 999,
            padding: "4px 16px", marginBottom: 12,
            border: "1px solid #C7D2FE",
          }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#4338CA",
              letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Admin Panel
            </span>
          </div>
          <h1 style={{
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            fontWeight: 800, color: "#0F172A",
            margin: 0, letterSpacing: "-0.02em",
          }}>
            {viewTitles[view] || view}
          </h1>
        </motion.div>

        {/* ── Views ── */}
        <AnimatePresence mode="wait">

          {/* Offers */}
          {view === "offers" && (
            <motion.div key="offers"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <OfferManagement />
            </motion.div>
          )}

          {/* Add Seller Form */}
          {view === "addSeller" && (
            <motion.div key="addSeller"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ maxWidth: 460 }}
            >
              <div style={{
                background: "#fff", borderRadius: 22,
                border: "1px solid rgba(0,0,0,0.05)",
                boxShadow: "0 4px 24px rgba(99,102,241,0.08)",
                padding: "32px 28px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 11,
                    background: "linear-gradient(135deg, #EEF2FF, #E0E7FF)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <UserPlus size={18} color="#6366F1" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0F172A" }}>Create New Seller</div>
                    <div style={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 400 }}>Fill in all fields below</div>
                  </div>
                </div>

                <form onSubmit={handleAddSeller} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {Object.keys(sellerForm).map((field) => (
                    <div key={field}>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600,
                        color: "#374151", marginBottom: 7, letterSpacing: "0.01em" }}>
                        {FIELD_LABELS[field]}
                      </label>
                      <input
                        className="ad-input"
                        type={field === "password" ? "password" : "text"}
                        placeholder={`Enter ${FIELD_LABELS[field].toLowerCase()}…`}
                        value={sellerForm[field]}
                        onChange={(e) => setSellerForm({ ...sellerForm, [field]: e.target.value })}
                        required
                      />
                    </div>
                  ))}
                  <button type="submit" className="ad-submit-btn" style={{ marginTop: 8 }}>
                    <UserPlus size={16} /> Create Seller Account
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* Data grid */}
          {view !== "offers" && view !== "addSeller" && (
            <motion.div key={view}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {loading ? (
                <div style={{ display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 22 }}>
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : data.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 24px" }}>
                  <div style={{ fontSize: "3rem", marginBottom: 14 }}>🐾</div>
                  <p style={{ color: "#9CA3AF", fontSize: "1rem", fontWeight: 500 }}>
                    No items found in this category.
                  </p>
                </div>
              ) : (
                <motion.div
                  variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                  initial="hidden" animate="visible"
                  style={{ display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 22 }}
                >
                  {data.map((item) => (
                    <motion.div
                      key={item._id}
                      variants={cardVariant}
                      transition={{ duration: 0.38 }}
                      className="ad-card"
                    >
                      {/* Image */}
                      {item.image && (
                        <div className="ad-card-img-wrap">
                          <img src={item.image} alt={item.name} className="ad-card-img" />
                        </div>
                      )}

                      {/* Body */}
                      <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex",
                        flexDirection: "column" }}>

                        {/* Name / shop */}
                        <h3 style={{ margin: "0 0 4px", fontSize: "0.97rem", fontWeight: 700,
                          color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis",
                          whiteSpace: "nowrap" }}>
                          {item.name || item.shopName || "—"}
                        </h3>

                        {item.email && (
                          <p style={{ margin: "0 0 6px", fontSize: "0.78rem", color: "#9CA3AF",
                            fontWeight: 400, overflow: "hidden", textOverflow: "ellipsis",
                            whiteSpace: "nowrap" }}>
                            {item.email}
                          </p>
                        )}

                        {item.price && (
                          <p style={{ margin: "0 0 14px", fontSize: "0.9rem",
                            fontWeight: 700, color: "#6366F1" }}>
                            ₹{item.price}
                          </p>
                        )}

                        {/* Status badge for non-pending */}
                        {view !== "pending" && (
                          <span className="ad-status-badge" style={{
                            marginBottom: 14, alignSelf: "flex-start",
                            background: view === "approved" ? "#DCFCE7" : view === "rejected" ? "#FEE2E2" : "#EEF2FF",
                            color: view === "approved" ? "#16A34A" : view === "rejected" ? "#DC2626" : "#6366F1",
                          }}>
                            {view}
                          </span>
                        )}

                        {/* Approve / Reject */}
                        {view === "pending" && (
                          <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
                            <button className="ad-approve-btn" style={{ flex: 1 }}
                              onClick={() => handleReview(item._id, "approve")}>
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button className="ad-reject-btn" style={{ flex: 1 }}
                              onClick={() => handleReview(item._id, "reject")}>
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}