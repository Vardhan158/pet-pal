import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../api/utils/axiosInstance";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

void motion;

/* ─── Font inject ─── */
if (!document.querySelector("#poppins-font")) {
  const l = document.createElement("link");
  l.id = "poppins-font";
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap";
  document.head.appendChild(l);
}

const FALLBACK_IMAGE = "https://cdn-icons-png.flaticon.com/512/616/616408.png";

/* ─── Styles ─── */
const css = `
  .pd-root, .pd-root * { font-family: 'Poppins', sans-serif; box-sizing: border-box; }

  .pd-page {
    min-height: 100vh;
    background: #f7f8ff;
    padding: 2rem 1.25rem 4rem;
  }

  .pd-inner { max-width: 1100px; margin: 0 auto; }

  /* ── Breadcrumb ── */
  .pd-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    color: #9da3ba;
    margin-bottom: 1.75rem;
    flex-wrap: wrap;
  }
  .pd-breadcrumb-back {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #6366f1;
    font-weight: 600;
    cursor: pointer;
    background: none;
    border: none;
    font-family: 'Poppins', sans-serif;
    font-size: 0.75rem;
    padding: 0;
    transition: color 0.15s;
  }
  .pd-breadcrumb-back:hover { color: #4f46e5; }
  .pd-breadcrumb-sep { color: #d1d5e0; }
  .pd-breadcrumb-current { color: #6366f1; font-weight: 600; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  /* ── Layout ── */
  .pd-layout {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }
  @media (min-width: 768px) {
    .pd-layout { flex-direction: row; align-items: flex-start; gap: 3rem; }
  }

  /* ── Gallery ── */
  .pd-gallery {
    display: flex;
    gap: 0.75rem;
    flex-shrink: 0;
  }
  @media (min-width: 768px) { .pd-gallery { width: 52%; } }

  .pd-thumbs {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .pd-thumb {
    width: 64px;
    height: 64px;
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
    background: #fff;
    flex-shrink: 0;
  }
  .pd-thumb:hover { transform: scale(1.05); box-shadow: 0 4px 12px rgba(99,102,241,0.15); }
  .pd-thumb.active { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
  .pd-thumb img { width: 100%; height: 100%; object-fit: cover; }

  .pd-main-img-wrap {
    flex: 1;
    border-radius: 24px;
    overflow: hidden;
    background: #fff;
    border: 1px solid #eaecf5;
    box-shadow: 0 4px 24px rgba(99,102,241,0.07);
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .pd-main-img-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Badge on image */
  .pd-img-badge {
    position: absolute;
    top: 14px;
    left: 14px;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(6px);
    border: 1px solid #ede9f6;
    border-radius: 10px;
    padding: 4px 12px;
    font-size: 0.7rem;
    font-weight: 600;
    color: #6366f1;
  }

  /* Offer badge */
  .pd-offer-badge {
    position: absolute;
    top: 14px;
    right: 14px;
    background: linear-gradient(135deg, #f472b6, #818cf8);
    border-radius: 10px;
    padding: 4px 12px;
    font-size: 0.7rem;
    font-weight: 700;
    color: #fff;
    box-shadow: 0 3px 10px rgba(244,114,182,0.35);
  }

  /* ── Info panel ── */
  .pd-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .pd-type-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: #eef1ff;
    border: 1px solid #dde0ff;
    color: #6366f1;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 100px;
    margin-bottom: 0.85rem;
    width: fit-content;
  }

  .pd-title {
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 800;
    color: #1a1d3a;
    letter-spacing: -0.03em;
    line-height: 1.2;
    margin: 0 0 0.5rem;
  }

  /* Price block */
  .pd-price-block {
    background: #fff;
    border: 1px solid #eaecf5;
    border-radius: 18px;
    padding: 1rem 1.25rem;
    margin: 1.25rem 0;
    display: flex;
    align-items: flex-end;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .pd-price-main {
    font-size: 1.75rem;
    font-weight: 800;
    color: #1a1d3a;
    letter-spacing: -0.03em;
    line-height: 1;
  }
  .pd-price-strike {
    font-size: 0.9rem;
    color: #c4c8da;
    text-decoration: line-through;
    font-weight: 500;
    line-height: 1;
    align-self: center;
  }
  .pd-price-tax {
    font-size: 0.68rem;
    color: #a0a6c0;
    margin-left: auto;
    align-self: center;
  }
  .pd-savings {
    font-size: 0.72rem;
    font-weight: 600;
    color: #22c55e;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 8px;
    padding: 2px 10px;
    align-self: center;
  }

  /* About */
  .pd-section-label {
    font-size: 0.72rem;
    font-weight: 700;
    color: #6366f1;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    margin: 1.25rem 0 0.6rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pd-section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #eaecf5;
  }

  .pd-desc-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .pd-desc-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 0.82rem;
    color: #4a5068;
    line-height: 1.65;
    font-weight: 400;
  }
  .pd-desc-bullet {
    width: 18px; height: 18px;
    border-radius: 50%;
    background: #eef1ff;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    margin-top: 2px;
  }
  .pd-desc-bullet svg { width: 9px; height: 9px; }

  /* Specs */
  .pd-specs-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }
  .pd-spec-item {
    background: #fff;
    border: 1px solid #eaecf5;
    border-radius: 12px;
    padding: 0.6rem 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .pd-spec-label {
    font-size: 0.65rem;
    font-weight: 600;
    color: #a0a6c0;
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }
  .pd-spec-value {
    font-size: 0.82rem;
    font-weight: 600;
    color: #1a1d3a;
  }

  /* CTA buttons */
  .pd-cta-row {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.75rem;
  }

  .pd-btn-cart {
    flex: 1;
    height: 50px;
    border-radius: 14px;
    border: 1.5px solid #dde0ff;
    background: #fff;
    font-family: 'Poppins', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    color: #6366f1;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.12s;
    display: flex; align-items: center; justify-content: center; gap: 7px;
  }
  .pd-btn-cart:hover:not(:disabled) { background: #eef1ff; border-color: #c4b5fd; }
  .pd-btn-cart:active:not(:disabled) { transform: scale(0.98); }
  .pd-btn-cart:disabled { opacity: 0.55; cursor: not-allowed; }

  .pd-btn-buy {
    flex: 1;
    height: 50px;
    border-radius: 14px;
    border: none;
    background: linear-gradient(135deg, #6366f1, #818cf8);
    font-family: 'Poppins', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.12s, box-shadow 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    box-shadow: 0 6px 18px rgba(99,102,241,0.3);
    letter-spacing: 0.01em;
  }
  .pd-btn-buy:hover:not(:disabled) { opacity: 0.9; box-shadow: 0 8px 24px rgba(99,102,241,0.38); }
  .pd-btn-buy:active:not(:disabled) { transform: scale(0.98); }
  .pd-btn-buy:disabled { opacity: 0.55; cursor: not-allowed; }

  .pd-btn-spinner {
    width: 15px; height: 15px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  .pd-btn-spinner-dark {
    width: 15px; height: 15px;
    border: 2px solid rgba(99,102,241,0.25);
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  /* Trust strip */
  .pd-trust {
    display: flex;
    gap: 1rem;
    margin-top: 1.25rem;
    flex-wrap: wrap;
  }
  .pd-trust-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.7rem;
    font-weight: 500;
    color: #7a7f9a;
  }
  .pd-trust-icon {
    width: 22px; height: 22px;
    border-radius: 7px;
    background: #eef1ff;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.75rem;
  }

  /* ── Loading state ── */
  .pd-loading {
    min-height: 100vh;
    background: #f7f8ff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }
  .pd-loading-spinner {
    width: 44px; height: 44px;
    border: 3px solid #e0e3ff;
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
  }
  .pd-loading p { font-family: 'Poppins', sans-serif; font-size: 0.82rem; color: #9da3ba; font-weight: 500; margin: 0; }

  /* ── Not found ── */
  .pd-notfound {
    min-height: 100vh;
    background: #f7f8ff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    text-align: center;
  }
  .pd-notfound-icon { font-size: 2.5rem; }
  .pd-notfound h3 { font-family: 'Poppins', sans-serif; font-size: 1rem; font-weight: 700; color: #1a1d3a; margin: 0; }
  .pd-notfound p  { font-family: 'Poppins', sans-serif; font-size: 0.82rem; color: #9da3ba; margin: 0; }
  .pd-back-btn {
    font-family: 'Poppins', sans-serif;
    font-size: 0.82rem;
    font-weight: 600;
    padding: 0.6rem 1.5rem;
    border-radius: 100px;
    border: none;
    background: linear-gradient(135deg, #6366f1, #818cf8);
    color: #fff;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(99,102,241,0.3);
    transition: opacity 0.15s;
    margin-top: 0.5rem;
  }
  .pd-back-btn:hover { opacity: 0.9; }

  @keyframes spin { to { transform: rotate(360deg); } }
`;

