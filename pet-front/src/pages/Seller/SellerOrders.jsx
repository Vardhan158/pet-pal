// src/pages/Seller/SellerOrders.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/utils/axiosInstance";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  MapPin,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

/* ─── Design tokens ───────────────────────────────────── */
const T = {
  bg:     "#F7F7FC",
  card:   "#FFFFFF",
  border: "#F0EFF8",
  muted:  "#9CA3AF",
  head:   "#1E1B4B",
  font:   "'Poppins', sans-serif",
};

/* ─── Order steps ─────────────────────────────────────── */
const STEPS = [
  { label: "Placed",    Icon: Package,      accent: "#7C3AED", bg: "#F5F3FF" },
  { label: "Shipped",   Icon: Truck,        accent: "#0891B2", bg: "#ECFEFF" },
  { label: "Out",       Icon: MapPin,       accent: "#D97706", bg: "#FFFBEB" },
  { label: "Delivered", Icon: CheckCircle2, accent: "#059669", bg: "#ECFDF5" },
];
const STATUS_IDX = {
  "Order Placed": 0, Shipped: 1, "Out for Delivery": 2, Delivered: 3,
};

/* ─── Status badge ────────────────────────────────────── */
const SBADGE = {
  "Order Placed":    { bg:"#F5F3FF", text:"#5B21B6", dot:"#7C3AED" },
  Shipped:           { bg:"#ECFEFF", text:"#0E7490", dot:"#0891B2" },
  "Out for Delivery":{ bg:"#FFFBEB", text:"#B45309", dot:"#D97706" },
  Delivered:         { bg:"#ECFDF5", text:"#047857", dot:"#059669" },
  Cancelled:         { bg:"#FFF1F1", text:"#B91C1C", dot:"#EF4444" },
};
const StatusBadge = ({ status }) => {
  const s = SBADGE[status] || { bg:"#F3F4F6", text:"#6B7280", dot:"#9CA3AF" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:s.bg, color:s.text, fontSize:11, fontWeight:600, letterSpacing:"0.04em", padding:"3px 10px", borderRadius:99, textTransform:"uppercase", fontFamily:T.font }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:s.dot }} />
      {status}
    </span>
  );
};

/* ─── Timeline ────────────────────────────────────────── */
const Timeline = ({ stepIdx }) => (
  <div style={{ position:"relative", display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginTop:14 }}>
    <div style={{ position:"absolute", top:16, left:"5%", right:"5%", height:2, background:T.border, zIndex:0 }}>
      <motion.div
        initial={{ width:0 }}
        animate={{ width: stepIdx === 0 ? "0%" : `${(stepIdx/(STEPS.length-1))*100}%` }}
        transition={{ duration:0.9, ease:"easeOut" }}
        style={{ height:"100%", background:"linear-gradient(90deg,#7C3AED,#059669)", borderRadius:2 }}
      />
    </div>
    {STEPS.map(({ label, Icon, accent, bg }, i) => {
      const active = i <= stepIdx;
      return (
        <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", zIndex:1, flex:1 }}>
          <motion.div
            initial={{ scale:0.7, opacity:0 }}
            animate={{ scale:1, opacity:1 }}
            transition={{ delay:i*0.08, duration:0.28 }}
            style={{ width:32, height:32, borderRadius:"50%", background:active?bg:T.bg, border:`2px solid ${active?accent:"#E5E7EB"}`, display:"flex", alignItems:"center", justifyContent:"center" }}
          >
            <Icon size={14} color={active?accent:"#D1D5DB"} />
          </motion.div>
          <span style={{ fontSize:10, marginTop:5, fontWeight:active?600:400, color:active?T.head:T.muted, fontFamily:T.font, textAlign:"center", lineHeight:1.2 }}>{label}</span>
        </div>
      );
    })}
  </div>
);

