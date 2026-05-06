import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, PawPrint, Search, ShoppingCart, SlidersHorizontal, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../api/utils/axiosInstance";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import PetCategoryFilter from "./PetCategoryFilter";

/* ── Inject Poppins ── */
if (!document.getElementById("pcb-poppins")) {
  const s = document.createElement("style");
  s.id = "pcb-poppins";
  s.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
    .pcb-root, .pcb-root * { font-family: 'Poppins', sans-serif; box-sizing: border-box; }

    .pcb-search-input {
      width: 100%; padding: 11px 16px 11px 42px;
      border: 1.5px solid #E5E7EB; border-radius: 14px;
      font-family: 'Poppins', sans-serif; font-size: 0.88rem;
      background: #fff; color: #1F2937; outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .pcb-search-input:focus {
      border-color: #38BDF8;
      box-shadow: 0 0 0 3px rgba(56,189,248,0.12);
    }
    .pcb-search-input::placeholder { color: #9CA3AF; }

    .pcb-card {
      background: #fff; border-radius: 22px;
      border: 1px solid rgba(0,0,0,0.05);
      box-shadow: 0 2px 14px rgba(0,0,0,0.06);
      overflow: hidden; cursor: pointer;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      display: flex; flex-direction: column;
    }
    .pcb-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 40px rgba(14,165,233,0.14);
    }

    .pcb-add-btn {
      width: 100%; margin-top: 14px;
      padding: 10px; border: none; border-radius: 12px;
      font-family: 'Poppins', sans-serif; font-weight: 600;
      font-size: 0.85rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 7px;
      background: linear-gradient(135deg, #38BDF8, #0EA5E9);
      color: #fff;
      transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
      box-shadow: 0 3px 12px rgba(14,165,233,0.25);
    }
    .pcb-add-btn:hover {
      opacity: 0.93;
      box-shadow: 0 6px 20px rgba(14,165,233,0.35);
    }
    .pcb-add-btn:active { transform: scale(0.97); }

    .pcb-badge {
      display: inline-flex; align-items: center;
      padding: 3px 10px; border-radius: 999px;
      font-size: 0.7rem; font-weight: 600;
      background: #E0F2FE; color: #0369A1;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }

    .pcb-cart-fab {
      position: fixed; bottom: 28px; right: 28px; z-index: 50;
      display: flex; align-items: center; gap: 8px;
      padding: 13px 22px; border: none; border-radius: 999px;
      font-family: 'Poppins', sans-serif; font-weight: 700;
      font-size: 0.9rem; cursor: pointer; color: #fff;
      background: linear-gradient(135deg, #38BDF8, #0284C7);
      box-shadow: 0 8px 28px rgba(14,165,233,0.4);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .pcb-cart-fab:hover {
      transform: scale(1.05);
      box-shadow: 0 12px 36px rgba(14,165,233,0.5);
    }

    .pcb-skeleton {
      background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
      background-size: 200% 100%;
      animation: pcb-shimmer 1.4s ease infinite;
      border-radius: 12px;
    }
    @keyframes pcb-shimmer {
      0%   { background-position: 200% center; }
      100% { background-position: -200% center; }
    }

    .pcb-wishlist-btn {
      background: none; border: none; padding: 4px;
      cursor: pointer; display: flex; align-items: center;
      transition: transform 0.15s;
    }
    .pcb-wishlist-btn:hover { transform: scale(1.2); }

    /* ── Filter toggle button: only on mobile ── */
    .pcb-filter-toggle {
      display: none;
    }
    @media (max-width: 767px) {
      .pcb-filter-toggle {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }

    /* ── Sidebar: hidden on mobile ── */
    .pcb-sidebar-wrap {
      display: block;
    }
    @media (max-width: 767px) {
      .pcb-sidebar-wrap {
        display: none;
      }
    }

    /* ── Mobile filter drawer overlay ── */
    .pcb-drawer-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 200;
      backdrop-filter: blur(2px);
    }
    .pcb-drawer {
      position: fixed;
      top: 0; left: 0; bottom: 0;
      width: 290px;
      background: #fff;
      z-index: 210;
      overflow-y: auto;
      box-shadow: 4px 0 32px rgba(0,0,0,0.14);
    }
    .pcb-drawer-close {
      position: absolute;
      top: 14px; right: 14px;
      background: #F1F5F9; border: none;
      border-radius: 50%; width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: #6B7280;
      transition: background 0.15s;
      z-index: 1;
    }
    .pcb-drawer-close:hover { background: #E2E8F0; }
  `;
  document.head.appendChild(s);
}

const FALLBACK_IMAGE = "https://cdn-icons-png.flaticon.com/512/616/616408.png";

const fadeInUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

function SkeletonCard() {
  return (
    <div style={{ background: "#fff", borderRadius: 22, overflow: "hidden", border: "1px solid #F1F5F9" }}>
      <div className="pcb-skeleton" style={{ height: 200 }} />
      <div style={{ padding: "16px 18px" }}>
        <div className="pcb-skeleton" style={{ height: 18, width: "70%", marginBottom: 10 }} />
        <div className="pcb-skeleton" style={{ height: 13, width: "45%", marginBottom: 16 }} />
        <div className="pcb-skeleton" style={{ height: 13, width: "90%", marginBottom: 6 }} />
        <div className="pcb-skeleton" style={{ height: 13, width: "75%", marginBottom: 18 }} />
        <div className="pcb-skeleton" style={{ height: 38, borderRadius: 12 }} />
      </div>
    </div>
  );
}

export default function PetCategoryBrowser({
  category,
  title,
  itemLabel,
  accentClass = "text-sky-600",
  accentSoftClass = "border-sky-200 hover:bg-sky-50",
  accentRingClass = "accent-sky-500",
  summaryGradientClass = "from-sky-100 to-blue-100",
  pageGradientClass = "from-sky-50 via-white to-cyan-50",
  buttonGradientClass = "from-sky-400 to-blue-500",
}) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [showFilters, setShowFilters] = useState(false);
  const fetched = useRef(false);
  const navigate = useNavigate();
  const { addToCart, totalItems } = useCart();
  const { user } = useAuth();
  const { wishlist, refreshWishlist } = useWishlist();

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    async function fetchPets() {
      try {
        const response = await axiosInstance.get(`/pets/approved?category=${encodeURIComponent(category)}`);
        const items = response.data?.pets || [];
        const normalized = items.map((pet) => ({
          ...pet,
          images: Array.isArray(pet.images) ? pet.images : pet.image ? [pet.image] : [],
          specifications: Array.isArray(pet.specifications) ? pet.specifications : [],
        }));
        setPets(normalized);
        const highest = Math.max(...normalized.map((p) => Number(p.offerPrice || p.price || 0)), 50000);
        setMaxPrice(highest);
        setPriceRange([0, highest]);
      } catch {
        toast.error(`Failed to load ${itemLabel.toLowerCase()}`);
      } finally {
        setLoading(false);
      }
    }
    fetchPets();
  }, [category, itemLabel]);

  const filteredPets = useMemo(() => {
    const term = search.trim().toLowerCase();
    return pets.filter((pet) => {
      const searchable = [pet.name, pet.description, pet.category, pet.breed,
        ...(pet.specifications || []).flatMap((s) => [s.label, s.value])
      ].filter(Boolean).join(" ").toLowerCase();
      const price = Number(pet.offerPrice || pet.price || 0);
      return (!term || searchable.includes(term)) && price >= priceRange[0] && price <= priceRange[1];
    });
  }, [pets, priceRange, search]);

  const handleAddToCart = async (pet) => {
    if (!user) { toast.error("Please login to add items to cart"); navigate("/login"); return; }
    try {
      await axiosInstance.post("/cart/add", { petId: pet._id, quantity: 1 });
      addToCart(pet._id || pet.id, {
        petId: pet._id, name: pet.name,
        price: pet.offerPrice || pet.price,
        image: pet.images?.[0] || pet.image,
        category: pet.category, quantity: 1,
      });
      toast.success(`${pet.name} added to cart 🛒`);
    } catch { toast.error("Error adding to cart"); }
  };

  const handleWishlist = async (pet) => {
    if (!user) { toast.error("Please login to add to wishlist"); navigate("/login"); return; }
    const liked = wishlist.some((i) => i._id === pet._id);
    try {
      if (liked) {
        await axiosInstance.delete(`/wishlist/remove/${pet._id}`);
        toast(`${pet.name} removed from wishlist`);
      } else {
        await axiosInstance.post("/wishlist/add", { petId: pet._id });
        toast.success(`${pet.name} added to wishlist ♡`);
      }
      await refreshWishlist();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Wishlist update failed");
    }
  };

  const filterProps = {
    title, itemLabel,
    accentClass, accentSoftClass,
    accentRingClass, summaryGradientClass,
    showFilters, setShowFilters,
    priceRange, maxPrice,
    onPriceChange: setPriceRange,
    totalCount: pets.length,
    availableCount: filteredPets.length,
  };

  return (
    <div className="pcb-root" style={{
      minHeight: "100vh", display: "flex", flexDirection: "row",
      background: "linear-gradient(135deg, #F0F9FF 0%, #FFFFFF 50%, #ECFEFF 100%)",
    }}>

      {/* ── Desktop sidebar (hidden on mobile via CSS) ── */}
      <div className="pcb-sidebar-wrap">
        <PetCategoryFilter {...filterProps} />
      </div>

      {/* ── Mobile filter drawer ── */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              className="pcb-drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              className="pcb-drawer"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            >
              <button
                className="pcb-drawer-close"
                onClick={() => setShowFilters(false)}
                aria-label="Close filters"
              >
                <X size={15} />
              </button>
              {/* Render same filter component inside drawer */}
              <PetCategoryFilter {...filterProps} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, padding: "40px 28px 80px", maxWidth: "100%" }}>

        {/* Header */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible"
          transition={{ duration: 0.5 }} style={{ textAlign: "center", marginBottom: 40 }}>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#E0F2FE", borderRadius: 999, padding: "5px 16px",
            marginBottom: 14, border: "1px solid #BAE6FD",
          }}>
            <PawPrint size={14} color="#0284C7" />
            <span style={{
              fontSize: "0.75rem", fontWeight: 600, color: "#0369A1",
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}>
              {title}
            </span>
          </div>

          <h1 style={{
            fontSize: "clamp(1.7rem, 4vw, 2.6rem)", fontWeight: 800,
            color: "#0C1A2E", margin: "0 0 10px", letterSpacing: "-0.03em", lineHeight: 1.15,
          }}>
            Explore <span style={{ color: "#0EA5E9" }}>{title}</span>
          </h1>
          <p style={{
            color: "#6B7280", fontSize: "0.95rem", maxWidth: 520,
            margin: "0 auto 28px", lineHeight: 1.7, fontWeight: 400,
          }}>
            Browse verified listings, compare prices, and find your perfect companion.
          </p>

          {/* Search bar */}
          <div style={{ display: "flex", gap: 10, maxWidth: 520, margin: "0 auto", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={16} color="#9CA3AF" style={{
                position: "absolute", left: 14, top: "50%",
                transform: "translateY(-50%)", pointerEvents: "none",
              }} />
              <input
                type="text"
                className="pcb-search-input"
                placeholder={`Search ${itemLabel.toLowerCase()}…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Mobile filter toggle button */}
            <button
              className="pcb-filter-toggle"
              onClick={() => setShowFilters(true)}
              style={{
                padding: "10px 14px", borderRadius: 12,
                border: "1.5px solid #E5E7EB", background: "#fff",
                cursor: "pointer", fontSize: "0.82rem",
                fontWeight: 600, color: "#374151",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              <SlidersHorizontal size={15} /> Filters
            </button>
          </div>

          {/* Result count */}
          {!loading && (
            <p style={{ marginTop: 14, fontSize: "0.8rem", color: "#9CA3AF", fontWeight: 500 }}>
              Showing{" "}
              <strong style={{ color: "#0EA5E9" }}>{filteredPets.length}</strong>
              {" "}of {pets.length} {itemLabel.toLowerCase()}
            </p>
          )}
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
            gap: 22,
          }}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredPets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>🐾</div>
            <p style={{ color: "#9CA3AF", fontSize: "1rem", fontWeight: 500 }}>
              No {itemLabel.toLowerCase()} match your search.
            </p>
          </div>
        ) : (
          <motion.div
            variants={stagger} initial="hidden" animate="visible"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
              gap: 22,
            }}
          >
            {filteredPets.map((pet, index) => {
              const isLiked = wishlist.some((i) => i._id === pet._id);
              const image = pet.images?.[0] || pet.image || FALLBACK_IMAGE;
              const displayPrice = pet.offerPrice || pet.price;
              const hasDiscount = pet.offerPrice && pet.offerPrice > 0 && pet.offerPrice < pet.price;

              return (
                <motion.div
                  key={pet._id}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="pcb-card"
                  onClick={() => navigate(`/pets/${pet._id}`)}
                >
                  {/* Image */}
                  <div style={{
                    position: "relative", height: 196, overflow: "hidden",
                    background: "linear-gradient(135deg, #E0F2FE, #CFFAFE)",
                  }}>
                    <motion.img
                      src={image} alt={pet.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.45 }}
                    />
                    {/* Discount badge */}
                    {hasDiscount && (
                      <div style={{
                        position: "absolute", top: 10, left: 10,
                        background: "linear-gradient(135deg, #0EA5E9, #38BDF8)",
                        color: "#fff", borderRadius: 8, padding: "3px 9px",
                        fontSize: "0.7rem", fontWeight: 700,
                      }}>
                        {Math.round((1 - pet.offerPrice / pet.price) * 100)}% OFF
                      </div>
                    )}
                    {/* Wishlist */}
                    <button
                      className="pcb-wishlist-btn"
                      style={{
                        position: "absolute", top: 10, right: 10,
                        background: "rgba(255,255,255,0.88)", borderRadius: "50%",
                        width: 34, height: 34, backdropFilter: "blur(4px)",
                      }}
                      onClick={(e) => { e.stopPropagation(); handleWishlist(pet); }}
                    >
                      <Heart
                        size={16}
                        fill={isLiked ? "#EF4444" : "none"}
                        color={isLiked ? "#EF4444" : "#9CA3AF"}
                        strokeWidth={2}
                      />
                    </button>
                  </div>

                  {/* Body */}
                  <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{
                      display: "flex", alignItems: "flex-start",
                      justifyContent: "space-between", gap: 8,
                    }}>
                      <h2 style={{
                        margin: 0, fontSize: "0.97rem", fontWeight: 700,
                        color: "#0C1A2E", lineHeight: 1.3,
                        overflow: "hidden", textOverflow: "ellipsis",
                        whiteSpace: "nowrap", flex: 1,
                      }}>
                        {pet.name}
                      </h2>
                      <span className="pcb-badge">{pet.category}</span>
                    </div>

                    {/* Specs */}
                    <div style={{ marginTop: 10, flex: 1, minHeight: 40 }}>
                      {pet.specifications.length > 0 ? (
                        pet.specifications.slice(0, 2).map((spec, si) => (
                          <p key={si} style={{ margin: "0 0 4px", fontSize: "0.76rem", color: "#6B7280" }}>
                            <span style={{ fontWeight: 600, color: "#374151" }}>{spec.label}:</span> {spec.value}
                          </p>
                        ))
                      ) : (
                        <>
                          {pet.breed && (
                            <p style={{ margin: "0 0 4px", fontSize: "0.76rem", color: "#6B7280" }}>
                              <span style={{ fontWeight: 600, color: "#374151" }}>Breed:</span> {pet.breed}
                            </p>
                          )}
                          {pet.age && (
                            <p style={{ margin: 0, fontSize: "0.76rem", color: "#6B7280" }}>
                              <span style={{ fontWeight: 600, color: "#374151" }}>Age:</span> {pet.age}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Price */}
                    <div style={{ marginTop: 14, display: "flex", alignItems: "baseline", gap: 7 }}>
                      {hasDiscount && (
                        <span style={{
                          fontSize: "0.78rem", color: "#9CA3AF",
                          textDecoration: "line-through", fontWeight: 500,
                        }}>
                          ₹{Number(pet.price || 0).toLocaleString()}
                        </span>
                      )}
                      <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0284C7" }}>
                        ₹{Number(displayPrice || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Add to cart */}
                    <motion.button
                      className="pcb-add-btn"
                      whileTap={{ scale: 0.97 }}
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(pet); }}
                    >
                      <ShoppingCart size={15} /> Add to Cart
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Floating Cart FAB */}
      {totalItems > 0 && (
        <motion.button
          className="pcb-cart-fab"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/cart")}
        >
          <ShoppingCart size={18} />
          Cart
          <span style={{
            background: "#fff", color: "#0284C7",
            borderRadius: "999px", fontWeight: 800,
            fontSize: "0.78rem", padding: "1px 8px", marginLeft: 2,
          }}>
            {totalItems}
          </span>
        </motion.button>
      )}
    </div>
  );
}