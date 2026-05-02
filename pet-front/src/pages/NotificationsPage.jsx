import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Trash2, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
if (!document.head.querySelector("#notif-keyframes")) {
  const style = document.createElement("style");
  style.id = "notif-keyframes";
  style.textContent = `
    @keyframes notif-spin    { to { transform: rotate(360deg); } }
    @keyframes notif-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    @keyframes notif-ping    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.6)} }
  `;
  document.head.appendChild(style);
}

/* ── Type config ── */
const TYPE_CONFIG = {
  order:    { icon: CheckCircle, bg: "#f0fdf4", iconColor: "#16a34a", border: "#bbf7d0", dot: "#22c55e",  label: "Order"    },
  wishlist: { icon: AlertCircle, bg: "#fdf4ff", iconColor: "#9333ea", border: "#e9d5ff", dot: "#a855f7",  label: "Wishlist" },
  info:     { icon: Info,        bg: "#eff6ff", iconColor: "#2563eb", border: "#bfdbfe", dot: "#3b82f6",  label: "Info"     },
  default:  { icon: Bell,        bg: "#f5f3ff", iconColor: "#6366f1", border: "#c7d2fe", dot: "#818cf8",  label: "Alert"    },
};
const getType = (t) => TYPE_CONFIG[t] || TYPE_CONFIG.default;