/* ─── Normalize helper ─── */
const normalizePet = (v) => {
  if (!v) return null;
  const pet = { ...v };
  pet.id = pet._id || pet.id;
  pet.title = pet.name || pet.title || "Pet";
  pet.type = pet.category || pet.type || "Unknown";
  if (!Array.isArray(pet.images)) {
    if (pet.image) pet.images = [pet.image];
    else if (Array.isArray(pet.additionalImages)) pet.images = pet.additionalImages;
    else pet.images = [];
  }
  if (!Array.isArray(pet.specifications)) pet.specifications = [];
  return pet;
};

export default function PetDetail() {
  const { user }     = useAuth();
  const { addToCart } = useCart();
  const { id }        = useParams();
  const location      = useLocation();
  const navigate      = useNavigate();

  const [pet, setPet]                     = useState(normalizePet(location.state?.pet ?? null));
  const [loading, setLoading]             = useState(!location.state?.pet);
  const [addingToCart, setAddingToCart]   = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [activeImg, setActiveImg]         = useState(0);

  useEffect(() => {
    if (pet) return;
    (async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/pets/${id}`);
        const data = res.data?.pet;
        if (!data) throw new Error("Pet not found");
        setPet(normalizePet(data));
      } catch {
        toast.error("Failed to load pet details");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, pet]);

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const handleAddToCart = async () => {
    if (!user) { toast.error("Please login to add items to cart"); navigate("/login"); return; }
    setAddingToCart(true);
    try {
      const petId = pet._id || pet.id;
      await axiosInstance.post("/cart/add", { petId, quantity: 1 });
      addToCart(petId, {
        petId,
        name: pet.name || pet.title,
        price: pet.offerPrice && pet.offerPrice > 0 ? pet.offerPrice : pet.price,
        image: pet.images?.[0] || pet.image,
        category: pet.category || pet.type,
        quantity: 1,
      });
      toast.success(`${pet.title} added to cart 🛒`);
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) { toast.error("Please login to checkout"); navigate("/login"); return; }
    try {
      setProcessingPayment(true);
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error("Razorpay SDK failed to load"); return; }
      
      const petId = pet._id || pet.id;
      const amount = pet.offerPrice && pet.offerPrice > 0 ? pet.offerPrice : pet.price;
      
      // ✅ Step 1: Create Razorpay order
      const { data: paymentData } = await axiosInstance.post("/payments/create-order", { amount });
      const razorpayOrder = paymentData?.order || paymentData;
      if (!razorpayOrder?.id || !paymentData?.key) throw new Error("Failed to create Razorpay order");
      
      // ✅ Step 2: Create order in database with razorpay order ID
      const { data: orderData } = await axiosInstance.post("/orders/place", {
        petId,
        quantity: 1,
        totalPrice: amount,
        paymentMethod: "Razorpay",
        razorpayOrderId: razorpayOrder.id,
        address: { name: user.name, email: user.email, mobile: user.phone },
      });
      
      if (!orderData.success) throw new Error("Failed to create order");
      const dbOrder = orderData.order;
      
      // ✅ Step 3: Open Razorpay payment
      const rz = new window.Razorpay({
        key: paymentData.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",
        name: "PetPal",
        description: `Purchase of ${pet.title}`,
        image: FALLBACK_IMAGE,
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            // ✅ Step 4: Verify payment
            await axiosInstance.post("/payments/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            
            // ✅ Step 5: Mark order as paid
            await axiosInstance.put("/orders/mark-paid", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
            });
            
            toast.success("Payment successful 🎉");
            navigate("/orders");
          } catch (err) {
            toast.error(err?.response?.data?.message || "Payment verification failed");
          }
        },
        prefill: { name: user.name || "Pet Lover", email: user.email || "", contact: user.phone || "" },
        theme: { color: "#6366f1" },
      });
      rz.on("payment.failed", () => {
        toast.error("Payment failed");
      });
      rz.open();
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.response?.data?.message || "Failed to process payment");
    } finally {
      setProcessingPayment(false);
    }
  };

  /* ─── Loading ─── */
  if (loading) return (
    <div className="pd-root pd-loading">
      <style>{css}</style>
      <div className="pd-loading-spinner" />
      <p>Fetching pet details…</p>
    </div>
  );

  /* ─── Not found ─── */
  if (!pet) return (
    <div className="pd-root pd-notfound">
      <style>{css}</style>
      <div className="pd-notfound-icon">🐾</div>
      <h3>Pet not found</h3>
      <p>This pet may have found a home already!</p>
      <button className="pd-back-btn" onClick={() => navigate(-1)}>← Go Back</button>
    </div>
  );

  const images = (pet.images || []).filter(Boolean);
  const displayImages = images.length > 0 ? images : [FALLBACK_IMAGE];
  const descList = pet.description
    ? pet.description.split(".").filter((s) => s.trim().length > 0)
    : ["No detailed description available."];

  const hasOffer = pet.offerPrice && pet.offerPrice > 0;
  const savings  = hasOffer ? Math.round(((pet.price - pet.offerPrice) / pet.price) * 100) : 0;

  return (
    <div className="pd-root pd-page">
      <style>{css}</style>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: "Poppins, sans-serif", fontSize: "0.82rem" } }} />

      <div className="pd-inner">
        {/* Breadcrumb */}
        <div className="pd-breadcrumb">
          <button className="pd-breadcrumb-back" onClick={() => navigate(-1)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <span className="pd-breadcrumb-sep">/</span>
          <span>{pet.type}</span>
          <span className="pd-breadcrumb-sep">/</span>
          <span className="pd-breadcrumb-current">{pet.title}</span>
        </div>

        {/* Main layout */}
        <div className="pd-layout">
          {/* Gallery */}
          <div className="pd-gallery">
            {/* Thumbnails */}
            {displayImages.length > 1 && (
              <div className="pd-thumbs">
                {displayImages.map((img, i) => (
                  <motion.div
                    key={i}
                    className={`pd-thumb${activeImg === i ? " active" : ""}`}
                    onClick={() => setActiveImg(i)}
                    whileTap={{ scale: 0.96 }}
                  >
                    <img src={img} alt={`View ${i + 1}`} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="pd-main-img-wrap">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  src={displayImages[activeImg]}
                  alt={pet.title}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              <div className="pd-img-badge">{pet.type}</div>
              {hasOffer && <div className="pd-offer-badge">{savings}% OFF</div>}
            </div>
          </div>

          {/* Info */}
          <div className="pd-info">
            <div className="pd-type-pill">
              <svg width="7" height="7" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#6366f1"/></svg>
              {pet.type}
            </div>

            <h1 className="pd-title">{pet.title}</h1>

            {/* Price */}
            <div className="pd-price-block">
              <div>
                {hasOffer && (
                  <div className="pd-price-strike">MRP ₹{pet.price.toLocaleString()}</div>
                )}
                <div className="pd-price-main">
                  ₹{(hasOffer ? pet.offerPrice : pet.price).toLocaleString()}
                </div>
              </div>
              {hasOffer && (
                <span className="pd-savings">Save {savings}%</span>
              )}
              <div className="pd-price-tax">Incl. all taxes</div>
            </div>

            {/* About */}
            <div className="pd-section-label">About This Pet</div>
            <ul className="pd-desc-list">
              {descList.map((d, i) => (
                <li key={i} className="pd-desc-item">
                  <div className="pd-desc-bullet">
                    <svg viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {d.trim()}
                </li>
              ))}
            </ul>

            {/* Specs */}
            {pet.specifications.length > 0 && (
              <>
                <div className="pd-section-label">Specifications</div>
                <div className="pd-specs-grid">
                  {pet.specifications.map((s, i) => (
                    <div key={i} className="pd-spec-item">
                      <div className="pd-spec-label">{s.label || `Spec ${i + 1}`}</div>
                      <div className="pd-spec-value">{s.value || "N/A"}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* CTAs */}
            <div className="pd-cta-row">
              <motion.button
                className="pd-btn-cart"
                onClick={handleAddToCart}
                disabled={addingToCart}
                whileTap={{ scale: 0.97 }}
              >
                {addingToCart
                  ? <><div className="pd-btn-spinner-dark" /> Adding…</>
                  : <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Add to Cart
                    </>
                }
              </motion.button>

              <motion.button
                className="pd-btn-buy"
                onClick={handleBuyNow}
                disabled={processingPayment}
                whileTap={{ scale: 0.97 }}
              >
                {processingPayment
                  ? <><div className="pd-btn-spinner" /> Processing…</>
                  : <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Buy Now
                    </>
                }
              </motion.button>
            </div>

            {/* Trust strip */}
            <div className="pd-trust">
              {[
                { icon: "🔒", label: "Secure Payment" },
                { icon: "🚚", label: "Safe Delivery" },
                { icon: "🐾", label: "Vet Certified" },
                { icon: "↩️", label: "7-day Return" },
              ].map((t, i) => (
                <div key={i} className="pd-trust-item">
                  <div className="pd-trust-icon">{t.icon}</div>
                  {t.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}