import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
void motion;
import { ArrowLeft, CreditCard, Truck, ShieldCheck, MapPin, X, Tag, CheckCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import axiosInstance from "../api/utils/axiosInstance";
import { useAuth } from "../context/AuthContext";

/* ── Poppins ── */
if (!document.head.querySelector("[href*='Poppins']")) {
  const link = document.createElement("link");
  link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

/* ── Keyframes ── */
if (!document.head.querySelector("#checkout-keyframes")) {
  const style = document.createElement("style");
  style.id = "checkout-keyframes";
  style.textContent = `
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    @keyframes spin    { to{transform:rotate(360deg)} }
  `;
  document.head.appendChild(style);
}

const S = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f0f4ff 0%, #fafbff 50%, #f5f0ff 100%)",
    fontFamily: "'Poppins', sans-serif",
    padding: "36px 20px 60px",
    boxSizing: "border-box",
  },
  inner: { maxWidth: 1080, margin: "0 auto" },

  /* Breadcrumb */
  breadcrumb: { display: "flex", alignItems: "center", gap: 8, marginBottom: 32 },
  backBtn: {
    display: "flex", alignItems: "center", gap: 5,
    color: "#6366f1", fontSize: 13, fontWeight: 600,
    background: "#ede9fe", border: "1px solid #c7d2fe",
    borderRadius: 8, padding: "5px 12px", cursor: "pointer",
    fontFamily: "'Poppins', sans-serif", transition: "all 0.15s",
  },
  breadSlash: { color: "#c7d2fe", fontSize: 13 },
  breadCurrent: { color: "#64748b", fontSize: 13, fontWeight: 500 },

  /* Grid */
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 20,
  },

  /* Card */
  card: {
    background: "#fff",
    borderRadius: 20,
    boxShadow: "0 4px 24px rgba(99,102,241,0.08)",
    border: "1px solid #ede9fe",
    padding: "28px 28px",
    boxSizing: "border-box",
  },

  /* Section header */
  sectionTitle: {
    fontSize: 17, fontWeight: 700, color: "#1e1b4b",
    margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8,
  },
  sectionIcon: {
    width: 32, height: 32, borderRadius: 8,
    background: "linear-gradient(135deg, #6366f1, #818cf8)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", flexShrink: 0,
  },

  divider: { height: 1, background: "#f1f5f9", margin: "20px 0" },

  /* Product row */
  productRow: { display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" },
  productImg: {
    width: 120, height: 120, borderRadius: 14,
    objectFit: "cover",
    border: "1.5px solid #ede9fe",
    boxShadow: "0 4px 14px rgba(99,102,241,0.1)",
    flexShrink: 0,
  },
  productInfo: { flex: 1, minWidth: 180 },
  productName: { fontSize: 16, fontWeight: 700, color: "#1e1b4b", margin: "0 0 4px" },
  productCat: { fontSize: 12, color: "#94a3b8", margin: "0 0 10px", fontWeight: 500 },
  strikePrice: { fontSize: 12, color: "#94a3b8", textDecoration: "line-through", margin: "0 0 2px" },
  offerPrice: { fontSize: 20, fontWeight: 800, color: "#6366f1", margin: "0 0 12px" },
  qtyRow: { display: "flex", alignItems: "center", gap: 10 },
  qtyLabel: { fontSize: 12, fontWeight: 600, color: "#64748b" },
  qtyControl: {
    display: "flex", alignItems: "center", gap: 0,
    border: "1.5px solid #e8e4fc", borderRadius: 10, overflow: "hidden",
  },
  qtyBtn: {
    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
    background: "#f5f3ff", border: "none", cursor: "pointer",
    color: "#6366f1", fontSize: 16, fontWeight: 700,
    fontFamily: "'Poppins', sans-serif", transition: "background 0.15s",
  },
  qtyNum: { padding: "0 14px", fontSize: 13, fontWeight: 600, color: "#1e1b4b" },

  /* Address */
  addAddressBtn: {
    display: "flex", alignItems: "center", gap: 8,
    border: "2px dashed #c7d2fe", borderRadius: 12,
    padding: "12px 20px", color: "#6366f1", fontSize: 13, fontWeight: 600,
    background: "#f8f7ff", cursor: "pointer",
    fontFamily: "'Poppins', sans-serif", transition: "all 0.2s",
  },
  savedAddressBox: {
    border: "1.5px solid #ede9fe", borderRadius: 14,
    padding: "14px 18px", background: "#fafaff",
    display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12,
  },
  savedAddressName: { fontSize: 13, fontWeight: 700, color: "#1e1b4b", margin: "0 0 4px" },
  savedAddressText: { fontSize: 12, color: "#64748b", lineHeight: 1.6, margin: 0 },
  editAddressBtn: {
    fontSize: 12, fontWeight: 600, color: "#6366f1",
    background: "#ede9fe", border: "1px solid #c7d2fe",
    borderRadius: 7, padding: "4px 10px", cursor: "pointer",
    fontFamily: "'Poppins', sans-serif", flexShrink: 0,
  },

  /* Payment options */
  paymentGrid: { display: "flex", flexDirection: "column", gap: 10 },
  payOption: (active) => ({
    display: "flex", alignItems: "center", gap: 12,
    border: `1.5px solid ${active ? "#6366f1" : "#e8e4fc"}`,
    background: active ? "#f5f3ff" : "#fff",
    borderRadius: 12, padding: "13px 16px",
    cursor: "pointer", transition: "all 0.2s",
    boxShadow: active ? "0 2px 12px rgba(99,102,241,0.12)" : "none",
  }),
  radioCircle: (active) => ({
    width: 18, height: 18, borderRadius: "50%",
    border: `2px solid ${active ? "#6366f1" : "#c7d2fe"}`,
    background: active ? "#6366f1" : "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, transition: "all 0.2s",
  }),
  radioDot: { width: 7, height: 7, borderRadius: "50%", background: "#fff" },
  payLabel: (active) => ({
    fontSize: 13, fontWeight: active ? 700 : 500,
    color: active ? "#1e1b4b" : "#64748b", flex: 1,
  }),
  payIcon: (active) => ({ color: active ? "#6366f1" : "#94a3b8", flexShrink: 0 }),

  /* ── RIGHT PANEL ── */
  summaryTitle: { fontSize: 17, fontWeight: 700, color: "#1e1b4b", margin: "0 0 20px" },

  priceRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0" },
  priceLabel: { fontSize: 13, color: "#64748b" },
  priceVal: { fontSize: 13, fontWeight: 600, color: "#1e1b4b" },
  freeShip: { fontSize: 13, fontWeight: 600, color: "#16a34a" },
  discountVal: { fontSize: 13, fontWeight: 700, color: "#16a34a" },

  totalRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "14px 0 0", marginTop: 4,
    borderTop: "1.5px solid #ede9fe",
  },
  totalLabel: { fontSize: 15, fontWeight: 700, color: "#1e1b4b" },
  totalVal: { fontSize: 20, fontWeight: 800, color: "#6366f1" },

  /* Coupon */
  couponLabel: { fontSize: 12, fontWeight: 700, color: "#6366f1", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.5 },
  couponRow: { display: "flex", gap: 8 },
  couponInput: {
    flex: 1, border: "1.5px solid #e8e4fc", borderRadius: 10,
    padding: "9px 12px", fontSize: 12, fontWeight: 600,
    color: "#1e1b4b", fontFamily: "'Poppins', sans-serif",
    background: "#fafaff", outline: "none", letterSpacing: 1,
    transition: "border 0.2s, box-shadow 0.2s",
  },
  applyBtn: (loading) => ({
    background: loading ? "#e8e4fc" : "linear-gradient(135deg, #6366f1, #818cf8)",
    border: "none", borderRadius: 10, padding: "9px 16px",
    fontSize: 12, fontWeight: 700, color: loading ? "#a5b4fc" : "#fff",
    cursor: loading ? "not-allowed" : "pointer",
    fontFamily: "'Poppins', sans-serif", transition: "all 0.2s",
    flexShrink: 0,
  }),
  appliedCouponBox: {
    background: "#f0fdf4", border: "1.5px solid #bbf7d0",
    borderRadius: 10, padding: "10px 14px",
    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
  },
  couponCode: { fontSize: 12, fontWeight: 700, color: "#15803d", margin: "0 0 2px" },
  couponDisc: { fontSize: 11, color: "#16a34a", margin: 0 },
  removeCoupon: {
    fontSize: 11, fontWeight: 600, color: "#be123c",
    background: "#fff1f2", border: "1px solid #fecdd3",
    borderRadius: 6, padding: "3px 9px", cursor: "pointer",
    fontFamily: "'Poppins', sans-serif", flexShrink: 0,
  },

  /* Place order btn */
  placeBtn: (loading) => ({
    width: "100%", marginTop: 20,
    background: loading ? "#e8e4fc" : "linear-gradient(135deg, #6366f1, #818cf8)",
    border: "none", borderRadius: 14, padding: "15px",
    fontSize: 14, fontWeight: 800,
    color: loading ? "#a5b4fc" : "#fff",
    cursor: loading ? "not-allowed" : "pointer",
    fontFamily: "'Poppins', sans-serif",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    boxShadow: loading ? "none" : "0 6px 20px rgba(99,102,241,0.4)",
    transition: "all 0.2s", letterSpacing: 0.3,
  }),

  /* Trust badges */
  trustRow: { display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" },
  trustBadge: {
    flex: "1 1 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
    background: "#f8f7ff", border: "1px solid #ede9fe",
    borderRadius: 8, padding: "7px 10px",
    fontSize: 10, fontWeight: 600, color: "#6366f1",
  },

  /* ── ADDRESS MODAL ── */
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(15,10,40,0.45)", backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 100, padding: 16,
    fontFamily: "'Poppins', sans-serif",
  },
  modal: {
    background: "#fff", borderRadius: 22,
    boxShadow: "0 20px 60px rgba(99,102,241,0.18)",
    border: "1px solid #ede9fe",
    width: "100%", maxWidth: 440, maxHeight: "92vh", overflowY: "auto",
  },
  modalHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 22px 16px",
    borderBottom: "1px solid #ede9fe",
    background: "linear-gradient(135deg, #f5f3ff, #eef2ff)",
    borderRadius: "22px 22px 0 0",
  },
  modalHeaderLeft: { display: "flex", alignItems: "center", gap: 10 },
  modalIcon: {
    width: 34, height: 34, borderRadius: 9,
    background: "linear-gradient(135deg, #6366f1, #818cf8)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 3px 10px rgba(99,102,241,0.3)",
  },
  modalTitle: { fontSize: 15, fontWeight: 700, color: "#1e1b4b", margin: 0 },
  modalSub: { fontSize: 10, color: "#a5b4fc", fontWeight: 500, margin: "2px 0 0" },
  modalCloseBtn: {
    width: 30, height: 30, borderRadius: 8,
    border: "1px solid #e8e4fc", background: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: "#94a3b8", transition: "all 0.15s",
  },
  modalBody: { padding: "20px 22px 22px" },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 10, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: 0.7, display: "block", marginBottom: 5 },
  inputField: {
    width: "100%", border: "1.5px solid #e8e4fc", borderRadius: 10,
    padding: "10px 12px", fontSize: 13, color: "#1e1b4b",
    fontFamily: "'Poppins', sans-serif", background: "#fafaff",
    outline: "none", boxSizing: "border-box", transition: "border 0.2s, box-shadow 0.2s",
  },
  inputGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 },
  saveBtn: {
    width: "100%", marginTop: 4,
    background: "linear-gradient(135deg, #6366f1, #818cf8)",
    border: "none", borderRadius: 12, padding: "12px",
    fontSize: 13, fontWeight: 700, color: "#fff",
    cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
    transition: "all 0.2s",
  },
};

