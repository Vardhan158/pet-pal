import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import axiosInstance from "../api/utils/axiosInstance";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

void motion;

/* ─── Font inject ─── */
if (!document.querySelector("#poppins-font")) {
  const l = document.createElement("link");
  l.id = "poppins-font";
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap";
  document.head.appendChild(l);
}

/* ─── Styles ─── */
const css = `
  .wl-root, .wl-root * { font-family: 'Poppins', sans-serif; box-sizing: border-box; }

  .wl-page {
    min-height: 100vh;
    background: #f6f7ff;
    padding: 2.5rem 1.25rem 5rem;
  }

  .wl-inner { max-width: 1100px; margin: 0 auto; }

  /* ── Header ── */
  .wl-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 2.25rem;
    flex-wrap: wrap;
  }

  .wl-header-left {}
  .wl-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #fff0f6;
    border: 1px solid #fecdd3;
    color: #e11d48;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 100px;
    margin-bottom: 0.7rem;
  }
  .wl-title {
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 800;
    color: #1a1d3a;
    letter-spacing: -0.03em;
    margin: 0 0 0.3rem;
    line-height: 1.15;
  }
  .wl-title em {
    font-style: normal;
    background: linear-gradient(135deg, #f472b6, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .wl-subtitle {
    font-size: 0.78rem;
    color: #9da3ba;
    font-weight: 400;
    margin: 0;
  }

  .wl-clear-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'Poppins', sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    color: #ef4444;
    background: #fff5f5;
    border: 1.5px solid #fecaca;
    border-radius: 100px;
    padding: 0.5rem 1.1rem;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.12s;
    white-space: nowrap;
    align-self: flex-start;
    margin-top: 2px;
  }
  .wl-clear-btn:hover { background: #fee2e2; border-color: #fca5a5; }
  .wl-clear-btn:active { transform: scale(0.97); }

  /* ── Grid ── */
  .wl-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.25rem;
  }

  /* ── Card ── */
  .wl-card {
    background: #fff;
    border: 1px solid #eaecf5;
    border-radius: 22px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(99,102,241,0.05);
    transition: box-shadow 0.22s ease, transform 0.22s cubic-bezier(.34,1.4,.64,1);
    display: flex;
    flex-direction: column;
  }
  .wl-card:hover {
    box-shadow: 0 10px 32px rgba(99,102,241,0.1);
    transform: translateY(-4px);
  }

  .wl-card-img-wrap {
    position: relative;
    height: 185px;
    overflow: hidden;
    background: #f0f2fa;
    cursor: pointer;
  }
  .wl-card-img-wrap img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.45s ease;
  }
  .wl-card:hover .wl-card-img-wrap img { transform: scale(1.06); }

  /* Category pill on image */
  .wl-card-cat {
    position: absolute;
    top: 10px; left: 10px;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,0.8);
    border-radius: 8px;
    padding: 3px 10px;
    font-size: 0.65rem;
    font-weight: 600;
    color: #6366f1;
    text-transform: capitalize;
    pointer-events: none;
  }

  /* Remove button on image */
  .wl-remove-fab {
    position: absolute;
    top: 10px; right: 10px;
    width: 32px; height: 32px;
    border-radius: 50%;
    border: none;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(6px);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #f43f5e;
    transition: background 0.15s, transform 0.12s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .wl-remove-fab:hover { background: #fff1f3; transform: scale(1.1); }
  .wl-remove-fab:active { transform: scale(0.95); }

  /* Card body */
  .wl-card-body {
    padding: 1rem 1.1rem 1.2rem;
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 0.3rem;
  }
  .wl-card-name {
    font-size: 0.95rem;
    font-weight: 700;
    color: #1a1d3a;
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0;
  }
  .wl-card-price {
    font-size: 0.82rem;
    font-weight: 600;
    color: #6366f1;
    margin: 0;
  }

  .wl-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 0.75rem;
    border-top: 1px solid #f0f2fa;
    gap: 0.5rem;
  }
  .wl-view-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.78rem;
    font-weight: 600;
    color: #6366f1;
    text-decoration: none;
    transition: color 0.15s;
  }
  .wl-view-link:hover { color: #4f46e5; }

  .wl-add-cart-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: 'Poppins', sans-serif;
    font-size: 0.72rem;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #6366f1, #818cf8);
    border: none;
    border-radius: 8px;
    padding: 0.4rem 0.85rem;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.12s;
    box-shadow: 0 3px 8px rgba(99,102,241,0.25);
  }
  .wl-add-cart-btn:hover { opacity: 0.9; }
  .wl-add-cart-btn:active { transform: scale(0.97); }
  .wl-add-cart-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }

  /* ── Empty state ── */
  .wl-empty {
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 0.6rem;
    padding: 2rem;
  }
  .wl-empty-icon {
    width: 80px; height: 80px;
    border-radius: 50%;
    background: #fff0f6;
    border: 2px solid #fecdd3;
    display: flex; align-items: center; justify-content: center;
    font-size: 2.2rem;
    margin-bottom: 0.5rem;
  }
  .wl-empty h3 {
    font-size: 1.1rem; font-weight: 700; color: #1a1d3a; margin: 0;
  }
  .wl-empty p {
    font-size: 0.8rem; color: #9da3ba; margin: 0; max-width: 260px; line-height: 1.65;
  }
  .wl-browse-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'Poppins', sans-serif;
    font-size: 0.82rem;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, #f472b6, #818cf8);
    border: none;
    border-radius: 100px;
    padding: 0.7rem 1.6rem;
    cursor: pointer;
    text-decoration: none;
    box-shadow: 0 6px 18px rgba(244,114,182,0.3);
    transition: opacity 0.15s, transform 0.12s;
    margin-top: 0.5rem;
  }
  .wl-browse-btn:hover { opacity: 0.9; }
  .wl-browse-btn:active { transform: scale(0.97); }

  /* Card entrance stagger */
  .wl-card-wrap { animation: wlCardIn 0.4s ease both; }
  @keyframes wlCardIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const Wishlist = () => {
  const { wishlist, clearWishlist, refreshWishlist } = useWishlist();
  const { addToCart, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [addingPetIds, setAddingPetIds] = React.useState({});

  React.useEffect(() => {
    if (user) refreshWishlist();
  }, [user, refreshWishlist]);

  const handleRemove = async (petId) => {
    if (!user) { toast.error("Please login to modify wishlist"); return; }
    try {
      await axiosInstance.delete(`/wishlist/remove/${petId}`);
      await refreshWishlist();
      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove item");
    }
  };

  const handleAddToCart = async (pet) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    const petId = pet._id || pet.id;
    if (!petId) {
      toast.error("Unable to add this pet to cart");
      return;
    }

    if (addingPetIds[petId]) return;

    const cartItem = {
      petId,
      name: pet.name || pet.title,
      price: pet.offerPrice && pet.offerPrice > 0 ? pet.offerPrice : pet.price,
      image: pet.images?.[0] || pet.image,
      category: pet.category || pet.type,
      quantity: 1,
    };

    setAddingPetIds((prev) => ({ ...prev, [petId]: true }));
    addToCart(petId, cartItem);
    toast.success(`${cartItem.name || "Pet"} added to cart`);

    try {
      await axiosInstance.post("/cart/add", { petId, quantity: 1 });
    } catch (err) {
      removeFromCart(petId);
      toast.error(err?.response?.data?.message || "Failed to sync cart. Please try again.");
    } finally {
      setAddingPetIds((prev) => {
        const next = { ...prev };
        delete next[petId];
        return next;
      });
    }
  };

  /* ── Empty state ── */
  if (wishlist.length === 0) return (
    <div className="wl-root wl-page">
      <style>{css}</style>
      <div className="wl-inner">
        <div className="wl-empty">
          <div className="wl-empty-icon">🐾</div>
          <h3>Your wishlist is empty</h3>
          <p>Save your favourite pets here so you can find them easily later.</p>
          <Link to="/" className="wl-browse-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M3 12h18M3 6h18M3 18h18" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Browse Pets
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="wl-root wl-page">
      <style>{css}</style>

      <div className="wl-inner">
        {/* Header */}
        <div className="wl-header">
          <div className="wl-header-left">
            <div className="wl-badge">
              <svg width="7" height="7" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#e11d48"/></svg>
              Wishlist
            </div>
            <h1 className="wl-title">
              Your <em>Favourites</em>
            </h1>
            <p className="wl-subtitle">
              {wishlist.length} {wishlist.length === 1 ? "pet" : "pets"} saved
            </p>
          </div>

          <motion.button
            className="wl-clear-btn"
            onClick={clearWishlist}
            whileTap={{ scale: 0.97 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Clear All
          </motion.button>
        </div>

        {/* Grid */}
        <div className="wl-grid">
          <AnimatePresence>
            {wishlist.map((pet, i) => (
              <div
                key={pet._id}
                className="wl-card-wrap"
                style={{ animationDelay: `${i * 55}ms` }}
              >
                <div className="wl-card">
                  {/* Image */}
                  <Link to={`/pets/${pet._id}`} state={{ pet }} className="wl-card-img-wrap">
                    <img
                      src={pet.image}
                      alt={pet.name}
                      onError={(e) => (e.target.src = "https://cdn-icons-png.flaticon.com/512/616/616408.png")}
                    />
                    {pet.category && (
                      <div className="wl-card-cat">{pet.category}</div>
                    )}
                    <button
                      className="wl-remove-fab"
                      onClick={(e) => { e.preventDefault(); handleRemove(pet._id); }}
                      title="Remove from wishlist"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill="#f43f5e"/>
                      </svg>
                    </button>
                  </Link>

                  {/* Body */}
                  <div className="wl-card-body">
                    <h3 className="wl-card-name">{pet.name}</h3>
                    {pet.price && (
                      <p className="wl-card-price">
                        ₹{Number(pet.price).toLocaleString()}
                      </p>
                    )}

                    <div className="wl-card-footer">
                      <Link to={`/pets/${pet._id}`} state={{ pet }} className="wl-view-link">
                        View Details
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link>

                      <button
                        className="wl-add-cart-btn"
                        onClick={() => handleAddToCart(pet)}
                        disabled={Boolean(addingPetIds[pet._id || pet.id])}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="3" y1="6" x2="21" y2="6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M16 10a4 4 0 01-8 0" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {addingPetIds[pet._id || pet.id] ? "Adding..." : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
