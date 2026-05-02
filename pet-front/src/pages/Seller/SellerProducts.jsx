// src/pages/Seller/SellerProducts.jsx
import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../../api/utils/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Pencil, Trash2, PawPrint } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Design tokens (matches admin system) ─────────────── */
const T = {
  bg:     "#F7F7FC",
  card:   "#FFFFFF",
  border: "#F0EFF8",
  muted:  "#9CA3AF",
  head:   "#1E1B4B",
  font:   "'Poppins', sans-serif",
};

/* ─── Status badge ─────────────────────────────────────── */
const STATUS = {
  approved: { bg: "#ECFDF5", text: "#047857", dot: "#059669", label: "Approved" },
  rejected: { bg: "#FFF1F1", text: "#B91C1C", dot: "#EF4444", label: "Rejected" },
  pending:  { bg: "#FFFBEB", text: "#B45309", dot: "#D97706", label: "Pending"  },
};
const StatusBadge = ({ status }) => {
  const s = STATUS[status?.toLowerCase()] || STATUS.pending;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:s.bg, color:s.text, fontSize:11, fontWeight:600, letterSpacing:"0.04em", padding:"3px 10px", borderRadius:99, textTransform:"uppercase", fontFamily:T.font, whiteSpace:"nowrap" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:s.dot, flexShrink:0 }} />
      {s.label}
    </span>
  );
};