const INPUT_FIELDS = [
  { key: "name",    label: "Full Name",      placeholder: "e.g. Ravi Kumar",    span: 2 },
  { key: "mobile",  label: "Mobile Number",  placeholder: "10-digit number",    span: 2 },
  { key: "house",   label: "House / Flat No", placeholder: "Door no., Block",   span: 1 },
  { key: "area",    label: "Road / Area",    placeholder: "Street, Locality",    span: 1 },
  { key: "city",    label: "City",           placeholder: "e.g. Chennai",        span: 1 },
  { key: "pincode", label: "Pincode",        placeholder: "6-digit code",        span: 1 },
];

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const product  = useMemo(() => location.state?.product || location.state?.dog || location.state?.cat, [location.state]);
  const cartItems = useMemo(() => location.state?.cartItems || [], [location.state]);

  const [quantity, setQuantity]               = useState(1);
  const [paymentMethod, setPaymentMethod]     = useState("cod");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [address, setAddress]                 = useState({ name:"", mobile:"", house:"", area:"", city:"", pincode:"" });
  const [savedAddress, setSavedAddress]       = useState(null);
  const [loading, setLoading]                 = useState(false);
  const [couponCode, setCouponCode]           = useState("");
  const [appliedCoupon, setAppliedCoupon]     = useState(null);
  const [discountAmount, setDiscountAmount]   = useState(0);
  const [couponLoading, setCouponLoading]     = useState(false);

  const totalPrice = useMemo(() => {
    if (cartItems.length > 0) return cartItems.reduce((s, i) => s + (i.offerPrice || i.price) * (i.quantity || 1), 0);
    if (!product) return 0;
    return (product.offerPrice || product.price) * quantity;
  }, [product, quantity, cartItems]);

  const finalTotal = Math.max(0, totalPrice - discountAmount);
  const displayProduct = product || (cartItems.length > 0 ? cartItems[0] : null);

  useEffect(() => {
    if (!product && cartItems.length === 0) { toast.error("No products selected 🐾"); navigate(-1); }
  }, [product, cartItems, navigate]);

  const handleSaveAddress = () => {
    const { name, mobile, house, area, city, pincode } = address;
    if (!name || !mobile || !house || !area || !city || !pincode) { toast.error("Please fill all address fields 🏠"); return; }
    setSavedAddress(address); setShowAddressModal(false); toast.success("Address saved ✅");
  };

  const createOrderInDB = async (paymentId, method, razorpayOrderId = null) => {
    try {
      setLoading(true);
      const orderItems = cartItems.length > 0
        ? cartItems.map(i => ({ petId: i._id || i.id, quantity: i.quantity || 1 }))
        : [{ petId: product._id || product.id, quantity }];
      const { data } = await axiosInstance.post("/orders/place", {
        items: orderItems, totalPrice, product: cartItems.length > 0 ? cartItems : product,
        paymentId, paymentMethod: method, quantity: cartItems.length > 0 ? undefined : quantity,
        address: savedAddress, razorpayOrderId,
        ...(cartItems.length === 0 && { petId: product._id || product.id }),
      });
      if (data.success) { toast.success("Order saved ✅"); return data.order; }
      else { toast.error(data.message || "Failed to save order ❌"); return null; }
    } catch { toast.error("Server error while saving order 🐾"); return null; }
    finally { setLoading(false); }
  };

  const loadRazorpayScript = () => new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true); s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  const handleRazorpayPayment = async () => {
    if (!savedAddress) { toast.error("Please add your delivery address 🏠"); return; }
    const loaded = await loadRazorpayScript();
    if (!loaded) { toast.error("Razorpay SDK failed to load ❌"); return; }
    try {
      const { data } = await axios.post("https://pet-pal-x74f.onrender.com/api/payments/create-order", { amount: totalPrice });
      if (!data.success) { toast.error("Unable to create Razorpay order ❌"); return; }
      const dbOrder = await createOrderInDB(null, "Razorpay", data.order.id);
      if (!dbOrder) return;
      const rzp = new window.Razorpay({
        key: data.key, amount: data.order.amount, currency: data.order.currency,
        name: "Pet World 🐾", description: `Purchase of ${product?.name || "Items"}`,
        image: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const verify = await axios.post("http://localhost:5008/api/payments/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
            if (verify.data.success) {
              toast.success("Payment Verified 🎉");
              await axios.put("http://localhost:5008/api/orders/mark-paid", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
              }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
              navigate("/orders");
            } else toast.error("Payment Verification Failed ❌");
          } catch { toast.error("Server verification failed 🚫"); }
        },
        prefill: { name: savedAddress.name, email: user?.email || "customer@example.com", contact: savedAddress.mobile },
        notes: { address: `${savedAddress.house}, ${savedAddress.area}, ${savedAddress.city} - ${savedAddress.pincode}` },
        theme: { color: "#6366f1" },
      });
      rzp.open(); rzp.on("payment.failed", () => toast.error("Payment Failed ❌"));
    } catch { toast.error("Unable to initiate payment 🚫"); }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) { toast.error("Please enter a coupon code"); return; }
    setCouponLoading(true);
    try {
      const { data } = await axios.get("https://pet-pal-x74f.onrender.com/api/offers");
      if (!data.success || !data.offer) { toast.error("No active offers available"); return; }
      const offer = data.offer;
      if (!offer.isActive) { toast.error("This offer is not currently active"); return; }
      if (offer.code.toUpperCase() !== couponCode.toUpperCase()) { toast.error("Invalid coupon code ❌"); return; }
      if (totalPrice < offer.minOrderAmount) { toast.error(`Minimum order ₹${offer.minOrderAmount} required`); return; }
      setDiscountAmount((totalPrice * offer.discount) / 100);
      setAppliedCoupon(offer); setCouponCode("");
      toast.success(`🎉 ${offer.discount}% off applied!`);
    } catch { toast.error("Failed to validate coupon"); }
    finally { setCouponLoading(false); }
  };

  const handleRemoveCoupon = () => { setAppliedCoupon(null); setDiscountAmount(0); setCouponCode(""); toast.success("Coupon removed"); };

  const handlePlaceOrder = async () => {
    if (!savedAddress) { toast.error("Please add your delivery address 🏠"); return; }
    if (paymentMethod === "cod") { await createOrderInDB(null, "Cash on Delivery"); toast.success("Order placed! 🎉"); navigate("/orders"); }
    else handleRazorpayPayment();
  };

  if (!product && cartItems.length === 0) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: S.page.background, fontFamily: S.page.fontFamily }}>
      <p style={{ color: "#64748b", fontSize: 15 }}>No products selected. Redirecting…</p>
    </div>
  );

  return (
    <div style={S.page}>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: "'Poppins', sans-serif", fontSize: 13 } }} />
      <div style={S.inner}>

        {/* ── Breadcrumb ── */}
        <div style={S.breadcrumb}>
          <button style={S.backBtn} onClick={() => navigate(-1)}
            onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg,#6366f1,#818cf8)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#ede9fe"; e.currentTarget.style.color = "#6366f1"; }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <span style={S.breadSlash}>/</span>
          <span style={S.breadCurrent}>Checkout</span>
        </div>

        {/* ── Responsive grid ── */}
        <div style={{ ...S.grid, gridTemplateColumns: "1fr" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,340px)", gap: 20, alignItems: "start" }}
            className="checkout-grid">
            <style>{`@media(max-width:840px){.checkout-grid{grid-template-columns:1fr !important}}`}</style>

            {/* ── LEFT ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

              {/* Product card */}
              <div style={S.card}>
                <p style={S.sectionTitle}>
                  <span style={S.sectionIcon}>🛒</span> Order Summary
                </p>

                {displayProduct && (
                  <div style={S.productRow}>
                    <img
                      src={displayProduct.image || "https://cdn-icons-png.flaticon.com/512/1995/1995640.png"}
                      alt={displayProduct.name}
                      style={S.productImg}
                    />
                    <div style={S.productInfo}>
                      <p style={S.productName}>{displayProduct.name}</p>
                      <p style={S.productCat}>{displayProduct.category}</p>
                      {displayProduct.offerPrice ? (
                        <>
                          <p style={S.strikePrice}>₹{displayProduct.price?.toLocaleString()}</p>
                          <p style={S.offerPrice}>₹{displayProduct.offerPrice?.toLocaleString()}</p>
                        </>
                      ) : (
                        <p style={S.offerPrice}>₹{displayProduct.price?.toLocaleString()}</p>
                      )}
                      <div style={S.qtyRow}>
                        <span style={S.qtyLabel}>Qty</span>
                        <div style={S.qtyControl}>
                          <button style={S.qtyBtn} onClick={() => setQuantity(q => Math.max(1, q - 1))}
                            onMouseEnter={e => e.currentTarget.style.background = "#ede9fe"}
                            onMouseLeave={e => e.currentTarget.style.background = "#f5f3ff"}>−</button>
                          <span style={S.qtyNum}>{quantity}</span>
                          <button style={S.qtyBtn} onClick={() => setQuantity(q => q + 1)}
                            onMouseEnter={e => e.currentTarget.style.background = "#ede9fe"}
                            onMouseLeave={e => e.currentTarget.style.background = "#f5f3ff"}>＋</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Address card */}
              <div style={{ ...S.card, marginTop: 16 }}>
                <p style={S.sectionTitle}>
                  <span style={S.sectionIcon}><MapPin size={15} /></span> Delivery Address
                </p>
                {savedAddress ? (
                  <div style={S.savedAddressBox}>
                    <div>
                      <p style={S.savedAddressName}>{savedAddress.name} · {savedAddress.mobile}</p>
                      <p style={S.savedAddressText}>{savedAddress.house}, {savedAddress.area}<br />{savedAddress.city} — {savedAddress.pincode}</p>
                    </div>
                    <button style={S.editAddressBtn} onClick={() => setShowAddressModal(true)}
                      onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg,#6366f1,#818cf8)"; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#ede9fe"; e.currentTarget.style.color = "#6366f1"; }}>
                      Edit
                    </button>
                  </div>
                ) : (
                  <motion.button style={S.addAddressBtn} whileTap={{ scale: 0.97 }} onClick={() => setShowAddressModal(true)}
                    onMouseEnter={e => { e.currentTarget.style.background = "#ede9fe"; e.currentTarget.style.borderColor = "#6366f1"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#f8f7ff"; e.currentTarget.style.borderColor = "#c7d2fe"; }}>
                    <MapPin size={15} /> + Add Delivery Address
                  </motion.button>
                )}
              </div>

              {/* Payment card */}
              <div style={{ ...S.card, marginTop: 16 }}>
                <p style={S.sectionTitle}>
                  <span style={S.sectionIcon}><CreditCard size={15} /></span> Payment Method
                </p>
                <div style={S.paymentGrid}>
                  {[
                    { id: "cod",  icon: <Truck size={16} />,       label: "Cash on Delivery",              sub: "Pay when your pet arrives" },
                    { id: "card", icon: <CreditCard size={16} />,  label: "Credit / Debit Card (Razorpay)", sub: "Secure online payment" },
                  ].map(opt => (
                    <label key={opt.id} style={S.payOption(paymentMethod === opt.id)}>
                      <input type="radio" name="payment" value={opt.id} checked={paymentMethod === opt.id}
                        onChange={() => setPaymentMethod(opt.id)} style={{ display: "none" }} />
                      <div style={S.radioCircle(paymentMethod === opt.id)}>
                        {paymentMethod === opt.id && <div style={S.radioDot} />}
                      </div>
                      <span style={S.payIcon(paymentMethod === opt.id)}>{opt.icon}</span>
                      <div>
                        <p style={{ ...S.payLabel(paymentMethod === opt.id), margin: "0 0 2px" }}>{opt.label}</p>
                        <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>{opt.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── RIGHT ── */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
              <div style={S.card}>
                <p style={S.summaryTitle}>Price Details</p>

                {/* Line items */}
                <div style={S.priceRow}><span style={S.priceLabel}>Price</span><span style={S.priceVal}>₹{(displayProduct?.offerPrice || displayProduct?.price)?.toLocaleString()}</span></div>
                <div style={S.priceRow}><span style={S.priceLabel}>Quantity</span><span style={S.priceVal}>× {quantity}</span></div>
                <div style={S.priceRow}><span style={S.priceLabel}>Shipping</span><span style={S.freeShip}>🚚 Free</span></div>

                <div style={S.divider} />

                {/* Coupon */}
                <p style={S.couponLabel}><Tag size={11} style={{ display: "inline", marginRight: 4 }} />Apply Coupon</p>
                {appliedCoupon ? (
                  <div style={S.appliedCouponBox}>
                    <div>
                      <p style={S.couponCode}>✅ {appliedCoupon.code}</p>
                      <p style={S.couponDisc}>{appliedCoupon.discount}% off applied</p>
                    </div>
                    <button style={S.removeCoupon} onClick={handleRemoveCoupon}>Remove</button>
                  </div>
                ) : (
                  <div style={S.couponRow}>
                    <input style={S.couponInput} type="text" placeholder="ENTER CODE"
                      value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === "Enter" && handleApplyCoupon()}
                      onFocus={e => { e.target.style.border = "1.5px solid #6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                      onBlur={e => { e.target.style.border = "1.5px solid #e8e4fc"; e.target.style.boxShadow = "none"; }} />
                    <button style={S.applyBtn(couponLoading)} onClick={handleApplyCoupon} disabled={couponLoading}>
                      {couponLoading ? <svg width="13" height="13" viewBox="0 0 24 24" style={{ animation: "spin 0.8s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="#a5b4fc" strokeWidth="4" fill="none"/><path fill="#6366f1" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> : "Apply"}
                    </button>
                  </div>
                )}

                <div style={S.divider} />

                {/* Subtotal / Discount / Total */}
                <div style={S.priceRow}><span style={S.priceLabel}>Subtotal</span><span style={S.priceVal}>₹{totalPrice.toLocaleString()}</span></div>
                {discountAmount > 0 && (
                  <div style={S.priceRow}>
                    <span style={S.priceLabel}>Discount ({appliedCoupon?.discount}%)</span>
                    <span style={S.discountVal}>− ₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div style={S.totalRow}>
                  <span style={S.totalLabel}>Total</span>
                  <span style={S.totalVal}>₹{finalTotal.toLocaleString()}</span>
                </div>

                {/* CTA */}
                <motion.button
                  style={S.placeBtn(loading)}
                  whileHover={!loading ? { scale: 1.02, boxShadow: "0 10px 28px rgba(99,102,241,0.5)" } : {}}
                  whileTap={!loading ? { scale: 0.97 } : {}}
                  onClick={handlePlaceOrder} disabled={loading}
                >
                  {loading
                    ? <><svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: "spin 0.8s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4" fill="none"/><path fill="#fff" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> Processing…</>
                    : <><ShieldCheck size={17} /> Place Order</>
                  }
                </motion.button>

                {/* Trust badges */}
                <div style={S.trustRow}>
                  {[["🔒","Secure"], ["🚚","Free Ship"], ["↩️","Easy Return"]].map(([icon, label]) => (
                    <div key={label} style={S.trustBadge}>{icon} {label}</div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Address Modal ── */}
      <AnimatePresence>
        {showAddressModal && (
          <motion.div style={S.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div style={S.modal}
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.34, 1.2, 0.64, 1] }}
            >
              <div style={S.modalHeader}>
                <div style={S.modalHeaderLeft}>
                  <div style={S.modalIcon}><MapPin size={15} color="#fff" /></div>
                  <div>
                    <p style={S.modalTitle}>Delivery Address</p>
                    <p style={S.modalSub}>Where should we deliver?</p>
                  </div>
                </div>
                <button style={S.modalCloseBtn} onClick={() => setShowAddressModal(false)}
                  onMouseEnter={e => { e.currentTarget.style.background = "#fff1f2"; e.currentTarget.style.color = "#be123c"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#94a3b8"; }}>
                  <X size={14} />
                </button>
              </div>

              <div style={S.modalBody}>
                {/* Full-width fields */}
                {INPUT_FIELDS.filter(f => f.span === 2).map(f => (
                  <div key={f.key} style={S.inputGroup}>
                    <label style={S.inputLabel}>{f.label}</label>
                    <input style={S.inputField} placeholder={f.placeholder}
                      value={address[f.key]} onChange={e => setAddress({ ...address, [f.key]: e.target.value })}
                      onFocus={e => { e.target.style.border = "1.5px solid #6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; e.target.style.background = "#fff"; }}
                      onBlur={e => { e.target.style.border = "1.5px solid #e8e4fc"; e.target.style.boxShadow = "none"; e.target.style.background = "#fafaff"; }} />
                  </div>
                ))}

                {/* Half-width grid */}
                <div style={S.inputGrid}>
                  {INPUT_FIELDS.filter(f => f.span === 1).map(f => (
                    <div key={f.key}>
                      <label style={S.inputLabel}>{f.label}</label>
                      <input style={S.inputField} placeholder={f.placeholder}
                        value={address[f.key]} onChange={e => setAddress({ ...address, [f.key]: e.target.value })}
                        onFocus={e => { e.target.style.border = "1.5px solid #6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; e.target.style.background = "#fff"; }}
                        onBlur={e => { e.target.style.border = "1.5px solid #e8e4fc"; e.target.style.boxShadow = "none"; e.target.style.background = "#fafaff"; }} />
                    </div>
                  ))}
                </div>

                <motion.button style={S.saveBtn}
                  whileHover={{ boxShadow: "0 8px 24px rgba(99,102,241,0.45)", transform: "translateY(-1px)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSaveAddress}>
                  💾 Save Address
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}