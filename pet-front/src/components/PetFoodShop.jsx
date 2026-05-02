// src/pages/shop/PetFoodShop.jsx
import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Minus, Plus } from "lucide-react";
import { useCart } from "../context/CartContext";

/* ── Inject Poppins + styles ── */
if (!document.getElementById("pfs-styles")) {
  const s = document.createElement("style");
  s.id = "pfs-styles";
  s.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

    .pfs-root, .pfs-root * { font-family: 'Poppins', sans-serif; box-sizing: border-box; }

    .pfs-card {
      background: #fff;
      border-radius: 22px;
      overflow: hidden;
      border: 1px solid rgba(0,0,0,0.05);
      box-shadow: 0 2px 16px rgba(0,0,0,0.06);
      display: flex; flex-direction: column;
      transition: transform 0.28s ease, box-shadow 0.28s ease;
    }
    .pfs-card:hover {
      transform: translateY(-7px);
      box-shadow: 0 18px 48px rgba(245,158,11,0.14);
    }

    .pfs-img-wrap {
      position: relative; overflow: hidden;
      height: 200px;
      background: linear-gradient(135deg, #FEF3C7, #FDE68A);
    }
    .pfs-img-wrap img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.45s ease;
      display: block;
    }
    .pfs-card:hover .pfs-img-wrap img { transform: scale(1.07); }

    .pfs-category-badge {
      position: absolute; top: 12px; left: 12px;
      padding: 3px 12px; border-radius: 999px;
      font-size: 0.7rem; font-weight: 700;
      letter-spacing: 0.04em;
      backdrop-filter: blur(8px);
    }

    .pfs-add-btn {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 9px 18px; border-radius: 12px;
      border: 1.5px solid #FDE68A;
      background: #FFFBEB; color: #92400E;
      font-family: 'Poppins', sans-serif;
      font-size: 0.82rem; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
      white-space: nowrap;
    }
    .pfs-add-btn:hover {
      background: #FEF3C7;
      border-color: #FCD34D;
      box-shadow: 0 3px 12px rgba(245,158,11,0.2);
    }

    .pfs-qty-ctrl {
      display: flex; align-items: center; gap: 2px;
      background: #FFFBEB;
      border: 1.5px solid #FDE68A;
      border-radius: 12px;
      overflow: hidden;
    }
    .pfs-qty-btn {
      width: 32px; height: 34px;
      display: flex; align-items: center; justify-content: center;
      border: none; background: transparent; cursor: pointer;
      color: #92400E; font-weight: 700;
      transition: background 0.15s;
      font-family: 'Poppins', sans-serif;
    }
    .pfs-qty-btn:hover { background: #FEF3C7; }
    .pfs-qty-num {
      min-width: 28px; text-align: center;
      font-size: 0.9rem; font-weight: 700;
      color: #78350F;
    }

    .pfs-star { transition: transform 0.1s; }
    .pfs-star:hover { transform: scale(1.2); }

    .pfs-cart-fab {
      position: fixed; bottom: 28px; right: 28px; z-index: 50;
      display: flex; align-items: center; gap: 10px;
      padding: 13px 24px; border-radius: 999px; border: none;
      background: linear-gradient(135deg, #F59E0B, #D97706);
      color: #fff; cursor: pointer;
      font-family: 'Poppins', sans-serif;
      font-size: 0.9rem; font-weight: 700;
      box-shadow: 0 8px 28px rgba(217,119,6,0.4);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .pfs-cart-fab:hover {
      transform: scale(1.05);
      box-shadow: 0 12px 36px rgba(217,119,6,0.5);
    }

    .pfs-skeleton {
      background: linear-gradient(90deg, #FEF3C7 25%, #FDE68A 50%, #FEF3C7 75%);
      background-size: 200% 100%;
      animation: pfs-shimmer 1.4s ease infinite;
      border-radius: 12px;
    }
    @keyframes pfs-shimmer {
      0%   { background-position: 200% center; }
      100% { background-position: -200% center; }
    }

    /* Category badge colors */
    .badge-dog    { background: rgba(254,240,138,0.9); color: #92400E; border: 1px solid rgba(252,211,77,0.6); }
    .badge-cat    { background: rgba(252,231,243,0.9); color: #9D174D; border: 1px solid rgba(249,168,212,0.6); }
    .badge-fish   { background: rgba(207,250,254,0.9); color: #164E63; border: 1px solid rgba(103,232,249,0.6); }
    .badge-bird   { background: rgba(220,252,231,0.9); color: #14532D; border: 1px solid rgba(134,239,172,0.6); }
    .badge-default{ background: rgba(243,244,246,0.9); color: #374151; border: 1px solid rgba(209,213,219,0.6); }
  `;
  document.head.appendChild(s);
}

const foods = [
  {
    id: 1,
    name: "Pedigree Adult Dog Food",
    price: 799,
    image: "https://media.istockphoto.com/id/1055029940/photo/dog-food-in-a-stainless-steel-bowl.jpg?s=612x612&w=0&k=20&c=mdvzj_X6mUCKtolgUewK3YhcnsKBevjvCTNZG0dinxA=",
    category: "Dog",
    desc: "Wholesome, balanced nutrition for strong and healthy adult dogs.",
    rating: 4.5,
  },
  {
    id: 2,
    name: "Whiskas Tuna Cat Food",
    price: 499,
    image: "https://media.istockphoto.com/id/1226997452/photo/cat-food-and-two-cats.jpg?s=612x612&w=0&k=20&c=Eu-kmy2j1Y_ln3EtW8Ld_pPTNSR7JM4rT_FNs1XjWuI=",
    category: "Cat",
    desc: "Delicious tuna blend that supports energy and a healthy, shiny coat.",
    rating: 4.3,
  },
  {
    id: 3,
    name: "TetraBits Fish Food",
    price: 299,
    image: "https://media.istockphoto.com/id/181954091/photo/feeding-fish.jpg?s=612x612&w=0&k=20&c=xdevo53zEeHf6pv8P-8g_KdjACSHbiSqxzusLH-kwrE=",
    category: "Fish",
    desc: "Nutrient-rich floating granules that enhance fish color and vitality.",
    rating: 4.6,
  },
  {
    id: 4,
    name: "Kaytee Bird Seed Mix",
    price: 399,
    image: "https://media.istockphoto.com/id/160353256/photo/pile-of-bird-seed-including-sunflower-seeds-wheat-and-maize.jpg?s=612x612&w=0&k=20&c=fZLcqumeiS4sYnUWjeuh5ja1XDKEBAmotd2ZxuOCm0k=",
    category: "Bird",
    desc: "Premium seed mix promoting strong feathers and lively chirping.",
    rating: 4.2,
  },
];

function badgeClass(category) {
  const map = { Dog: "badge-dog", Cat: "badge-cat", Fish: "badge-fish", Bird: "badge-bird" };
  return `pfs-category-badge ${map[category] || "badge-default"}`;
}

function StarRating({ rating }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 8 }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = rating >= i + 1;
        const half = !filled && rating > i;
        return (
          <Star
            key={i}
            size={14}
            className="pfs-star"
            fill={filled ? "#F59E0B" : half ? "url(#half)" : "none"}
            stroke="#F59E0B"
            strokeWidth={1.5}
          />
        );
      })}
      <span style={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 600, marginLeft: 5 }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

const cardVariant = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const PetFoodShop = () => {
  const { cart, addToCart, removeFromCart, totalItems } = useCart();

  const totalCartValue = Object.entries(cart).reduce((sum, [id, item]) => {
    const food = foods.find((f) => f.id === Number(id));
    return sum + (food?.price || 0) * (item.quantity || 0);
  }, 0);

  return (
    <section className="pfs-root" style={{
      minHeight: "100vh",
      background: "linear-gradient(145deg, #FFFBEB 0%, #FFFFFF 55%, #FEF9C3 100%)",
      padding: "64px 20px 100px",
    }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        style={{ textAlign: "center", marginBottom: 56 }}
      >
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#FEF3C7", borderRadius: 999, padding: "5px 18px",
          marginBottom: 16, border: "1px solid #FDE68A",
        }}>
          <span style={{ fontSize: "1rem" }}>🐾</span>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#92400E",
            letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Pet Food Store
          </span>
        </div>

        <h1 style={{
          fontSize: "clamp(1.9rem, 5vw, 3rem)",
          fontWeight: 800, color: "#1C1917",
          margin: "0 0 14px", letterSpacing: "-0.03em", lineHeight: 1.15,
        }}>
          Nourish Your <span style={{ color: "#D97706" }}>Best Friend</span>
        </h1>

        <p style={{
          color: "#78716C", fontSize: "0.97rem", maxWidth: 520,
          margin: "0 auto", lineHeight: 1.75, fontWeight: 400,
        }}>
          Trusted brands and wholesome meals for your furry, feathered, and finned companions.
        </p>
      </motion.div>

      {/* ── Product Grid ── */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 24,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {foods.map((food) => {
          const quantity = cart[food.id]?.quantity || 0;

          return (
            <motion.div
              key={food.id}
              variants={cardVariant}
              transition={{ duration: 0.42 }}
              className="pfs-card"
            >
              {/* Image */}
              <div className="pfs-img-wrap">
                <img src={food.image} alt={food.name} />
                <span className={badgeClass(food.category)}>{food.category}</span>
              </div>

              {/* Body */}
              <div style={{ padding: "18px 20px 22px", display: "flex", flexDirection: "column", flex: 1 }}>
                <h3 style={{
                  margin: "0 0 6px", fontSize: "0.98rem", fontWeight: 700,
                  color: "#1C1917", lineHeight: 1.3,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {food.name}
                </h3>

                <p style={{
                  margin: "0 0 4px", fontSize: "0.8rem", color: "#78716C",
                  lineHeight: 1.6, fontWeight: 400,
                  display: "-webkit-box", WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {food.desc}
                </p>

                <StarRating rating={food.rating} />

                {/* Price + controls */}
                <div style={{
                  marginTop: 18, display: "flex",
                  alignItems: "center", justifyContent: "space-between", gap: 10,
                }}>
                  <div>
                    <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#D97706" }}>
                      ₹{food.price}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "#9CA3AF", fontWeight: 500, marginLeft: 4 }}>
                      /pack
                    </span>
                  </div>

                  {quantity === 0 ? (
                    <button className="pfs-add-btn" onClick={() => addToCart(food.id, food)}>
                      <ShoppingCart size={14} /> Add
                    </button>
                  ) : (
                    <div className="pfs-qty-ctrl">
                      <button className="pfs-qty-btn" onClick={() => removeFromCart(food.id)}>
                        <Minus size={13} />
                      </button>
                      <span className="pfs-qty-num">{quantity}</span>
                      <button className="pfs-qty-btn" onClick={() => addToCart(food.id, food)}>
                        <Plus size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Floating Cart FAB ── */}
      {totalItems > 0 && (
        <motion.button
          className="pfs-cart-fab"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 130, damping: 18 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => (window.location.href = "/cart")}
        >
          <ShoppingCart size={18} />
          <span>{totalItems} {totalItems === 1 ? "item" : "items"}</span>
          <span style={{
            background: "rgba(255,255,255,0.22)", borderRadius: 8,
            padding: "2px 10px", fontSize: "0.85rem", fontWeight: 700,
            borderLeft: "1px solid rgba(255,255,255,0.25)", marginLeft: 4,
          }}>
            ₹{totalCartValue.toLocaleString()}
          </span>
        </motion.button>
      )}
    </section>
  );
};

export default PetFoodShop;