/* ─── Skeleton loader ─────────────────────────────────── */
const Skeleton = () => (
  <div style={{ fontFamily:T.font, background:T.bg, minHeight:"100vh", padding:"28px 20px" }}>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"/>
    <div style={{ maxWidth:1020, margin:"0 auto" }}>
      <div style={{ width:220, height:26, background:"#E9E7F8", borderRadius:10, marginBottom:8 }} />
      <div style={{ width:160, height:13, background:T.border, borderRadius:8, marginBottom:26 }} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:14 }}>
        {[1,2,3].map(i=>(
          <div key={i} style={{ background:"#fff", borderRadius:18, overflow:"hidden", border:`1px solid ${T.border}` }}>
            <div style={{ height:170, background:"linear-gradient(135deg,#F0EFF8,#E9E7F8)" }} />
            <div style={{ padding:18 }}>
              {[80,120,100].map((w,j)=>(
                <div key={j} style={{ height:11, width:`${w}%`, background:T.border, borderRadius:6, marginBottom:10 }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─── Order card ──────────────────────────────────────── */
const OrderCard = ({ order, onStatusChange, updating, delay }) => {
  const pet    = order.items?.[0]?.pet;
  const status = order.orderStatus;
  const step   = STATUS_IDX[status] ?? 0;

  return (
    <motion.div
      initial={{ opacity:0, y:20 }}
      animate={{ opacity:1, y:0 }}
      exit={{ opacity:0, scale:0.97 }}
      transition={{ delay, duration:0.35 }}
      whileHover={{ y:-3, transition:{ duration:0.18 } }}
      style={{ background:T.card, borderRadius:18, border:`1px solid ${T.border}`, boxShadow:"0 1px 4px rgba(100,90,200,0.06)", overflow:"hidden", display:"flex", flexDirection:"column" }}
    >
      {/* Image */}
      <div style={{ height:170, overflow:"hidden", position:"relative" }}>
        <motion.img
          src={pet?.image || "https://cdn-icons-png.flaticon.com/512/616/616408.png"}
          alt={pet?.name || "Pet"}
          whileHover={{ scale:1.07 }}
          transition={{ duration:0.4 }}
          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
        />
        {/* Payment pill */}
        <span style={{
          position:"absolute", top:12, right:12,
          background: order.paymentStatus==="Paid" ? "#ECFDF5" : "#FFFBEB",
          color:       order.paymentStatus==="Paid" ? "#047857" : "#B45309",
          border:`1px solid ${order.paymentStatus==="Paid"?"#A7F3D0":"#FDE68A"}`,
          fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:99, fontFamily:T.font,
        }}>{order.paymentStatus}</span>
      </div>

      {/* Body */}
      <div style={{ padding:"16px 18px", flex:1, display:"flex", flexDirection:"column", gap:13 }}>

        {/* Name + amount */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <p style={{ fontWeight:700, fontSize:15, color:T.head, margin:0, fontFamily:T.font }}>{pet?.name||"Unknown Pet"}</p>
            <p style={{ fontSize:11, color:T.muted, margin:"2px 0 0", fontFamily:T.font }}>{order.user?.name||"—"}</p>
            <p style={{ fontSize:11, color:"#6366F1", margin:"1px 0 0", fontFamily:T.font, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:160 }}>{order.user?.email||"—"}</p>
          </div>
          <p style={{ fontWeight:700, fontSize:18, color:T.head, margin:0, flexShrink:0, fontFamily:T.font }}>
            ₹{(order.totalAmount||0).toLocaleString()}
          </p>
        </div>

        {/* Timeline */}
        {status !== "Cancelled" && <Timeline stepIdx={step} />}

        {/* Divider */}
        <div style={{ height:1, background:T.border }} />

        {/* Status dropdown */}
        <div>
          <label style={{ fontSize:10, fontWeight:600, color:T.muted, textTransform:"uppercase", letterSpacing:"0.06em", fontFamily:T.font }}>Update Status</label>
          <div style={{ position:"relative", marginTop:5 }}>
            <select
              value={status}
              onChange={e => onStatusChange(order._id, e.target.value)}
              disabled={updating}
              style={{ width:"100%", padding:"9px 32px 9px 11px", borderRadius:10, border:`1px solid ${T.border}`, fontSize:12, fontWeight:500, color:T.head, background:"#FAFAFE", appearance:"none", fontFamily:T.font, cursor:"pointer", outline:"none" }}
            >
              <option>Order Placed</option>
              <option>Shipped</option>
              <option>Out for Delivery</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
            <ChevronDown size={13} color={T.muted} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <StatusBadge status={status} />
          <span style={{ fontSize:11, color:T.muted, fontFamily:T.font }}>
            {new Date(order.createdAt).toLocaleDateString("en-IN",{ day:"2-digit", month:"short", year:"numeric" })}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Main ────────────────────────────────────────────── */
export default function SellerOrders() {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await axiosInstance.get("/orders/seller-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTimeout(() => { setOrders(res.data?.orders || []); setLoading(false); }, 800);
      } catch {
        toast.error("Failed to load orders");
        setLoading(false);
      }
    }
    fetchOrders();
  }, [token]);

  const handleStatusChange = async (orderId, status) => {
    setUpdating(true);
    try {
      const res = await axiosInstance.put(`/orders/update/${orderId}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        toast.success(`Status → "${status}"`);
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: status } : o));
      }
    } catch { toast.error("Failed to update status"); }
    finally { setTimeout(() => setUpdating(false), 600); }
  };

  if (loading) return <Skeleton />;

  const summary = [
    { label:"All",        value: orders.length,                                                             dot:"#4F46E5" },
    { label:"Delivered",  value: orders.filter(o=>o.orderStatus==="Delivered").length,                      dot:"#059669" },
    { label:"In Transit", value: orders.filter(o=>["Shipped","Out for Delivery"].includes(o.orderStatus)).length, dot:"#D97706" },
    { label:"Cancelled",  value: orders.filter(o=>o.orderStatus==="Cancelled").length,                      dot:"#DC2626" },
  ];

  return (
    <div style={{ fontFamily:T.font, background:T.bg, minHeight:"100vh", padding:"28px 20px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      <div style={{ maxWidth:1020, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10, marginBottom:20 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <h2 style={{ fontSize:24, fontWeight:700, color:T.head, margin:0 }}>Customer Orders</h2>
              <span style={{ fontSize:12, fontWeight:600, background:"#EEF2FF", color:"#4F46E5", padding:"2px 10px", borderRadius:99 }}>{orders.length}</span>
            </div>
            <p style={{ fontSize:12, color:T.muted, margin:"4px 0 0" }}>Manage and dispatch customer orders</p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:7, background:"#fff", border:`1px solid ${T.border}`, borderRadius:99, padding:"6px 14px" }}>
            <RefreshCw size={12} color={T.muted} />
            <span style={{ fontSize:11, fontWeight:500, color:T.muted }}>Auto-synced</span>
          </div>
        </div>

        {/* Summary strip */}
        {orders.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:10, marginBottom:18 }}>
            {summary.map(s=>(
              <div key={s.label} style={{ background:"#fff", borderRadius:14, border:`1px solid ${T.border}`, padding:"11px 14px", display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:s.dot, flexShrink:0 }} />
                <div>
                  <p style={{ fontSize:10, color:T.muted, margin:0, textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:500 }}>{s.label}</p>
                  <p style={{ fontSize:20, fontWeight:700, color:T.head, margin:0 }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {orders.length === 0 ? (
          <div style={{ background:"#fff", borderRadius:20, border:`1px solid ${T.border}`, padding:"60px 20px", textAlign:"center" }}>
            <Package size={40} color="#D1D5DB" style={{ marginBottom:12 }} />
            <p style={{ fontSize:15, fontWeight:600, color:"#374151", margin:0 }}>No orders yet</p>
            <p style={{ fontSize:13, color:T.muted, margin:"6px 0 0" }}>Customer orders will show up here</p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:14 }}>
            <AnimatePresence>
              {orders.map((order, i) => (
                <OrderCard key={order._id} order={order} onStatusChange={handleStatusChange} updating={updating} delay={i * 0.05} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Updating overlay */}
      <AnimatePresence>
        {updating && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(247,247,252,0.82)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50 }}
          >
            <div style={{ background:"#fff", borderRadius:20, padding:"28px 36px", textAlign:"center", border:`1px solid ${T.border}`, boxShadow:"0 8px 32px rgba(100,90,200,0.12)" }}>
              <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }} style={{ display:"inline-block", marginBottom:12 }}>
                <RefreshCw size={24} color="#4F46E5" />
              </motion.div>
              <p style={{ fontWeight:600, color:T.head, margin:0, fontFamily:T.font }}>Updating order…</p>
              <p style={{ fontSize:12, color:T.muted, margin:"4px 0 0", fontFamily:T.font }}>Just a moment</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}