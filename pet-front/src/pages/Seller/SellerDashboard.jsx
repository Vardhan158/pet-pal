// src/pages/Seller/SellerDashboard.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPaw, FaPlusCircle, FaChartLine, FaBoxOpen } from "react-icons/fa";
import { LogOut } from "lucide-react";
import SellerProducts from "./SellerProducts";
import SellerOrders from "./SellerOrders";
import SellerAddProduct from "./SellerAddProduct";
import SellerAnalytics from "./SellerAnalytics";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  { key: "products",   label: "My Products",    icon: <FaPaw /> },
  { key: "orders",     label: "Orders",          icon: <FaBoxOpen /> },
  { key: "addProduct", label: "Add Product",     icon: <FaPlusCircle /> },
  { key: "analytics",  label: "Sales Analytics", icon: <FaChartLine /> },
];

function SellerLayout({ children, currentView, onLogout, setView = () => {} }) {
  const handleNav = (key) => setView?.(key);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .sl-root {
          display: flex;
          min-height: 100vh;
          background: #f5f6fa;
          font-family: 'Poppins', sans-serif;
        }

        /* ════════════════════════════
           SIDEBAR (desktop)
        ════════════════════════════ */
        .sl-sidebar {
          width: 230px;
          flex-shrink: 0;
          background: #fff;
          border-right: 1px solid #eef0f6;
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1rem 2rem;
          box-shadow: 2px 0 12px rgba(0,0,0,0.04);
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          z-index: 10;
        }

        .sl-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 0.5rem 1.5rem;
          border-bottom: 1px solid #f0f1f7;
          margin-bottom: 1.25rem;
        }
        .sl-brand-icon {
          width: 38px; height: 38px; flex-shrink: 0;
          background: linear-gradient(135deg, #f5a623, #f76b1c);
          border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem;
        }
        .sl-brand-name { font-size: 1rem; font-weight: 700; color: #1a1a2e; letter-spacing: -0.3px; margin: 0; }
        .sl-brand-sub  { font-size: 0.68rem; color: #9499b0; margin: 0; }

        .sl-nav-label {
          font-size: 0.65rem; font-weight: 600; color: #b8bdd0;
          text-transform: uppercase; letter-spacing: 0.7px;
          padding: 0 0.75rem; margin-bottom: 0.5rem;
        }

        .sl-nav { display: flex; flex-direction: column; gap: 3px; }

        .sl-nav-btn {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 9px 12px;
          border: none; border-radius: 11px;
          font-family: 'Poppins', sans-serif;
          font-size: 0.83rem; font-weight: 500; color: #5a607a;
          background: transparent; cursor: pointer;
          transition: background 0.15s, color 0.15s; text-align: left;
        }
        .sl-nav-btn:hover  { background: #f8f9fc; color: #1a1a2e; }
        .sl-nav-btn.active { background: #fff0e0; color: #c2590a; font-weight: 600; }

        .sl-nav-icon {
          width: 30px; height: 30px; flex-shrink: 0;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem;
          background: #f1f3f9; color: #9499b0;
          transition: background 0.15s, color 0.15s;
        }
        .sl-nav-btn.active .sl-nav-icon { background: #f5a623; color: #fff; }

        /* Sidebar logout */
        .sl-sidebar-logout {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 9px 12px;
          border: none; border-radius: 11px;
          font-family: 'Poppins', sans-serif;
          font-size: 0.83rem; font-weight: 500;
          background: #fff1f1; color: #d44545;
          cursor: pointer; text-align: left;
          transition: background 0.15s;
          margin-top: 6px;
        }
        .sl-sidebar-logout:hover { background: #ffe0e0; }
        .sl-sidebar-logout-icon {
          width: 30px; height: 30px; flex-shrink: 0;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem;
          background: #fad5d5; color: #d44545;
        }

        .sl-sidebar-footer {
          margin-top: auto;
          padding: 0.75rem;
          background: #fdf9f5; border: 1px solid #f0e0c8;
          border-radius: 13px; font-size: 0.72rem; color: #c2590a;
          text-align: center; line-height: 1.5;
        }
        .sl-sidebar-footer strong { display: block; font-weight: 600; margin-bottom: 2px; }

        /* ── Main content ── */
        .sl-main {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
          min-width: 0;
        }

        /* ════════════════════════════
           TABLET (≤ 900px)
        ════════════════════════════ */
        @media (max-width: 900px) {
          .sl-sidebar {
            width: 68px;
            padding: 1.25rem 0.5rem 1.5rem;
            align-items: center;
          }
          .sl-brand { justify-content: center; padding-bottom: 1rem; }
          .sl-brand > div            { display: none; }
          .sl-nav-label              { display: none; }
          .sl-nav-btn                { justify-content: center; padding: 9px; }
          .sl-nav-btn span:last-child { display: none; }
          .sl-nav-icon               { width: 34px; height: 34px; font-size: 0.9rem; }
          .sl-sidebar-logout         { justify-content: center; padding: 9px; }
          .sl-sidebar-logout span:last-child { display: none; }
          .sl-sidebar-logout-icon    { width: 34px; height: 34px; }
          .sl-sidebar-footer         { display: none; }
          .sl-main                   { padding: 1.5rem 1.25rem; }
        }

        /* ── Mobile top bar ── */
        .sl-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fff;
          border-bottom: 1px solid #eef0f6;
          padding: 0.75rem 1rem;
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .sl-topbar-brand {
          display: flex; align-items: center; gap: 8px;
        }
        .sl-topbar-icon {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #f5a623, #f76b1c);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem;
        }
        .sl-topbar-name { font-size: 0.95rem; font-weight: 700; color: #1a1a2e; margin: 0; }
        .sl-topbar-sub  { font-size: 0.62rem; color: #9499b0; margin: 0; }

        .sl-topbar-logout {
          background: #fff1f1;
          border: 1px solid #fad5d5;
          color: #d44545;
          border-radius: 9px;
          padding: 6px 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
        }
        .sl-topbar-logout:hover { background: #ffe0e0; }

        /* ── Mobile bottom nav ── */
        .sl-bottom-nav {
          display: flex;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: #fff;
          border-top: 1px solid #eef0f6;
          box-shadow: 0 -2px 16px rgba(0,0,0,0.06);
          z-index: 50;
          height: 62px;
        }
        .sl-bottom-btn {
          flex: 1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 3px;
          border: none; background: transparent;
          font-family: 'Poppins', sans-serif;
          font-size: 0.58rem; font-weight: 500; color: #9499b0;
          cursor: pointer;
          transition: color 0.15s;
          padding: 6px 2px;
        }
        .sl-bottom-btn.active { color: #c2590a; }
        .sl-bottom-btn.active .sl-bottom-icon { background: #fff0e0; color: #f76b1c; }
        .sl-bottom-icon {
          width: 34px; height: 28px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.95rem; color: #9499b0;
          transition: background 0.15s, color 0.15s;
        }

        .sl-main-mobile {
          padding: 1rem 1rem 80px;
        }
        .sl-main-desktop {
          padding: 2rem;
        }
      `}</style>

      {isMobile ? (
        /* ══════════════════════════════
           MOBILE LAYOUT
        ══════════════════════════════ */
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f5f6fa', fontFamily: "'Poppins', sans-serif" }}>
          {/* Mobile top bar */}
          <div className="sl-topbar">
            <div className="sl-topbar-brand">
              <div className="sl-topbar-icon">🐾</div>
              <div>
                <p className="sl-topbar-name">PetWorld</p>
                <p className="sl-topbar-sub">Seller Panel</p>
              </div>
            </div>
            <button className="sl-topbar-logout" onClick={onLogout} aria-label="Logout">
              <LogOut size={15} />
            </button>
          </div>

          {/* Main content */}
          <main style={{ flex: 1 }}>
            <div className="sl-main-mobile">
              {children}
            </div>
          </main>

          {/* Mobile bottom nav */}
          <nav className="sl-bottom-nav">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`sl-bottom-btn ${currentView === item.key ? "active" : ""}`}
              >
                <span className="sl-bottom-icon">{item.icon}</span>
                <span>{item.label.split(" ")[0]}</span>
              </button>
            ))}
          </nav>
        </div>
      ) : (
        /* ══════════════════════════════
           DESKTOP / TABLET LAYOUT
        ══════════════════════════════ */
        <div className="sl-root">
          <motion.aside
            className="sl-sidebar"
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <div className="sl-brand">
              <div className="sl-brand-icon">🐾</div>
              <div>
                <p className="sl-brand-name">PetWorld</p>
                <p className="sl-brand-sub">Seller Panel</p>
              </div>
            </div>

            <p className="sl-nav-label">Menu</p>
            <nav className="sl-nav">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNav(item.key)}
                  className={`sl-nav-btn ${currentView === item.key ? "active" : ""}`}
                  title={item.label}
                >
                  <span className="sl-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}

              <button className="sl-sidebar-logout" onClick={onLogout} title="Logout">
                <span className="sl-sidebar-logout-icon"><LogOut size={14} /></span>
                <span>Logout</span>
              </button>
            </nav>

            <div className="sl-sidebar-footer">
              <strong>Need help?</strong>
              Contact seller support
            </div>
          </motion.aside>

          <main className="sl-main">
            <div style={{ height: '100%' }}>
              {children}
            </div>
          </main>
        </div>
      )}
    </>
  );
}

export default function SellerDashboard() {
  const [currentView, setCurrentView] = useState("products");
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const renderContent = () => {
    switch (currentView) {
      case "products":   return <SellerProducts />;
      case "orders":     return <SellerOrders />;
      case "addProduct": return <SellerAddProduct />;
      case "analytics":  return <SellerAnalytics />;
      default:           return <SellerProducts />;
    }
  };

  return (
    <SellerLayout
      currentView={currentView}
      setView={setCurrentView}
      onLogout={handleLogout}
    >
      {renderContent()}
    </SellerLayout>
  );
}