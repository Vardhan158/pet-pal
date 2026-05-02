// 📁 src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, User, Heart, Bell, Search, LogOut, Package, ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../api/utils/axiosInstance";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { NOTIFICATION_EVENT } from "./RealtimeNotifications";
import LOGO from "../assets/Logo.jpg";

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
  .nb-root, .nb-root * { font-family: 'Poppins', sans-serif; box-sizing: border-box; }

  /* ── Header shell ── */
  .nb-header {
    position: sticky;
    top: 0; left: 0;
    width: 100%;
    z-index: 50;
    transition: background 0.35s, box-shadow 0.35s;
  }
  .nb-header.scrolled {
    background: rgba(255,255,255,0.88);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 1px 0 rgba(0,0,0,0.06), 0 4px 20px rgba(180,130,200,0.08);
  }
  .nb-header.top {
    background: rgba(255,255,255,0.6);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  /* Animated shimmer bar under header */
  .nb-shimmer {
    height: 2px;
    background: linear-gradient(90deg, #f9a8d4, #fbbf24, #a78bfa, #f9a8d4);
    background-size: 300% 100%;
    animation: shimmerBar 4s linear infinite;
  }
  @keyframes shimmerBar { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }

  /* ── Inner layout ── */
  .nb-inner {
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 0.6rem 1.25rem;
  }

  /* ── Logo ── */
  .nb-logo {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    cursor: pointer;
    flex-shrink: 0;
    text-decoration: none;
  }
  .nb-logo-img {
    width: 38px; height: 38px;
    border-radius: 12px;
    object-fit: cover;
    box-shadow: 0 2px 8px rgba(249,168,212,0.35);
    border: 1.5px solid rgba(255,255,255,0.8);
    transition: transform 0.2s;
  }
  .nb-logo:hover .nb-logo-img { transform: rotate(8deg) scale(1.05); }
  .nb-logo-text {
    font-size: 1.2rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, #f472b6, #f59e0b, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    white-space: nowrap;
  }

  /* ── Search ── */
  .nb-search {
    flex: 1;
    max-width: 420px;
    display: flex;
    align-items: center;
    height: 40px;
    background: rgba(255,255,255,0.85);
    border: 1.5px solid #ede9f6;
    border-radius: 100px;
    padding: 0 6px 0 14px;
    gap: 6px;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-shadow: 0 1px 4px rgba(180,130,220,0.08);
  }
  .nb-search:focus-within {
    border-color: #c4b5fd;
    box-shadow: 0 0 0 3px rgba(167,139,250,0.12);
  }
  .nb-search-icon { color: #c4b5fd; flex-shrink: 0; }
  .nb-search input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-family: 'Poppins', sans-serif;
    font-size: 0.8rem;
    color: #1a1d3a;
  }
  .nb-search input::placeholder { color: #c4b5fd; }
  .nb-search-btn {
    height: 30px;
    padding: 0 14px;
    border: none;
    border-radius: 100px;
    background: linear-gradient(135deg, #f472b6, #818cf8);
    color: #fff;
    font-family: 'Poppins', sans-serif;
    font-size: 0.72rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.12s;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .nb-search-btn:hover { opacity: 0.88; }
  .nb-search-btn:active { transform: scale(0.97); }

  /* ── Actions cluster ── */
  .nb-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
    margin-left: auto;
  }

  /* Icon button */
  .nb-icon-btn {
    position: relative;
    width: 38px; height: 38px;
    border-radius: 12px;
    border: 1.5px solid #f0ecfa;
    background: rgba(255,255,255,0.8);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: #6b7280;
    transition: background 0.15s, border-color 0.15s, transform 0.12s, color 0.15s;
  }
  .nb-icon-btn:hover { background: #fff; border-color: #c4b5fd; color: #7c3aed; transform: translateY(-1px); }
  .nb-icon-btn:active { transform: scale(0.96); }

  /* Badge */
  .nb-badge {
    position: absolute;
    top: -5px; right: -5px;
    min-width: 18px; height: 18px;
    border-radius: 99px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.62rem;
    font-weight: 700;
    color: #fff;
    padding: 0 4px;
    border: 2px solid #fff;
    pointer-events: none;
  }
  .nb-badge-pink  { background: #f472b6; }
  .nb-badge-indigo { background: #818cf8; }

  /* ── User button ── */
  .nb-user-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    height: 38px;
    padding: 0 12px 0 8px;
    border-radius: 100px;
    border: 1.5px solid #ede9f6;
    background: rgba(255,255,255,0.85);
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
  }
  .nb-user-btn:hover { background: #fff; border-color: #c4b5fd; box-shadow: 0 2px 10px rgba(167,139,250,0.15); }

  .nb-avatar {
    width: 26px; height: 26px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f9a8d4, #a78bfa);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
  }
  .nb-user-name {
    font-size: 0.78rem;
    font-weight: 600;
    color: #374151;
    max-width: 90px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .nb-chevron { color: #c4b5fd; transition: transform 0.2s; }
  .nb-chevron.open { transform: rotate(180deg); }

  /* ── Dropdown ── */
  .nb-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    width: 210px;
    background: rgba(255,255,255,0.97);
    backdrop-filter: blur(12px);
    border: 1px solid #ede9f6;
    border-radius: 18px;
    box-shadow: 0 8px 32px rgba(130,80,200,0.12), 0 2px 8px rgba(0,0,0,0.06);
    overflow: hidden;
    z-index: 60;
  }

  .nb-dropdown-header {
    padding: 0.85rem 1rem 0.6rem;
    border-bottom: 1px solid #f5f3ff;
  }
  .nb-dropdown-name {
    font-size: 0.82rem;
    font-weight: 700;
    color: #1a1d3a;
  }
  .nb-dropdown-email {
    font-size: 0.68rem;
    color: #9ca3af;
    font-weight: 400;
    margin-top: 1px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .nb-dropdown-list { padding: 0.4rem 0; }
  .nb-dropdown-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.55rem 1rem;
    font-size: 0.8rem;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
    gap: 8px;
  }
  .nb-dropdown-item:hover { background: #fdf4ff; color: #7c3aed; }
  .nb-dropdown-item.danger { color: #ef4444; }
  .nb-dropdown-item.danger:hover { background: #fff5f5; color: #dc2626; }
  .nb-dropdown-item-left { display: flex; align-items: center; gap: 8px; }
  .nb-dropdown-item svg { flex-shrink: 0; }

  .nb-dropdown-divider { height: 1px; background: #f5f3ff; margin: 0.3rem 0; }

  /* ── Hamburger ── */
  .nb-hamburger {
    display: none;
    width: 38px; height: 38px;
    border-radius: 12px;
    border: 1.5px solid #ede9f6;
    background: rgba(255,255,255,0.85);
    align-items: center; justify-content: center;
    cursor: pointer;
    color: #6b7280;
    transition: background 0.15s, border-color 0.15s;
  }
  .nb-hamburger:hover { background: #fff; border-color: #c4b5fd; color: #7c3aed; }

  /* ── Mobile drawer ── */
  .nb-drawer {
    border-top: 1px solid rgba(200,180,240,0.2);
    background: rgba(255,255,255,0.96);
    backdrop-filter: blur(16px);
    padding: 1rem 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .nb-drawer-search {
    display: flex;
    align-items: center;
    height: 42px;
    background: #f9f7ff;
    border: 1.5px solid #ede9f6;
    border-radius: 100px;
    padding: 0 6px 0 14px;
    gap: 6px;
    margin-bottom: 0.6rem;
  }
  .nb-drawer-search:focus-within { border-color: #c4b5fd; }
  .nb-drawer-search input {
    flex: 1; border: none; background: transparent; outline: none;
    font-family: 'Poppins', sans-serif; font-size: 0.82rem; color: #1a1d3a;
  }
  .nb-drawer-search input::placeholder { color: #c4b5fd; }

  .nb-drawer-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.65rem 0.75rem;
    border-radius: 12px;
    font-size: 0.82rem;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
    list-style: none;
  }
  .nb-drawer-item:hover { background: #fdf4ff; color: #7c3aed; }
  .nb-drawer-item.danger { color: #ef4444; }
  .nb-drawer-item.danger:hover { background: #fff5f5; }
  .nb-drawer-item-left { display: flex; align-items: center; gap: 10px; }

  .nb-signin-btn {
    display: flex; align-items: center; justify-content: center;
    height: 42px;
    border-radius: 100px;
    border: none;
    background: linear-gradient(135deg, #f472b6, #818cf8);
    color: #fff;
    font-family: 'Poppins', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(244,114,182,0.3);
    transition: opacity 0.15s, transform 0.12s;
    margin-top: 0.25rem;
  }
  .nb-signin-btn:hover { opacity: 0.9; }
  .nb-signin-btn:active { transform: scale(0.98); }

  .nb-drawer-divider { height: 1px; background: #f5f3ff; margin: 0.4rem 0; }

  /* ── Responsive ── */
  @media (max-width: 767px) {
    .nb-desktop-search, .nb-desktop-actions { display: none !important; }
    .nb-hamburger { display: flex; }
  }
  @media (min-width: 768px) {
    .nb-hamburger, .nb-mobile-cart { display: none !important; }
  }
`;

/* ─── Helpers ─── */
const getInitial = (user) =>
  (user?.name || user?.email || "U")[0].toUpperCase();

export default function Navbar() {
  const [menuOpen, setMenuOpen]             = useState(false);
  const [scrolled, setScrolled]             = useState(false);
  const [searchText, setSearchText]         = useState("");
  const [dropdownOpen, setDropdownOpen]     = useState(false);
  const [userOrders, setUserOrders]         = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const navigate  = useNavigate();
  const location  = useLocation();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (user) { fetchUserOrders(); fetchNotifications(); }
  }, [user]);

  useEffect(() => {
    const fn = (e) => { if (e.detail) setUnreadNotifications((n) => n + 1); };
    window.addEventListener(NOTIFICATION_EVENT, fn);
    return () => window.removeEventListener(NOTIFICATION_EVENT, fn);
  }, []);

  useEffect(() => {
    if (user && location.pathname === "/orders") fetchUserOrders();
  }, [user, location.pathname]);

  const fetchUserOrders = async () => {
    try {
      const res = await axiosInstance.get("/orders/my-orders");
      setUserOrders(res.data.orders || []);
    } catch (err) { console.error(err); }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get("/notifications");
      const n = res.data?.notifications || [];
      setUnreadNotifications(n.filter((x) => !x.read).length);
    } catch (err) { console.error(err); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchText.trim();
    if (q) { navigate(`/search?q=${encodeURIComponent(q)}`); setSearchText(""); }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully 👋");
    navigate("/");
  };

  const go = (path) => { navigate(path); setDropdownOpen(false); setMenuOpen(false); };

  /* ─── Dropdown items ─── */
  const dropdownItems = user
    ? [
        { icon: <User size={14} />, label: "My Profile", path: "/profile" },
        { icon: <Package size={14} />, label: "Orders", path: "/orders", count: userOrders.length, countClass: "nb-badge-pink" },
        { icon: <Heart size={14} />, label: "Wishlist", path: "/wishlist", count: wishlist.length, countClass: "nb-badge-pink" },
        { icon: <Bell size={14} />, label: "Notifications", path: "/notifications", count: unreadNotifications, countClass: "nb-badge-indigo",
          extra: () => setUnreadNotifications(0) },
      ]
    : [];

  return (
    <>
      <style>{css}</style>

      <motion.header
        className={`nb-root nb-header ${scrolled ? "scrolled" : "top"}`}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="nb-shimmer" />

        <div className="nb-inner">
          {/* Logo */}
          <div className="nb-logo" onClick={() => navigate("/")}>
            <img src={LOGO} alt="Pet World" className="nb-logo-img" />
            <span className="nb-logo-text">Pet World</span>
          </div>

          {/* Desktop search */}
          <form className="nb-search nb-desktop-search" onSubmit={handleSearch} style={{ display: "flex" }}>
            <Search size={14} className="nb-search-icon" />
            <input
              type="text"
              placeholder="Search pets, food, toys…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button type="submit" className="nb-search-btn">Search</button>
          </form>

          {/* Desktop actions */}
          <div className="nb-actions nb-desktop-actions">
            {/* Wishlist */}
            <button className="nb-icon-btn" onClick={() => navigate("/wishlist")} title="Wishlist">
              <Heart size={17} />
              {wishlist.length > 0 && (
                <span className={`nb-badge nb-badge-pink`}>{wishlist.length}</span>
              )}
            </button>

            {/* Cart */}
            <button className="nb-icon-btn" onClick={() => navigate("/cart")} title="Cart">
              <ShoppingCart size={17} />
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 320 }}
                  className="nb-badge nb-badge-pink"
                >
                  {totalItems}
                </motion.span>
              )}
            </button>

            {/* Notifications */}
            {user && (
              <button
                className="nb-icon-btn"
                onClick={() => { navigate("/notifications"); setUnreadNotifications(0); }}
                title="Notifications"
              >
                <Bell size={17} />
                {unreadNotifications > 0 && (
                  <span className="nb-badge nb-badge-indigo">{unreadNotifications}</span>
                )}
              </button>
            )}

            {/* User dropdown */}
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button className="nb-user-btn">
                <div className="nb-avatar">{getInitial(user)}</div>
                <span className="nb-user-name">
                  {user ? user.name || user.email?.split("@")[0] : "Account"}
                </span>
                <ChevronDown size={13} className={`nb-chevron${dropdownOpen ? " open" : ""}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    className="nb-dropdown"
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                  >
                    {user && (
                      <div className="nb-dropdown-header">
                        <div className="nb-dropdown-name">{user.name || "Welcome back"}</div>
                        <div className="nb-dropdown-email">{user.email}</div>
                      </div>
                    )}

                    <div className="nb-dropdown-list">
                      {!user ? (
                        <div
                          className="nb-dropdown-item"
                          onClick={() => { go("/login"); }}
                        >
                          <div className="nb-dropdown-item-left">
                            <User size={14} /> Sign In
                          </div>
                        </div>
                      ) : (
                        <>
                          {dropdownItems.map((item, i) => (
                            <div
                              key={i}
                              className="nb-dropdown-item"
                              onClick={() => { item.extra?.(); go(item.path); }}
                            >
                              <div className="nb-dropdown-item-left">
                                {item.icon}{item.label}
                              </div>
                              {item.count > 0 && (
                                <span className={`nb-badge ${item.countClass}`} style={{ position: "static", border: "none", minWidth: 20, height: 20 }}>
                                  {item.count}
                                </span>
                              )}
                            </div>
                          ))}
                          <div className="nb-dropdown-divider" />
                          <div className="nb-dropdown-item danger" onClick={handleLogout}>
                            <div className="nb-dropdown-item-left">
                              <LogOut size={14} /> Logout
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="nb-actions" style={{ marginLeft: "auto" }}>
            <button className="nb-icon-btn nb-mobile-cart" onClick={() => navigate("/cart")}>
              <ShoppingCart size={17} />
              {totalItems > 0 && <span className="nb-badge nb-badge-pink">{totalItems}</span>}
            </button>
            <button className="nb-hamburger" onClick={() => setMenuOpen((p) => !p)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="nb-root nb-drawer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              {/* Mobile search */}
              <form className="nb-drawer-search" onSubmit={handleSearch}>
                <Search size={14} style={{ color: "#c4b5fd", flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search pets, food, toys…"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <button type="submit" className="nb-search-btn">Go</button>
              </form>

              {!user ? (
                <button className="nb-signin-btn" onClick={() => { go("/login"); }}>
                  Sign In
                </button>
              ) : (
                <>
                  {/* User info row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.5rem 0.75rem 0.25rem" }}>
                    <div className="nb-avatar" style={{ width: 34, height: 34, fontSize: "0.85rem" }}>{getInitial(user)}</div>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1a1d3a" }}>{user.name || "User"}</div>
                      <div style={{ fontSize: "0.68rem", color: "#9ca3af" }}>{user.email}</div>
                    </div>
                  </div>
                  <div className="nb-drawer-divider" />

                  {dropdownItems.map((item, i) => (
                    <div
                      key={i}
                      className="nb-drawer-item"
                      onClick={() => { item.extra?.(); go(item.path); }}
                    >
                      <div className="nb-drawer-item-left">{item.icon}{item.label}</div>
                      {item.count > 0 && (
                        <span className={`nb-badge ${item.countClass}`} style={{ position: "static", border: "none", minWidth: 20, height: 20 }}>
                          {item.count}
                        </span>
                      )}
                    </div>
                  ))}

                  <div className="nb-drawer-divider" />
                  <div className="nb-drawer-item danger" onClick={handleLogout}>
                    <div className="nb-drawer-item-left"><LogOut size={15} /> Logout</div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}