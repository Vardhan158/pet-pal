import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../api/utils/axiosInstance";
import { NOTIFICATION_EVENT } from "../components/RealtimeNotifications";

/* ── Poppins ── */
if (!document.head.querySelector("[href*='Poppins']")) {
  const link = document.createElement("link");
  link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

/* ── Keyframes ── */
if (!document.head.querySelector("#orders-keyframes")) {
  const style = document.createElement("style");
  style.id = "orders-keyframes";
  style.textContent = `
    @keyframes orders-spin    { to{transform:rotate(360deg)} }
    @keyframes orders-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  `;
  document.head.appendChild(style);
}

/* ── Status config ── */
const ORDER_STATUS = {
  Delivered:  { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", dot: "#22c55e" },
  Shipped:    { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6" },
  Processing: { bg: "#fffbeb", color: "#b45309", border: "#fde68a", dot: "#f59e0b" },
  Pending:    { bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe", dot: "#8b5cf6" },
  Cancelled:  { bg: "#fff1f2", color: "#be123c", border: "#fecdd3", dot: "#f43f5e" },
};
const PAYMENT_STATUS = {
  Paid:    { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  Pending: { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  Failed:  { bg: "#fff1f2", color: "#be123c", border: "#fecdd3" },
  COD:     { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
};
const getOrderStatus   = (s) => ORDER_STATUS[s]   || ORDER_STATUS.Pending;
const getPaymentStatus = (s) => PAYMENT_STATUS[s] || PAYMENT_STATUS.Pending;

const S = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f0f4ff 0%, #fafaff 50%, #f5f0ff 100%)",
    fontFamily: "'Poppins', sans-serif",
    padding: "40px 20px 60px",
    boxSizing: "border-box",
  },
  inner: { maxWidth: 900, margin: "0 auto" },

  /* Header */
  header: { display: "flex", alignItems: "center", gap: 14, marginBottom: 28 },
  headerIcon: {
    width: 48, height: 48, borderRadius: 13,
    background: "linear-gradient(135deg, #6366f1, #818cf8)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 20, boxShadow: "0 6px 18px rgba(99,102,241,0.35)", flexShrink: 0,
  },
  headerTitle: { fontSize: 24, fontWeight: 800, color: "#1e1b4b", margin: "0 0 3px", letterSpacing: "-0.4px" },
  headerSub: { fontSize: 12, color: "#94a3b8", margin: 0, fontWeight: 400 },
  badge: {
    display: "inline-flex", alignItems: "center", gap: 4,
    background: "#ede9fe", color: "#6366f1",
    fontSize: 11, fontWeight: 700,
    padding: "3px 11px", borderRadius: 20,
    border: "1px solid #c7d2fe", marginLeft: 10,
  },

  /* Stats strip */
  statsRow: { display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" },
  statCard: {
    flex: "1 1 120px", background: "#fff",
    border: "1px solid #ede9fe", borderRadius: 14,
    padding: "12px 18px",
    boxShadow: "0 2px 10px rgba(99,102,241,0.07)",
  },
  statLabel: { fontSize: 10, fontWeight: 600, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: 0.6, margin: 0 },
  statVal: { fontSize: 20, fontWeight: 800, color: "#1e1b4b", margin: "3px 0 0" },

  /* Order card */
  card: {
    background: "#fff",
    border: "1.5px solid #ede9fe",
    borderRadius: 20,
    boxShadow: "0 2px 16px rgba(99,102,241,0.07)",
    marginBottom: 14,
    overflow: "hidden",
    transition: "box-shadow 0.2s, transform 0.2s",
  },

  /* Card top bar */
  cardTop: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "10px 18px",
    background: "linear-gradient(90deg, #f5f3ff, #eef2ff)",
    borderBottom: "1px solid #ede9fe", gap: 8, flexWrap: "wrap",
  },
  orderIdText: { fontSize: 11, fontWeight: 600, color: "#6366f1", letterSpacing: 0.3 },
  cardTopRight: { display: "flex", alignItems: "center", gap: 8 },

  /* Status pills */
  pill: (cfg) => ({
    display: "inline-flex", alignItems: "center", gap: 5,
    background: cfg.bg, color: cfg.color,
    border: `1px solid ${cfg.border}`,
    fontSize: 10, fontWeight: 700,
    padding: "3px 10px", borderRadius: 20,
    textTransform: "capitalize",
  }),
  pillDot: (cfg) => ({
    width: 5, height: 5, borderRadius: "50%", background: cfg.dot,
  }),

  /* Card body */
  cardBody: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 0,
  },

  /* Pet row */
  petRow: {
    display: "flex", alignItems: "center", gap: 14,
    padding: "16px 18px",
    borderBottom: "1px solid #f1f5f9",
  },
  petImgWrap: {
    width: 56, height: 56, borderRadius: 12,
    border: "1.5px solid #ede9fe",
    overflow: "hidden", flexShrink: 0,
    background: "#f5f3ff",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 10px rgba(99,102,241,0.1)",
  },
  petImg: { width: "100%", height: "100%", objectFit: "cover" },
  petName: { fontSize: 14, fontWeight: 700, color: "#1e1b4b", margin: "0 0 3px" },
  petCat: { fontSize: 11, color: "#94a3b8", fontWeight: 500, margin: 0 },
  qtyBadge: {
    display: "inline-block", background: "#ede9fe",
    color: "#6366f1", fontSize: 10, fontWeight: 700,
    padding: "2px 8px", borderRadius: 8, marginLeft: 7,
  },
  petPrice: { fontSize: 18, fontWeight: 800, color: "#6366f1", marginLeft: "auto", flexShrink: 0 },

  /* Info grid */
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 0,
  },
  infoCell: {
    padding: "14px 18px",
    borderRight: "1px solid #f1f5f9",
    borderBottom: "1px solid #f1f5f9",
  },
  infoLabel: { fontSize: 9, fontWeight: 700, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: 0.7, margin: "0 0 5px" },
  infoVal: { fontSize: 12, fontWeight: 600, color: "#374151", margin: 0, lineHeight: 1.5 },
  infoMuted: { fontSize: 11, color: "#94a3b8", margin: "2px 0 0", fontWeight: 400 },

  /* Empty */
  empty: {
    background: "#fff", borderRadius: 22,
    border: "1.5px solid #ede9fe",
    boxShadow: "0 4px 24px rgba(99,102,241,0.07)",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "72px 24px", textAlign: "center",
    minHeight: "60vh",
  },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 700, color: "#1e1b4b", margin: "0 0 8px" },
  emptySubtitle: { fontSize: 13, color: "#94a3b8", margin: 0, maxWidth: 280, lineHeight: 1.6 },

  /* Skeleton */
  skeletonCard: {
    background: "#fff", borderRadius: 20,
    border: "1.5px solid #ede9fe", marginBottom: 14, overflow: "hidden",
  },
  skeletonBar: (w, h = 11) => ({
    height: h, borderRadius: 8,
    background: "linear-gradient(90deg, #f0f0ff 25%, #e8e4fc 50%, #f0f0ff 75%)",
    backgroundSize: "200% 100%",
    animation: "orders-shimmer 1.4s infinite",
    width: w, marginBottom: 8,
  }),

  /* Spinner */
  spinnerPage: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "linear-gradient(135deg, #f0f4ff 0%, #fafaff 50%, #f5f0ff 100%)",
    fontFamily: "'Poppins', sans-serif",
  },
  spinnerBox: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
    background: "#fff", borderRadius: 20, padding: "32px 48px",
    border: "1px solid #ede9fe", boxShadow: "0 8px 32px rgba(99,102,241,0.1)",
  },
  spinner: {
    width: 38, height: 38,
    border: "4px solid #e0e7ff", borderTop: "4px solid #6366f1",
    borderRadius: "50%", animation: "orders-spin 0.8s linear infinite",
  },
  spinnerText: { fontSize: 13, fontWeight: 600, color: "#6366f1", margin: 0 },
};

