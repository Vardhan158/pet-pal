// src/pages/CartPage.jsx
import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { X, MapPin, ShoppingBag, Trash2, ChevronDown, Tag, CheckCircle } from "lucide-react";
import axiosInstance from "../api/utils/axiosInstance";

void motion;

/* ─── Design tokens ────────────────────────────────────── */
const T = {
  bg:     "#F7F7FC",
  card:   "#FFFFFF",
  border: "#F0EFF8",
  muted:  "#9CA3AF",
  head:   "#1E1B4B",
  accent: "#4F46E5",
  font:   "'Poppins', sans-serif",
};

/* ─── Reusable field label ─────────────────────────────── */
const FieldLabel = ({ children }) => (
  <p style={{ fontSize:10, fontWeight:600, color:T.muted, textTransform:"uppercase", letterSpacing:"0.06em", margin:"0 0 5px", fontFamily:T.font }}>
    {children}
  </p>
);

/* ─── Input style ──────────────────────────────────────── */
const inputStyle = {
  width:"100%", padding:"9px 12px", border:`1px solid ${T.border}`,
  borderRadius:10, fontSize:13, fontFamily:T.font, color:T.head,
  background:T.card, outline:"none", boxSizing:"border-box",
};

export default function CartPage() {
  const { cart, updateQuantity, deleteItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [address, setAddress]       = useState({ name:"", mobile:"", house:"", area:"", city:"", pincode:"" });
  const [savedAddress, setSavedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [loading, setLoading]       = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponLoading, setCouponLoading]   = useState(false);

  const cartItems = Object.entries(cart || {}).map(([petId, item]) => ({ ...item, petId }));
  const totalPrice   = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax          = (totalPrice * 0.09).toFixed(2);
  const totalAmount  = (totalPrice + parseFloat(tax)).toFixed(2);
  const finalTotal   = (parseFloat(totalAmount) - discountAmount).toFixed(2);

  /* ── Address ── */
  const handleSaveAddress = () => {
    const { name, mobile, house, area, city, pincode } = address;
    if (!name || !mobile || !house || !area || !city || !pincode) {
      toast.error("Please fill all address fields");
      return;
    }
    setSavedAddress(address);
    setShowAddressModal(false);
    setAddress({ name:"", mobile:"", house:"", area:"", city:"", pincode:"" });
    toast.success("Address saved");
  };

  /* ── Coupon ── */
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) { toast.error("Please enter a coupon code"); return; }
    setCouponLoading(true);
    try {
      const { data } = await axiosInstance.get("/offers");
      if (!data.success || !data.offer) { toast.error("No active offers available"); return; }
      const offer = data.offer;
      if (!offer.isActive) { toast.error("This offer is not active"); return; }
      if (offer.code.toUpperCase() !== couponCode.toUpperCase()) { toast.error("Invalid coupon code"); return; }
      if (totalPrice < offer.minOrderAmount) { toast.error(`Min. order ₹${offer.minOrderAmount} required`); return; }
      setDiscountAmount((totalPrice * offer.discount) / 100);
      setAppliedCoupon(offer);
      setCouponCode("");
      toast.success(`${offer.discount}% discount applied!`);
    } catch { toast.error("Failed to validate coupon"); }
    finally { setCouponLoading(false); }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
  };

  /* ── COD ── */
  const handlePlaceOrderCOD = async () => {
    if (!cartItems.length) { toast.error("Your cart is empty"); return; }
    if (!savedAddress)     { toast.error("Please add a delivery address"); return; }
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/orders/place", {
        items: cartItems.map(i => ({ petId: i.petId, quantity: i.quantity })),
        totalPrice: finalTotal, paymentMethod: "Cash on Delivery", address: savedAddress,
      });
      if (data.success) {
        clearCart();
        toast.success("Order placed successfully!");
        setTimeout(() => navigate("/orders"), 1200);
      } else toast.error(data.message || "Failed to place order");
    } catch { toast.error("Failed to place order"); }
    finally { setLoading(false); }
  };

  /* ── Razorpay ── */
  const loadRazorpayScript = () => new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true); s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  const handleRazorpayPayment = async () => {
    if (!savedAddress) { toast.error("Please add a delivery address"); return; }
    const loaded = await loadRazorpayScript();
    if (!loaded) { toast.error("Razorpay failed to load"); return; }
    try {
      setLoading(true);
      const { data } = await axiosInstance.post("/payments/create-order", { amount: Math.round(finalTotal) });
      if (!data.success) { toast.error("Unable to create payment order"); return; }
      const rzp = new window.Razorpay({
        key: data.key, amount: data.order.amount, currency: "INR",
        name: "Pet World", order_id: data.order.id,
        handler: async (response) => {
          try {
            await axiosInstance.post("/payments/verify-payment", response);
            const { data: od } = await axiosInstance.post("/orders/place", {
              items: cartItems.map(i => ({ petId: i.petId, quantity: i.quantity })),
              totalPrice: finalTotal, paymentMethod: "Razorpay", address: savedAddress,
            });
            if (od.success) { clearCart(); toast.success("Payment successful!"); setTimeout(() => navigate("/orders"), 1200); }
          } catch { toast.error("Payment verification failed"); }
        },
        prefill: { name: savedAddress.name, email: user?.email || "", contact: savedAddress.mobile },
        theme: { color: T.accent },
      });
      rzp.open();
      rzp.on("payment.failed", () => toast.error("Payment Failed"));
    } catch { toast.error("Unable to initiate payment"); }
    finally { setLoading(false); }
  };

  const handleCheckout = () =>
    paymentMethod === "Cash on Delivery" ? handlePlaceOrderCOD() : handleRazorpayPayment();

  /* ─────────────────────────────── RENDER ────────────────────────────── */
  return (
    <div style={{ fontFamily:T.font, background:T.bg, minHeight:"100vh", padding:"32px 20px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      <div style={{ maxWidth:1060, margin:"0 auto" }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
            <h1 style={{ fontSize:24, fontWeight:700, color:T.head, margin:0 }}>Your Cart</h1>
            <span style={{ fontSize:12, fontWeight:600, background:"#EEF2FF", color:T.accent, padding:"2px 10px", borderRadius:99 }}>
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
            </span>
          </div>
          <p style={{ fontSize:12, color:T.muted, margin:0 }}>Review your selections before checkout</p>
        </div>

        {/* ── Empty state ── */}
        {cartItems.length === 0 ? (
          <div style={{ background:T.card, borderRadius:20, border:`1px solid ${T.border}`, padding:"64px 20px", textAlign:"center" }}>
            <ShoppingBag size={44} color="#D1D5DB" style={{ marginBottom:14 }} />
            <p style={{ fontSize:15, fontWeight:600, color:"#374151", margin:"0 0 6px" }}>Your cart is empty</p>
            <p style={{ fontSize:13, color:T.muted, margin:"0 0 20px" }}>Add some pets to get started</p>
            <button
              onClick={() => navigate("/")}
              style={{ background:T.accent, color:"#fff", border:"none", borderRadius:10, padding:"10px 22px", fontSize:13, fontWeight:600, fontFamily:T.font, cursor:"pointer" }}
            >
              Browse Pets
            </button>
          </div>
        ) : (
          <div style={{ display:"flex", gap:18, alignItems:"flex-start", flexWrap:"wrap" }}>

            {/* ─── Left: cart items ─── */}
            <div style={{ flex:"1 1 500px", display:"flex", flexDirection:"column", gap:10 }}>

              {/* Column headers */}
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 40px", gap:8, padding:"0 18px", marginBottom:2 }}>
                {["Product","Price","Qty",""].map((h,i) => (
                  <p key={i} style={{ fontSize:10, fontWeight:600, color:T.muted, textTransform:"uppercase", letterSpacing:"0.06em", margin:0, textAlign: i>0?"center":"left" }}>{h}</p>
                ))}
              </div>

              {/* Items */}
              <div style={{ background:T.card, borderRadius:18, border:`1px solid ${T.border}`, overflow:"hidden", boxShadow:"0 1px 4px rgba(100,90,200,0.06)" }}>
                <AnimatePresence>
                  {cartItems.map((item, i) => (
                    <motion.div
                      key={item.petId}
                      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                      exit={{ opacity:0, height:0 }} transition={{ delay:i*0.05 }}
                      style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 40px", gap:8, alignItems:"center", padding:"14px 18px", borderBottom: i < cartItems.length-1 ? `1px solid ${T.border}` : "none" }}
                    >
                      {/* Pet info */}
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{ width:58, height:58, borderRadius:12, overflow:"hidden", flexShrink:0, border:`1px solid ${T.border}` }}>
                          <img src={item.image} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                        </div>
                        <div>
                          <p style={{ fontWeight:600, fontSize:13, color:T.head, margin:0 }}>{item.name}</p>
                          <span style={{ fontSize:11, background:"#EEF2FF", color:T.accent, padding:"2px 8px", borderRadius:99, fontWeight:600, marginTop:4, display:"inline-block" }}>{item.category}</span>
                        </div>
                      </div>

                      {/* Price */}
                      <p style={{ textAlign:"center", fontWeight:700, fontSize:14, color:T.head, margin:0 }}>
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>

                      {/* Qty selector */}
                      <div style={{ display:"flex", justifyContent:"center" }}>
                        <div style={{ position:"relative" }}>
                          <select
                            value={item.quantity}
                            onChange={e => updateQuantity(item.petId, parseInt(e.target.value))}
                            style={{ padding:"6px 24px 6px 10px", border:`1px solid ${T.border}`, borderRadius:8, fontSize:12, fontFamily:T.font, color:T.head, background:T.card, appearance:"none", outline:"none", cursor:"pointer" }}
                          >
                            {Array.from({length:5},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}
                          </select>
                          <ChevronDown size={11} color={T.muted} style={{ position:"absolute", right:6, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => deleteItem(item.petId)}
                        style={{ display:"flex", alignItems:"center", justifyContent:"center", width:30, height:30, borderRadius:8, border:`1px solid #FEE2E2`, background:"#FFF1F1", cursor:"pointer" }}
                      >
                        <Trash2 size={13} color="#DC2626" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Footer row */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"4px 4px" }}>
                <button onClick={() => navigate("/")} style={{ fontSize:12, fontWeight:600, color:T.accent, background:"none", border:"none", cursor:"pointer", fontFamily:T.font }}>
                  ← Continue Shopping
                </button>
                <button onClick={clearCart} style={{ fontSize:12, fontWeight:600, color:"#DC2626", background:"none", border:"none", cursor:"pointer", fontFamily:T.font, display:"flex", alignItems:"center", gap:5 }}>
                  <Trash2 size={12} /> Clear Cart
                </button>
              </div>
            </div>

            {/* ─── Right: order summary ─── */}
            <div style={{ width:340, flexShrink:0, display:"flex", flexDirection:"column", gap:12 }}>

              {/* Delivery address card */}
              <div style={{ background:T.card, borderRadius:18, border:`1px solid ${T.border}`, padding:"18px", boxShadow:"0 1px 4px rgba(100,90,200,0.06)" }}>
                <FieldLabel>Delivery Address</FieldLabel>
                {savedAddress ? (
                  <div style={{ background:"#F7F7FC", borderRadius:12, padding:"12px 14px", marginTop:6 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <p style={{ fontWeight:700, fontSize:13, color:T.head, margin:"0 0 3px" }}>{savedAddress.name}</p>
                        <p style={{ fontSize:11, color:T.muted, margin:0 }}>{savedAddress.mobile}</p>
                        <p style={{ fontSize:11, color:T.muted, margin:"4px 0 0", lineHeight:1.6 }}>
                          {savedAddress.house}, {savedAddress.area},<br/>{savedAddress.city} – {savedAddress.pincode}
                        </p>
                      </div>
                      <CheckCircle size={16} color="#059669" style={{ flexShrink:0, marginTop:2 }} />
                    </div>
                    <button onClick={() => setShowAddressModal(true)} style={{ fontSize:11, fontWeight:600, color:T.accent, background:"none", border:"none", cursor:"pointer", fontFamily:T.font, marginTop:8, padding:0 }}>
                      Change Address
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale:0.97 }}
                    onClick={() => setShowAddressModal(true)}
                    style={{ width:"100%", marginTop:8, padding:"10px", border:`1.5px dashed #C7D2FE`, borderRadius:12, background:"#F5F3FF", color:T.accent, fontSize:12, fontWeight:600, fontFamily:T.font, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}
                  >
                    <MapPin size={14} /> Add Delivery Address
                  </motion.button>
                )}
              </div>

              {/* Payment method */}
              <div style={{ background:T.card, borderRadius:18, border:`1px solid ${T.border}`, padding:"18px", boxShadow:"0 1px 4px rgba(100,90,200,0.06)" }}>
                <FieldLabel>Payment Method</FieldLabel>
                <div style={{ position:"relative", marginTop:6 }}>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    style={{ ...inputStyle, padding:"9px 32px 9px 12px", appearance:"none", cursor:"pointer" }}
                  >
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="Razorpay">Online Payment (Razorpay)</option>
                  </select>
                  <ChevronDown size={13} color={T.muted} style={{ position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
                </div>
              </div>

              {/* Coupon */}
              <div style={{ background:T.card, borderRadius:18, border:`1px solid ${T.border}`, padding:"18px", boxShadow:"0 1px 4px rgba(100,90,200,0.06)" }}>
                <FieldLabel>Coupon / Offer Code</FieldLabel>
                {appliedCoupon ? (
                  <div style={{ background:"#ECFDF5", border:"1px solid #A7F3D0", borderRadius:12, padding:"12px 14px", marginTop:6, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <Tag size={14} color="#059669" />
                      <div>
                        <p style={{ fontSize:12, fontWeight:700, color:"#047857", margin:0 }}>{appliedCoupon.code}</p>
                        <p style={{ fontSize:11, color:"#065F46", margin:0 }}>{appliedCoupon.discount}% off applied</p>
                      </div>
                    </div>
                    <button onClick={handleRemoveCoupon} style={{ fontSize:11, fontWeight:600, color:"#DC2626", background:"none", border:"none", cursor:"pointer", fontFamily:T.font }}>Remove</button>
                  </div>
                ) : (
                  <div style={{ display:"flex", gap:8, marginTop:6 }}>
                    <input
                      type="text" placeholder="Enter code"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key==="Enter" && handleApplyCoupon()}
                      style={{ flex:1, padding:"9px 12px", border:`1px solid ${T.border}`, borderRadius:10, fontSize:12, fontFamily:T.font, color:T.head, background:T.card, outline:"none" }}
                    />
                    <motion.button
                      whileTap={{ scale:0.96 }}
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      style={{ background:T.accent, color:"#fff", border:"none", borderRadius:10, padding:"9px 14px", fontSize:12, fontWeight:600, fontFamily:T.font, cursor:"pointer", opacity:couponLoading?0.6:1 }}
                    >
                      {couponLoading ? "…" : "Apply"}
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Price breakdown */}
              <div style={{ background:T.card, borderRadius:18, border:`1px solid ${T.border}`, padding:"18px", boxShadow:"0 1px 4px rgba(100,90,200,0.06)" }}>
                <p style={{ fontSize:14, fontWeight:700, color:T.head, margin:"0 0 14px", fontFamily:T.font }}>Order Summary</p>
                <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                  {[
                    { label:"Subtotal",           value:`₹${totalPrice.toLocaleString()}`,         color:T.head },
                    { label:"Shipping",            value:"Free",                                    color:"#059669" },
                    { label:"Tax (9%)",            value:`₹${tax}`,                                color:T.head },
                    ...(discountAmount > 0 ? [{ label:`Discount (${appliedCoupon?.discount}%)`, value:`− ₹${discountAmount.toFixed(2)}`, color:"#059669" }] : []),
                  ].map(r => (
                    <div key={r.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontSize:12, color:T.muted, fontFamily:T.font }}>{r.label}</span>
                      <span style={{ fontSize:12, fontWeight:600, color:r.color, fontFamily:T.font }}>{r.value}</span>
                    </div>
                  ))}
                  <div style={{ height:1, background:T.border, margin:"4px 0" }} />
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:14, fontWeight:700, color:T.head, fontFamily:T.font }}>Total</span>
                    <span style={{ fontSize:18, fontWeight:700, color:T.head, fontFamily:T.font }}>₹{parseFloat(finalTotal).toLocaleString()}</span>
                  </div>
                </div>

                {/* Checkout button */}
                <motion.button
                  whileHover={{ scale:1.015 }} whileTap={{ scale:0.98 }}
                  onClick={handleCheckout}
                  disabled={loading || !savedAddress}
                  style={{
                    width:"100%", marginTop:16, padding:"13px",
                    borderRadius:12, border:"none",
                    background: loading || !savedAddress ? "#D1D5DB" : T.accent,
                    color:"#fff", fontSize:13, fontWeight:600, fontFamily:T.font,
                    cursor: loading || !savedAddress ? "not-allowed" : "pointer",
                    transition:"background 0.2s",
                  }}
                >
                  {loading ? "Processing…" : paymentMethod === "Cash on Delivery" ? "Place Order (COD)" : "Proceed to Payment"}
                </motion.button>

                {!savedAddress && (
                  <p style={{ fontSize:11, color:"#F59E0B", textAlign:"center", margin:"8px 0 0", fontFamily:T.font }}>
                    Add a delivery address to continue
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Address modal ─── */}
      <AnimatePresence>
        {showAddressModal && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(30,27,75,0.45)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:16 }}
          >
            <motion.div
              initial={{ scale:0.88, opacity:0 }} animate={{ scale:1, opacity:1 }}
              exit={{ scale:0.88, opacity:0 }} transition={{ type:"spring", stiffness:160, damping:20 }}
              style={{ background:T.card, borderRadius:20, width:"100%", maxWidth:420, padding:"26px", position:"relative", boxShadow:"0 20px 60px rgba(79,70,229,0.15)" }}
            >
              <button
                onClick={() => setShowAddressModal(false)}
                style={{ position:"absolute", top:16, right:16, width:30, height:30, borderRadius:8, border:`1px solid ${T.border}`, background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}
              >
                <X size={15} color={T.muted} />
              </button>

              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <MapPin size={17} color={T.accent} />
                </div>
                <div>
                  <p style={{ fontWeight:700, fontSize:15, color:T.head, margin:0, fontFamily:T.font }}>Delivery Address</p>
                  <p style={{ fontSize:11, color:T.muted, margin:0, fontFamily:T.font }}>Where should we send your pet?</p>
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[
                  { label:"Full Name",      key:"name",    span:2 },
                  { label:"Mobile Number",  key:"mobile",  span:2 },
                  { label:"House / Flat No.", key:"house", span:1 },
                  { label:"Road / Area",    key:"area",    span:1 },
                  { label:"City",           key:"city",    span:1 },
                  { label:"Pincode",        key:"pincode", span:1 },
                ].map(f => (
                  <div key={f.key} style={{ gridColumn:`span ${f.span}` }}>
                    <FieldLabel>{f.label}</FieldLabel>
                    <input
                      type="text"
                      placeholder={f.label}
                      value={address[f.key]}
                      onChange={e => setAddress({ ...address, [f.key]: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>

              <motion.button
                whileTap={{ scale:0.97 }}
                onClick={handleSaveAddress}
                style={{ width:"100%", marginTop:18, padding:"12px", borderRadius:12, border:"none", background:T.accent, color:"#fff", fontSize:13, fontWeight:600, fontFamily:T.font, cursor:"pointer" }}
              >
                Save Address
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}