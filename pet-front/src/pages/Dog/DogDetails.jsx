import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/utils/axiosInstance";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { ShoppingCart, ArrowLeft, Tag, CheckCircle } from "lucide-react";

void motion;

const normalizeDog = (d) => {
  if (!d) return null;
  const copy = { ...d };
  copy.id    = copy._id || copy.id;
  copy.title = copy.name || copy.title || "Dog";
  copy.type  = copy.category || copy.type || "Unknown";
  if (!Array.isArray(copy.images)) {
    if (copy.image)                 copy.images = [copy.image];
    else if (copy.additionalImages) copy.images = Array.isArray(copy.additionalImages) ? copy.additionalImages : [];
    else                            copy.images = [];
  }
  if (!Array.isArray(copy.specifications)) copy.specifications = [];
  return copy;
};

export default function DogDetails() {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const { user }        = useAuth();
  const { addToCart }   = useCart();
  const [dog, setDog]   = useState(null);
  const [loading, setLoading]         = useState(true);
  const [thumbnail, setThumbnail]     = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    async function fetchDog() {
      try {
        const res        = await axiosInstance.get(`/pets/${id}`);
        const normalized = normalizeDog(res.data.pet);
        setDog(normalized);
        setThumbnail(normalized?.images?.[0] || "");
      } catch {
        toast.error("Failed to load dog details");
      } finally {
        setLoading(false);
      }
    }
    fetchDog();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { toast.error("Please login to add items to cart"); navigate("/login"); return; }
    setAddingToCart(true);
    try {
      await axiosInstance.post("/cart/add", { petId: dog._id || dog.id, quantity: 1 });
      addToCart(dog._id || dog.id, {
        petId:    dog._id || dog.id,
        name:     dog.name,
        price:    dog.offerPrice && dog.offerPrice > 0 ? dog.offerPrice : dog.price,
        image:    dog.images?.[0],
        category: dog.category,
        quantity: 1,
      });
      toast.success(`${dog.name} added to cart`);
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');`}</style>
      <div style={{ fontFamily:"'Poppins',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", color:"#9499b0", fontSize:"0.9rem" }}>
        Loading dog details…
      </div>
    </>
  );

  /* ── Not found ── */
  if (!dog) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');`}</style>
      <div style={{ fontFamily:"'Poppins',sans-serif", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100vh", gap:"1rem" }}>
        <div style={{ fontSize:"3rem" }}>🐶</div>
        <p style={{ color:"#9499b0", fontSize:"0.95rem" }}>Dog not found</p>
        <button onClick={() => navigate(-1)} style={{ background:"linear-gradient(135deg,#f5a623,#f76b1c)", color:"#fff", border:"none", borderRadius:12, padding:"0.6rem 1.5rem", fontFamily:"'Poppins',sans-serif", fontWeight:600, cursor:"pointer", fontSize:"0.85rem" }}>
          Go Back
        </button>
      </div>
    </>
  );

  const images         = (dog.images || []).filter(Boolean);
  const descriptionList = dog.description
    ? dog.description.split(".").filter((d) => d.trim().length > 0)
    : ["No detailed description available."];
  const hasOffer       = dog.offerPrice && dog.offerPrice > 0;
  const discountPct    = hasOffer ? Math.round(((dog.price - dog.offerPrice) / dog.price) * 100) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        .dd-root {
          font-family: 'Poppins', sans-serif;
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem 1.5rem 4rem;
        }

        /* ── Breadcrumb ── */
        .dd-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: #9499b0;
          margin-bottom: 2rem;
        }
        .dd-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          font-family: 'Poppins', sans-serif;
          font-size: 0.78rem;
          font-weight: 500;
          color: #f76b1c;
          cursor: pointer;
          padding: 0;
        }
        .dd-back-btn:hover { text-decoration: underline; }
        .dd-breadcrumb-current { color: #1a1a2e; font-weight: 500; }

        /* ── Main layout ── */
        .dd-layout {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }
        @media (min-width: 768px) {
          .dd-layout { flex-direction: row; gap: 3rem; }
        }

        /* ── Image panel ── */
        .dd-image-panel {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }

        .dd-thumbnails {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .dd-thumb {
          width: 68px; height: 68px;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid #eef0f6;
          transition: border-color 0.2s, box-shadow 0.2s;
          flex-shrink: 0;
        }
        .dd-thumb.active {
          border-color: #f5a623;
          box-shadow: 0 0 0 3px rgba(245,166,35,0.18);
        }
        .dd-thumb img { width: 100%; height: 100%; object-fit: cover; }

        .dd-main-image {
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #eef0f6;
          box-shadow: 0 8px 32px rgba(0,0,0,0.07);
          width: 100%;
          max-width: 400px;
          aspect-ratio: 1;
          background: #f8f9fc;
          position: relative;
        }
        .dd-main-image img {
          width: 100%; height: 100%;
          object-fit: cover;
        }

        .dd-discount-badge {
          position: absolute;
          top: 14px; left: 14px;
          background: linear-gradient(135deg, #f5a623, #f76b1c);
          color: #fff;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 99px;
          letter-spacing: 0.3px;
        }

        /* ── Detail panel ── */
        .dd-detail {
          flex: 1;
          min-width: 0;
        }

        .dd-category {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 600;
          background: #fff0e0;
          color: #c2590a;
          padding: 3px 10px;
          border-radius: 99px;
          margin-bottom: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dd-name {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a1a2e;
          letter-spacing: -0.5px;
          margin-bottom: 1.25rem;
          line-height: 1.2;
        }

        /* ── Price block ── */
        .dd-price-block {
          background: #fdf9f5;
          border: 1px solid #f0e0c8;
          border-radius: 14px;
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
          display: inline-flex;
          flex-direction: column;
          gap: 2px;
        }
        .dd-price-mrp {
          font-size: 0.8rem;
          color: #b8bdd0;
          text-decoration: line-through;
        }
        .dd-price-main {
          font-size: 1.9rem;
          font-weight: 700;
          color: #f76b1c;
          letter-spacing: -0.5px;
          line-height: 1.1;
        }
        .dd-price-tax {
          font-size: 0.72rem;
          color: #9499b0;
          margin-top: 2px;
        }

        /* ── Description ── */
        .dd-section-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 0.65rem;
        }
        .dd-desc-list {
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 1.5rem;
        }
        .dd-desc-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 0.83rem;
          color: #5a607a;
          line-height: 1.5;
        }
        .dd-desc-icon {
          color: #f5a623;
          flex-shrink: 0;
          margin-top: 2px;
        }

        /* ── Specifications ── */
        .dd-specs {
          border-top: 1px solid #eef0f6;
          padding-top: 1.25rem;
          margin-bottom: 1.5rem;
        }
        .dd-specs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }
        .dd-spec-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8f9fc;
          border-radius: 8px;
          padding: 7px 10px;
          font-size: 0.78rem;
        }
        .dd-spec-label { color: #9499b0; }
        .dd-spec-value { color: #1a1a2e; font-weight: 500; }

        /* ── Buttons ── */
        .dd-buttons {
          display: flex;
          gap: 10px;
          margin-top: 1.75rem;
        }

        .dd-btn-cart {
          flex: 1;
          padding: 0.85rem;
          font-family: 'Poppins', sans-serif;
          font-size: 0.88rem;
          font-weight: 600;
          color: #c2590a;
          background: #fff0e0;
          border: 1.5px solid #f0d5b0;
          border-radius: 13px;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .dd-btn-cart:hover:not(:disabled) { background: #ffe4c0; }
        .dd-btn-cart:active:not(:disabled) { transform: scale(0.97); }
        .dd-btn-cart:disabled { opacity: 0.6; cursor: not-allowed; }

        .dd-btn-buy {
          flex: 1;
          padding: 0.85rem;
          font-family: 'Poppins', sans-serif;
          font-size: 0.88rem;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, #f5a623 0%, #f76b1c 100%);
          border: none;
          border-radius: 13px;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .dd-btn-buy:hover { opacity: 0.92; }
        .dd-btn-buy:active { transform: scale(0.97); }

        @media (max-width: 480px) {
          .dd-name { font-size: 1.4rem; }
          .dd-specs-grid { grid-template-columns: 1fr; }
          .dd-main-image { max-width: 100%; }
          .dd-buttons { flex-direction: column; }
        }
      `}</style>

      <div className="dd-root">

        {/* Breadcrumb */}
        <nav className="dd-breadcrumb">
          <button className="dd-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={13} /> Back
          </button>
          <span>/</span>
          <span>Dogs</span>
          <span>/</span>
          <span className="dd-breadcrumb-current">{dog.name}</span>
        </nav>

        <div className="dd-layout">

          {/* ── Image panel ── */}
          <div className="dd-image-panel">
            {images.length > 1 && (
              <div className="dd-thumbnails">
                {images.map((img, i) => (
                  <motion.div
                    key={i}
                    className={`dd-thumb ${thumbnail === img ? "active" : ""}`}
                    onClick={() => setThumbnail(img)}
                    whileHover={{ scale: 1.05 }}
                  >
                    <img src={img} alt={`Thumbnail ${i + 1}`} />
                  </motion.div>
                ))}
              </div>
            )}

            <div className="dd-main-image">
              <motion.img
                key={thumbnail}
                src={thumbnail || "https://cdn-icons-png.flaticon.com/512/616/616408.png"}
                alt={dog.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
              />
              {hasOffer && (
                <div className="dd-discount-badge">{discountPct}% OFF</div>
              )}
            </div>
          </div>

          {/* ── Detail panel ── */}
          <div className="dd-detail">
            <span className="dd-category">{dog.category}</span>
            <h1 className="dd-name">{dog.name}</h1>

            {/* Price */}
            <div className="dd-price-block">
              {hasOffer && (
                <span className="dd-price-mrp">MRP ₹{dog.price}</span>
              )}
              <span className="dd-price-main">
                ₹{hasOffer ? dog.offerPrice : dog.price}
              </span>
              <span className="dd-price-tax">Inclusive of all taxes</span>
            </div>

            {/* Description */}
            <p className="dd-section-title">About This Dog</p>
            <ul className="dd-desc-list">
              {descriptionList.map((desc, i) => (
                <li key={i} className="dd-desc-item">
                  <CheckCircle size={14} className="dd-desc-icon" />
                  {desc.trim()}
                </li>
              ))}
            </ul>

            {/* Specifications */}
            {dog.specifications.length > 0 && (
              <div className="dd-specs">
                <p className="dd-section-title" style={{ marginBottom: "0.75rem" }}>
                  Specifications
                </p>
                <div className="dd-specs-grid">
                  {dog.specifications.map((spec, i) => (
                    <div key={i} className="dd-spec-row">
                      <span className="dd-spec-label">{spec.label || `Spec ${i + 1}`}</span>
                      <span className="dd-spec-value">{spec.value || "N/A"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="dd-buttons">
              <motion.button
                className="dd-btn-cart"
                onClick={handleAddToCart}
                disabled={addingToCart}
                whileTap={{ scale: 0.97 }}
              >
                <Tag size={16} />
                {addingToCart ? "Adding…" : "Add to Cart"}
              </motion.button>

              <motion.button
                className="dd-btn-buy"
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  toast.success("Proceeding to checkout");
                  setTimeout(() => navigate("/checkout", { state: { dog } }), 1100);
                }}
              >
                <ShoppingCart size={16} />
                Buy Now
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}