const SkeletonOrderCard = () => (
  <div style={S.skeletonCard}>
    <div style={{ padding: "10px 18px", background: "#f5f3ff", borderBottom: "1px solid #ede9fe", display: "flex", gap: 12 }}>
      <div style={S.skeletonBar(120, 10)} />
      <div style={{ ...S.skeletonBar(70, 10), marginLeft: "auto" }} />
    </div>
    <div style={{ padding: "16px 18px", display: "flex", gap: 14, alignItems: "center", borderBottom: "1px solid #f1f5f9" }}>
      <div style={{ width: 56, height: 56, borderRadius: 12, background: "linear-gradient(90deg, #f0f0ff 25%, #e8e4fc 50%, #f0f0ff 75%)", backgroundSize: "200% 100%", animation: "orders-shimmer 1.4s infinite", flexShrink: 0 }} />
      <div style={{ flex: 1 }}><div style={S.skeletonBar("50%", 12)} /><div style={S.skeletonBar("30%", 9)} /></div>
      <div style={S.skeletonBar(70, 14)} />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", padding: "14px 18px", gap: 14 }}>
      {[0,1,2].map(i => <div key={i}><div style={S.skeletonBar("60%", 9)} /><div style={S.skeletonBar("80%", 11)} /></div>)}
    </div>
  </div>
);