const S = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f0f4ff 0%, #fafaff 50%, #f5f0ff 100%)",
    fontFamily: "'Poppins', sans-serif",
    padding: "40px 20px 60px",
    boxSizing: "border-box",
  },
  inner: { maxWidth: 680, margin: "0 auto" },

  /* Header */
  header: {
    display: "flex", alignItems: "flex-start",
    justifyContent: "space-between", gap: 12,
    marginBottom: 32,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  headerIcon: {
    width: 50, height: 50, borderRadius: 14,
    background: "linear-gradient(135deg, #6366f1, #818cf8)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 6px 18px rgba(99,102,241,0.35)", flexShrink: 0,
  },
  headerTitle: { fontSize: 24, fontWeight: 800, color: "#1e1b4b", margin: "0 0 3px", letterSpacing: "-0.4px" },
  headerSub: { fontSize: 12, color: "#94a3b8", margin: 0, fontWeight: 400 },

  /* Stats chips */
  statsRow: { display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" },
  statChip: (active) => ({
    display: "inline-flex", alignItems: "center", gap: 5,
    background: active ? "linear-gradient(135deg, #6366f1, #818cf8)" : "#fff",
    color: active ? "#fff" : "#6366f1",
    border: `1.5px solid ${active ? "transparent" : "#e8e4fc"}`,
    borderRadius: 20, padding: "5px 13px",
    fontSize: 11, fontWeight: 700,
    boxShadow: active ? "0 3px 10px rgba(99,102,241,0.3)" : "none",
  }),
  statDot: (color) => ({
    width: 6, height: 6, borderRadius: "50%", background: color,
    animation: "notif-ping 2s ease-in-out infinite",
  }),

  /* Clear all btn */
  clearBtn: {
    display: "flex", alignItems: "center", gap: 6,
    background: "#fff1f2", border: "1.5px solid #fecdd3",
    borderRadius: 10, padding: "8px 14px",
    fontSize: 12, fontWeight: 700, color: "#be123c",
    cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    transition: "all 0.15s", flexShrink: 0,
  },

  /* Empty state */
  empty: {
    background: "#fff", borderRadius: 22,
    border: "1.5px solid #ede9fe",
    boxShadow: "0 4px 24px rgba(99,102,241,0.07)",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "64px 24px", textAlign: "center",
  },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 20,
    background: "linear-gradient(135deg, #f5f3ff, #eef2ff)",
    border: "1.5px solid #e8e4fc",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: { fontSize: 18, fontWeight: 700, color: "#1e1b4b", margin: "0 0 8px" },
  emptySubtitle: { fontSize: 13, color: "#94a3b8", margin: 0, maxWidth: 280, lineHeight: 1.6 },

  /* Notification list */
  list: { display: "flex", flexDirection: "column", gap: 10 },

  /* Notification card */
  card: (read, typeCfg) => ({
    display: "flex", alignItems: "center",
    gap: 14, padding: "14px 16px",
    borderRadius: 16,
    background: read ? "#fff" : typeCfg.bg,
    border: `1.5px solid ${read ? "#f1f5f9" : typeCfg.border}`,
    boxShadow: read ? "0 1px 6px rgba(99,102,241,0.05)" : `0 2px 14px ${typeCfg.border}88`,
    transition: "all 0.2s",
    position: "relative", overflow: "hidden",
  }),

  /* Unread left accent bar */
  accentBar: (typeCfg) => ({
    position: "absolute", left: 0, top: 0, bottom: 0,
    width: 3, borderRadius: "3px 0 0 3px",
    background: typeCfg.dot,
  }),

  /* Type icon box */
  iconBox: (typeCfg, read) => ({
    width: 38, height: 38, borderRadius: 10,
    background: read ? "#f8f7ff" : typeCfg.bg,
    border: `1.5px solid ${read ? "#ede9fe" : typeCfg.border}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  }),

  /* Content */
  cardBody: { flex: 1, minWidth: 0 },
  cardTopRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 3 },
  typeBadge: (typeCfg) => ({
    fontSize: 9, fontWeight: 700,
    color: typeCfg.iconColor,
    background: typeCfg.bg,
    border: `1px solid ${typeCfg.border}`,
    borderRadius: 6, padding: "1px 7px",
    textTransform: "uppercase", letterSpacing: 0.6,
  }),
  unreadDot: (typeCfg) => ({
    width: 6, height: 6, borderRadius: "50%",
    background: typeCfg.dot, flexShrink: 0,
    animation: "notif-ping 2.5s ease-in-out infinite",
  }),
  cardMsg: (read) => ({
    fontSize: 13, fontWeight: read ? 400 : 600,
    color: read ? "#64748b" : "#1e1b4b",
    margin: 0, lineHeight: 1.5,
    overflow: "hidden", textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
  cardTime: {
    fontSize: 10, color: "#a5b4fc", margin: "4px 0 0",
    fontWeight: 500,
  },

  /* Actions */
  actions: { display: "flex", alignItems: "center", gap: 6, flexShrink: 0 },
  actionBtn: (hoverBg) => ({
    width: 32, height: 32, borderRadius: 8,
    border: "1.5px solid #e8e4fc", background: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", transition: "all 0.15s",
  }),

  /* Skeleton */
  skeleton: {
    display: "flex", flexDirection: "column", gap: 10,
  },
  skeletonCard: {
    background: "#fff", borderRadius: 16,
    border: "1.5px solid #f1f5f9",
    padding: "14px 16px", display: "flex", gap: 14, alignItems: "center",
  },
  skeletonCircle: {
    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
    background: "linear-gradient(90deg, #f0f0ff 25%, #e8e4fc 50%, #f0f0ff 75%)",
    backgroundSize: "200% 100%", animation: "notif-shimmer 1.4s infinite",
  },
  skeletonLine: (w) => ({
    height: 10, borderRadius: 6, marginBottom: 8,
    background: "linear-gradient(90deg, #f0f0ff 25%, #e8e4fc 50%, #f0f0ff 75%)",
    backgroundSize: "200% 100%", animation: "notif-shimmer 1.4s infinite",
    width: w,
  }),

  /* Spinner */
  spinnerPage: {
    minHeight: "100vh", display: "flex",
    alignItems: "center", justifyContent: "center",
    background: "linear-gradient(135deg, #f0f4ff 0%, #fafaff 50%, #f5f0ff 100%)",
    fontFamily: "'Poppins', sans-serif",
  },
  spinnerBox: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
    background: "#fff", borderRadius: 20, padding: "32px 40px",
    border: "1px solid #ede9fe", boxShadow: "0 8px 32px rgba(99,102,241,0.1)",
  },
  spinner: {
    width: 40, height: 40,
    border: "4px solid #e0e7ff",
    borderTop: "4px solid #6366f1",
    borderRadius: "50%",
    animation: "notif-spin 0.8s linear infinite",
  },
  spinnerText: { fontSize: 13, fontWeight: 600, color: "#6366f1", margin: 0 },
};

const formatTime = (ts) => {
  const d = new Date(ts);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60)   return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
};

const SkeletonCard = () => (
  <div style={S.skeletonCard}>
    <div style={S.skeletonCircle} />
    <div style={{ flex: 1 }}>
      <div style={S.skeletonLine("60%")} />
      <div style={S.skeletonLine("40%")} />
    </div>
  </div>
);

export default function NotificationsPage() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    axiosInstance.get("/notifications")
      .then(res => { setNotifications(res.data?.notifications || []); })
      .catch(() => {
        setNotifications([
          { id: 1, type: "order",    message: "Your order #12345 has been shipped!",        timestamp: new Date(),                    read: false },
          { id: 2, type: "wishlist", message: "🎉 An item in your wishlist is now on sale!", timestamp: new Date(Date.now()-3600000),  read: false },
          { id: 3, type: "info",     message: "📢 New pet food collection available now",    timestamp: new Date(Date.now()-86400000), read: true  },
        ]);
      })
      .finally(() => setLoading(false));
  }, [user, navigate]);

  useEffect(() => {
    const handler = (e) => {
      const n = e.detail;
      setNotifications(prev => {
        if (!n?._id || prev.some(i => i._id === n._id)) return prev;
        return [n, ...prev];
      });
    };
    window.addEventListener(NOTIFICATION_EVENT, handler);
    return () => window.removeEventListener(NOTIFICATION_EVENT, handler);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => (n._id || n.id) === id ? { ...n, read: true } : n));
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => (n._id || n.id) !== id));
      toast.success("Notification deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const handleDeleteAll = () => {
    if (!window.confirm("Delete all notifications?")) return;
    axiosInstance.delete("/notifications")
      .then(() => { setNotifications([]); toast.success("All notifications cleared"); })
      .catch(() => toast.error("Failed to delete notifications"));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return (
    <div style={S.spinnerPage}>
      <div style={S.spinnerBox}>
        <div style={S.spinner} />
        <p style={S.spinnerText}>Loading notifications…</p>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.inner}>

        {/* ── Header ── */}
        <motion.div style={S.header} initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div style={S.headerLeft}>
            <div style={S.headerIcon}>
              <Bell size={22} color="#fff" />
            </div>
            <div>
              <h1 style={S.headerTitle}>Notifications</h1>
              <p style={S.headerSub}>Stay updated with your latest activity</p>
            </div>
          </div>

          {notifications.length > 0 && (
            <motion.button
              style={S.clearBtn}
              whileHover={{ background: "#ffe4e6", boxShadow: "0 4px 12px rgba(190,18,60,0.15)" }}
              whileTap={{ scale: 0.96 }}
              onClick={handleDeleteAll}
            >
              <Trash2 size={13} /> Clear All
            </motion.button>
          )}
        </motion.div>

        {/* ── Stats chips ── */}
        {notifications.length > 0 && (
          <motion.div style={S.statsRow} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <div style={S.statChip(false)}>
              <Bell size={11} /> {notifications.length} Total
            </div>
            {unreadCount > 0 && (
              <div style={S.statChip(true)}>
                <span style={S.statDot("#fff")} /> {unreadCount} Unread
              </div>
            )}
            <div style={{ ...S.statChip(false), color: "#16a34a", borderColor: "#bbf7d0", background: "#f0fdf4" }}>
              <CheckCircle size={11} /> {notifications.length - unreadCount} Read
            </div>
          </motion.div>
        )}

        {/* ── Empty state ── */}
        {notifications.length === 0 ? (
          <motion.div style={S.empty} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
            <div style={S.emptyIcon}>
              <Bell size={28} color="#c7d2fe" />
            </div>
            <p style={S.emptyTitle}>All caught up!</p>
            <p style={S.emptySubtitle}>No notifications yet. We'll let you know when something happens.</p>
          </motion.div>

        ) : (
          /* ── Notification list ── */
          <motion.div style={S.list} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <AnimatePresence>
              {notifications.map((notif, idx) => {
                const id      = notif._id || notif.id;
                const typeCfg = getType(notif.type);
                const IconComp = typeCfg.icon;

                return (
                  <motion.div
                    key={id}
                    style={S.card(notif.read, typeCfg)}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                    transition={{ delay: idx * 0.06, duration: 0.35 }}
                    whileHover={{ y: -1, boxShadow: `0 6px 20px ${typeCfg.border}cc` }}
                  >
                    {/* Unread accent bar */}
                    {!notif.read && <div style={S.accentBar(typeCfg)} />}

                    {/* Icon */}
                    <div style={S.iconBox(typeCfg, notif.read)}>
                      <IconComp size={17} color={typeCfg.iconColor} />
                    </div>

                    {/* Content */}
                    <div style={S.cardBody}>
                      <div style={S.cardTopRow}>
                        <span style={S.typeBadge(typeCfg)}>{typeCfg.label}</span>
                        {!notif.read && <span style={S.unreadDot(typeCfg)} />}
                      </div>
                      <p style={S.cardMsg(notif.read)} title={notif.message}>{notif.message}</p>
                      <p style={S.cardTime}>{formatTime(notif.createdAt || notif.timestamp)}</p>
                    </div>

                    {/* Actions */}
                    <div style={S.actions}>
                      {!notif.read && (
                        <motion.button
                          style={S.actionBtn()}
                          title="Mark as read"
                          whileHover={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => handleMarkAsRead(id)}
                        >
                          <CheckCircle size={15} color="#16a34a" />
                        </motion.button>
                      )}
                      <motion.button
                        style={S.actionBtn()}
                        title="Delete"
                        whileHover={{ background: "#fff1f2", borderColor: "#fecdd3" }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => handleDelete(id)}
                      >
                        <Trash2 size={15} color="#be123c" />
                      </motion.button>
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