/* ─── Skeleton ─────────────────────────────────────────── */
const Skeleton = () => (
  <div style={{ fontFamily:T.font, padding:"28px 20px", background:T.bg, minHeight:"100vh" }}>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"/>
    <div style={{ maxWidth:960, margin:"0 auto" }}>
      <div style={{ width:200, height:24, background:"#E9E7F8", borderRadius:8, marginBottom:8 }} />
      <div style={{ width:140, height:13, background:T.border, borderRadius:6, marginBottom:24 }} />
      <div style={{ background:T.card, borderRadius:18, border:`1px solid ${T.border}`, overflow:"hidden" }}>
        <div style={{ background:"#F7F7FC", padding:"14px 20px", display:"flex", gap:10 }}>
          {[160,120,90].map((w,i)=><div key={i} style={{ height:12, width:w, background:T.border, borderRadius:6 }}/>)}
        </div>
        {[1,2,3,4].map(i=>(
          <div key={i} style={{ display:"flex", gap:14, padding:"14px 20px", borderTop:`1px solid ${T.border}`, alignItems:"center" }}>
            <div style={{ width:52, height:52, borderRadius:12, background:T.border, flexShrink:0 }} />
            <div style={{ flex:1, display:"flex", gap:10 }}>
              {[120,80,60,70].map((w,j)=><div key={j} style={{ height:12, width:w, background:T.border, borderRadius:6 }}/>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─── Main component ───────────────────────────────────── */
export default function SellerProducts() {
  const [pets,           setPets]           = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [query,          setQuery]          = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [deletingId,     setDeletingId]     = useState(null);
  const token   = localStorage.getItem("token");
  const fetched = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    async function fetchPets() {
      try {
        const res = await axiosInstance.get("/sellers/my-pets", { headers: { Authorization: `Bearer ${token}` } });
        setPets(res.data?.pets || []);
      } catch {
        toast.error("Failed to load your pets");
      } finally {
        setLoading(false);
      }
    }
    fetchPets();
  }, [token]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await axiosInstance.delete(`/sellers/my-pets/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        toast.success("Listing deleted");
        setPets(p => p.filter(x => x._id !== id && x.id !== id));
      } else {
        toast.error(res.data.message || "Failed to delete");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (pet) => navigate("/seller/dashboard", { state: { pet } });

  const filtered = pets.filter(p => {
    const q = !query || (p.name || "").toLowerCase().includes(query.toLowerCase());
    const c = !filterCategory || p.category === filterCategory;
    return q && c;
  });

  const categories = [...new Set(pets.map(p => p.category).filter(Boolean))];

  /* summary counts */
  const counts = {
    total:    pets.length,
    approved: pets.filter(p => p.status === "approved").length,
    pending:  pets.filter(p => !p.status || p.status === "pending").length,
    rejected: pets.filter(p => p.status === "rejected").length,
  };

  if (loading) return <Skeleton />;

  return (
    <div style={{ fontFamily:T.font, background:T.bg, minHeight:"100vh", padding:"28px 20px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      <div style={{ maxWidth:960, margin:"0 auto" }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10, marginBottom:20 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
              <h2 style={{ fontSize:24, fontWeight:700, color:T.head, margin:0 }}>My Listings</h2>
              <span style={{ fontSize:12, fontWeight:600, background:"#EEF2FF", color:"#4F46E5", padding:"2px 10px", borderRadius:99 }}>{pets.length}</span>
            </div>
            <p style={{ fontSize:12, color:T.muted, margin:0 }}>Manage your pet listings</p>
          </div>
          <button
            onClick={() => navigate("/seller/dashboard")}
            style={{ display:"flex", alignItems:"center", gap:7, background:"#4F46E5", color:"#fff", border:"none", borderRadius:10, padding:"9px 16px", fontSize:12, fontWeight:600, fontFamily:T.font, cursor:"pointer" }}
          >
            <span style={{ fontSize:16, lineHeight:1 }}>+</span> Add Listing
          </button>
        </div>

        {/* ── Summary strip ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))", gap:10, marginBottom:18 }}>
          {[
            { label:"Total",    value:counts.total,    dot:"#4F46E5" },
            { label:"Approved", value:counts.approved, dot:"#059669" },
            { label:"Pending",  value:counts.pending,  dot:"#D97706" },
            { label:"Rejected", value:counts.rejected, dot:"#EF4444" },
          ].map(s => (
            <div key={s.label} style={{ background:T.card, borderRadius:14, border:`1px solid ${T.border}`, padding:"11px 14px", display:"flex", alignItems:"center", gap:10, boxShadow:"0 1px 4px rgba(100,90,200,0.05)" }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:s.dot, flexShrink:0 }} />
              <div>
                <p style={{ fontSize:10, color:T.muted, margin:0, textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:500 }}>{s.label}</p>
                <p style={{ fontSize:20, fontWeight:700, color:T.head, margin:0 }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:16 }}>
          {/* Search */}
          <div style={{ position:"relative", flex:"1 1 200px", maxWidth:280 }}>
            <Search size={14} color={T.muted} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
            <input
              type="search"
              placeholder="Search by name…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ width:"100%", padding:"9px 11px 9px 32px", border:`1px solid ${T.border}`, borderRadius:10, fontSize:12, fontFamily:T.font, color:T.head, background:T.card, outline:"none", boxSizing:"border-box" }}
            />
          </div>
          {/* Category filter */}
          <div style={{ position:"relative" }}>
            <SlidersHorizontal size={13} color={T.muted} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              style={{ padding:"9px 32px 9px 30px", border:`1px solid ${T.border}`, borderRadius:10, fontSize:12, fontFamily:T.font, color:T.head, background:T.card, appearance:"none", outline:"none", cursor:"pointer" }}
            >
              <option value="">All categories</option>
              {(categories.length ? categories : ["Dog","Cat","Bird","Fish"]).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Table ── */}
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
          style={{ background:T.card, borderRadius:18, border:`1px solid ${T.border}`, overflow:"hidden", boxShadow:"0 1px 4px rgba(100,90,200,0.06)" }}
        >
          {/* Desktop table */}
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ background:"#F7F7FC" }}>
                  {["Pet","Category","Price","Status","Actions"].map(h => (
                    <th key={h} style={{ padding:"13px 18px", textAlign:"left", fontSize:11, fontWeight:600, color:T.muted, letterSpacing:"0.07em", textTransform:"uppercase", borderBottom:`1px solid ${T.border}`, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.length > 0 ? filtered.map((pet, i) => (
                    <motion.tr
                      key={pet._id || pet.id || i}
                      initial={{ opacity:0 }}
                      animate={{ opacity:1 }}
                      exit={{ opacity:0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{ borderBottom:`1px solid ${T.border}`, transition:"background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background="#FAFAFE"}
                      onMouseLeave={e => e.currentTarget.style.background="transparent"}
                    >
                      {/* Pet name + image */}
                      <td style={{ padding:"12px 18px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                          <div style={{ width:52, height:52, borderRadius:12, overflow:"hidden", flexShrink:0, border:`1px solid ${T.border}` }}>
                            <img
                              src={pet.image || "https://cdn-icons-png.flaticon.com/512/616/616408.png"}
                              alt={pet.name}
                              style={{ width:"100%", height:"100%", objectFit:"cover" }}
                            />
                          </div>
                          <span style={{ fontWeight:600, color:T.head, maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {pet.name || "Unnamed Pet"}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding:"12px 18px" }}>
                        <span style={{ background:"#EEF2FF", color:"#4F46E5", fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:99 }}>
                          {pet.category || "—"}
                        </span>
                      </td>

                      {/* Price */}
                      <td style={{ padding:"12px 18px", fontWeight:700, color:T.head }}>
                        ₹{(pet.price || 0).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td style={{ padding:"12px 18px" }}>
                        <StatusBadge status={pet.status} />
                      </td>

                      {/* Actions */}
                      <td style={{ padding:"12px 18px" }}>
                        <div style={{ display:"flex", gap:8 }}>
                          <button
                            onClick={() => handleEdit(pet)}
                            style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:8, border:"1px solid #DBEAFE", background:"#EFF6FF", color:"#1D4ED8", fontSize:11, fontWeight:600, fontFamily:T.font, cursor:"pointer" }}
                          >
                            <Pencil size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(pet._id || pet.id)}
                            disabled={deletingId === (pet._id || pet.id)}
                            style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:8, border:"1px solid #FEE2E2", background:"#FFF1F1", color:"#DC2626", fontSize:11, fontWeight:600, fontFamily:T.font, cursor:"pointer", opacity: deletingId===(pet._id||pet.id)?0.5:1 }}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign:"center", padding:"48px 20px", color:T.muted }}>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
                          <PawPrint size={36} color="#D1D5DB" />
                          <p style={{ fontWeight:600, color:"#374151", fontSize:14, margin:0 }}>No listings found</p>
                          <p style={{ fontSize:12, color:T.muted, margin:0 }}>
                            {query || filterCategory ? "Try adjusting your filters" : "Add your first pet listing to get started"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Results count */}
        {filtered.length > 0 && (
          <p style={{ fontSize:12, color:T.muted, margin:"12px 0 0", textAlign:"right" }}>
            Showing {filtered.length} of {pets.length} listing{pets.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}