export default function OrdersPage() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get("/orders/my-orders")
      .then(({ data }) => { if (data.success) setOrders(data.orders); else toast.error("Failed to load orders"); })
      .catch(() => toast.error("Error fetching orders 🐾"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = async (e) => {
      if (e.detail?.type !== "order") return;
      try {
        const { data } = await axiosInstance.get("/orders/my-orders");
        if (data.success) setOrders(data.orders);
      } catch {}
    };
    window.addEventListener(NOTIFICATION_EVENT, handler);
    return () => window.removeEventListener(NOTIFICATION_EVENT, handler);
  }, []);

  if (loading) return (
    <div style={S.spinnerPage}>
      <div style={S.spinnerBox}>
        <div style={S.spinner} />
        <p style={S.spinnerText}>Loading your orders…</p>
      </div>
    </div>
  );

  const deliveredCount = orders.filter(o => o.orderStatus === "Delivered").length;
  const pendingCount   = orders.filter(o => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled").length;

  return (
    <div style={S.page}>
      <div style={S.inner}>

        {/* ── Header ── */}
        <motion.div style={S.header} initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42 }}>
          <div style={S.headerIcon}>📦</div>
          <div>
            <h1 style={S.headerTitle}>
              My Orders
              {orders.length > 0 && <span style={S.badge}>{orders.length} total</span>}
            </h1>
            <p style={S.headerSub}>Track and manage all your pet purchases</p>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        {orders.length > 0 && (
          <motion.div style={S.statsRow} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <div style={S.statCard}><p style={S.statLabel}>Total Orders</p><p style={S.statVal}>{orders.length}</p></div>
            <div style={S.statCard}><p style={S.statLabel}>Delivered</p><p style={{ ...S.statVal, color: "#15803d" }}>{deliveredCount}</p></div>
            <div style={S.statCard}><p style={S.statLabel}>In Progress</p><p style={{ ...S.statVal, color: "#b45309" }}>{pendingCount}</p></div>
          </motion.div>
        )}

        {/* ── Empty ── */}
        {orders.length === 0 ? (
          <motion.div style={S.empty} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
            <div style={S.emptyEmoji}>📦</div>
            <p style={S.emptyTitle}>No orders yet</p>
            <p style={S.emptySubtitle}>Looks like you haven't purchased anything yet. Start shopping for your perfect pet!</p>
          </motion.div>

        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <AnimatePresence>
              {orders.map((order, idx) => {
                const item     = order.items?.[0];
                const pet      = item?.pet;
                const qty      = item?.quantity || 1;
                const addr     = order.address || {};
                const addrStr  = [addr.house, addr.area, addr.city, addr.pincode].filter(Boolean).join(", ") || "No address";
                const oStatus  = getOrderStatus(order.orderStatus);
                const isCOD    = order.paymentMethod === "Cash on Delivery";
                const pLabel   = isCOD ? "COD" : (order.paymentStatus || "Pending");
                const pStatus  = getPaymentStatus(isCOD ? "COD" : pLabel);

                return (
                  <motion.div
                    key={order._id || idx}
                    style={S.card}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ delay: idx * 0.07, duration: 0.38 }}
                    whileHover={{ boxShadow: "0 8px 28px rgba(99,102,241,0.13)", transform: "translateY(-2px)" }}
                  >
                    {/* Top bar */}
                    <div style={S.cardTop}>
                      <span style={S.orderIdText}>
                        🧾 Order #{(order._id || idx + 1).toString().slice(-6).toUpperCase()}
                      </span>
                      <div style={S.cardTopRight}>
                        <span style={S.pill(oStatus)}>
                          <span style={S.pillDot(oStatus)} />
                          {order.orderStatus || "Pending"}
                        </span>
                        <span style={S.pill(pStatus)}>{pLabel}</span>
                      </div>
                    </div>

                    <div style={S.cardBody}>
                      {/* Pet row */}
                      <div style={S.petRow}>
                        <div style={S.petImgWrap}>
                          <img
                            src={pet?.image || "https://cdn-icons-png.flaticon.com/512/616/616408.png"}
                            alt={pet?.name || "pet"}
                            style={S.petImg}
                          />
                        </div>
                        <div>
                          <p style={S.petName}>
                            {pet?.name || "Unknown Pet"}
                            {qty > 1 && <span style={S.qtyBadge}>× {qty}</span>}
                          </p>
                          <p style={S.petCat}>{pet?.category || "Pet"}</p>
                        </div>
                        <p style={S.petPrice}>₹{order.totalAmount?.toLocaleString() || 0}</p>
                      </div>

                      {/* Info grid */}
                      <div style={S.infoGrid}>
                        <div style={S.infoCell}>
                          <p style={S.infoLabel}>📍 Delivery Address</p>
                          <p style={S.infoVal}>{addr.name || "Customer"}</p>
                          <p style={S.infoMuted}>{addrStr}</p>
                        </div>
                        <div style={S.infoCell}>
                          <p style={S.infoLabel}>💳 Payment Method</p>
                          <p style={S.infoVal}>{order.paymentMethod || "—"}</p>
                        </div>
                        <div style={{ ...S.infoCell, borderRight: "none" }}>
                          <p style={S.infoLabel}>📅 Order Date</p>
                          <p style={S.infoVal}>
                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}