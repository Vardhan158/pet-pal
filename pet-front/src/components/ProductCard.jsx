import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "../context/CartContext";

/* ── Inject Poppins once ── */
if (!document.getElementById("pc-poppins")) {
  const s = document.createElement("style");
  s.id = "pc-poppins";
  s.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

    .pc-root { font-family: 'Poppins', sans-serif; }

    .pc-card {
      background: #fff;
      border-radius: 22px;
      border: 1px solid rgba(0,0,0,0.05);
      box-shadow: 0 2px 14px rgba(0,0,0,0.06);
      display: flex; flex-direction: column;
      overflow: hidden;
      transition: transform 0.28s ease, box-shadow 0.28s ease;
    }
    .pc-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 18px 44px rgba(99,102,241,0.13);
    }

    .pc-img-wrap {
      position: relative; overflow: hidden;
      height: 196px;
      background: linear-gradient(135deg, #EEF2FF, #E0E7FF);
    }
    .pc-img-wrap img {
      width: 100%; height: 100%; object-fit: cover; display: block;
      transition: transform 0.5s ease;
    }
    .pc-card:hover .pc-img-wrap img { transform: scale(1.07); }

    .pc-wishlist {
      position: absolute; top: 11px; right: 11px;
      width: 34px; height: 34px; border-radius: 50%;
      background: rgba(255,255,255,0.88);
      backdrop-filter: blur(6px);
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.18s ease, background 0.18s;
    }
    .pc-wishlist:hover { transform: scale(1.15); background: #fff; }

    .pc-add-btn {
      display: flex; align-items: center; justify-content: center; gap: 7px;
      width: 100%; padding: 11px;
      border: none; border-radius: 13px;
      font-family: 'Poppins', sans-serif;
      font-size: 0.87rem; font-weight: 600;
      cursor: pointer; color: #fff;
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      box-shadow: 0 3px 14px rgba(99,102,241,0.28);
      transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    }
    .pc-add-btn:hover {
      opacity: 0.92;
      box-shadow: 0 6px 22px rgba(99,102,241,0.38);
    }
    .pc-add-btn:active { transform: scale(0.97); }
    .pc-add-btn.added {
      background: linear-gradient(135deg, #10B981, #059669);
      box-shadow: 0 3px 14px rgba(16,185,129,0.28);
    }
  `;
  document.head.appendChild(s);
}

const ProductCard = ({ pet }) => {
  const { addToCart } = useCart();
  const [liked, setLiked]   = useState(false);
  const [added, setAdded]   = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(pet._id, pet);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const image = pet.images?.[0] || "/placeholder.png";
  const price = pet.price != null ? `₹${pet.price.toFixed(2)}` : "N/A";
  const offerPrice = pet.offerPrice && pet.offerPrice < pet.price ? pet.offerPrice : null;
  const discountPct = offerPrice ? Math.round((1 - offerPrice / pet.price) * 100) : null;

  return (
    <div className="pc-root pc-card">
      {/* ── Image ── */}
      <div className="pc-img-wrap">
        <Link to={`/pets/${pet._id}`} tabIndex={-1}>
          <img src={image} alt={pet.name} />
        </Link>

        {/* Discount badge */}
        {discountPct && (
          <div style={{
            position: "absolute", top: 11, left: 11,
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            color: "#fff", borderRadius: 8,
            padding: "2px 10px", fontSize: "0.7rem", fontWeight: 700,
          }}>
            {discountPct}% OFF
          </div>
        )}

        {/* Wishlist */}
        <button
          className="pc-wishlist"
          onClick={() => setLiked((l) => !l)}
          aria-label="Wishlist"
        >
          <Heart
            size={15}
            fill={liked ? "#EF4444" : "none"}
            color={liked ? "#EF4444" : "#9CA3AF"}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", flex: 1 }}>
        <Link to={`/pets/${pet._id}`} style={{ textDecoration: "none", flex: 1 }}>
          {/* Category pill */}
          {pet.category && (
            <span style={{
              display: "inline-block",
              background: "#EEF2FF", color: "#6366F1",
              fontSize: "0.68rem", fontWeight: 700,
              padding: "2px 10px", borderRadius: 999,
              letterSpacing: "0.04em", textTransform: "uppercase",
              marginBottom: 8,
            }}>
              {pet.category}
            </span>
          )}

          <h2 style={{
            margin: "0 0 6px",
            fontSize: "0.97rem", fontWeight: 700, color: "#0F172A",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {pet.name}
          </h2>

          <p style={{
            margin: "0 0 14px",
            fontSize: "0.78rem", color: "#94A3B8",
            lineHeight: 1.6, fontWeight: 400,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {pet.description?.slice(0, 80) || "No description available."}
          </p>
        </Link>

        {/* Price row */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#6366F1" }}>
            {offerPrice ? `₹${offerPrice.toFixed(2)}` : price}
          </span>
          {offerPrice && (
            <span style={{
              fontSize: "0.78rem", color: "#9CA3AF",
              textDecoration: "line-through", fontWeight: 500,
            }}>
              {price}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          className={`pc-add-btn ${added ? "added" : ""}`}
          onClick={handleAdd}
        >
          <ShoppingCart size={15} />
          {added ? "Added ✓" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;