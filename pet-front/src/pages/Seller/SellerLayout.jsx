import React from "react";
import { motion } from "framer-motion";
import { FaPaw, FaPlusCircle, FaChartLine, FaBoxOpen } from "react-icons/fa";

const menuItems = [
  { key: "products",   label: "My Products",    icon: <FaPaw /> },
  { key: "orders",     label: "Orders",         icon: <FaBoxOpen /> },
  { key: "addProduct", label: "Add Product",    icon: <FaPlusCircle /> },
  { key: "analytics",  label: "Sales Analytics",icon: <FaChartLine /> },
];

export default function SellerLayout({ children, setView, currentView }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }

        .sl-root {
          display: flex;
          min-height: 100vh;
          background: #f5f6fa;
          font-family: 'Poppins', sans-serif;
        }

        /* ── Sidebar ── */
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
        }

        /* ── Brand ── */
        .sl-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 0.5rem 1.5rem;
          border-bottom: 1px solid #f0f1f7;
          margin-bottom: 1.25rem;
        }
        .sl-brand-icon {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #f5a623, #f76b1c);
          border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; flex-shrink: 0;
        }
        .sl-brand-name {
          font-size: 1rem;
          font-weight: 700;
          color: #1a1a2e;
          letter-spacing: -0.3px;
        }
        .sl-brand-sub {
          font-size: 0.68rem;
          color: #9499b0;
        }

        /* ── Nav label ── */
        .sl-nav-label {
          font-size: 0.65rem;
          font-weight: 600;
          color: #b8bdd0;
          text-transform: uppercase;
          letter-spacing: 0.7px;
          padding: 0 0.75rem;
          margin-bottom: 0.5rem;
        }

        /* ── Nav items ── */
        .sl-nav { display: flex; flex-direction: column; gap: 3px; }

        .sl-nav-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 9px 12px;
          border: none;
          border-radius: 11px;
          font-family: 'Poppins', sans-serif;
          font-size: 0.83rem;
          font-weight: 500;
          color: #5a607a;
          background: transparent;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          text-align: left;
        }
        .sl-nav-btn:hover { background: #f8f9fc; color: #1a1a2e; }

        .sl-nav-btn.active {
          background: #fff0e0;
          color: #c2590a;
          font-weight: 600;
        }

        .sl-nav-icon {
          width: 30px; height: 30px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem;
          flex-shrink: 0;
          background: #f1f3f9;
          color: #9499b0;
          transition: background 0.15s, color 0.15s;
        }
        .sl-nav-btn.active .sl-nav-icon {
          background: #f5a623;
          color: #fff;
        }

        /* ── Footer hint ── */
        .sl-sidebar-footer {
          margin-top: auto;
          padding: 0.75rem;
          background: #fdf9f5;
          border: 1px solid #f0e0c8;
          border-radius: 13px;
          font-size: 0.72rem;
          color: #c2590a;
          text-align: center;
          line-height: 1.5;
        }
        .sl-sidebar-footer strong { display: block; font-weight: 600; margin-bottom: 2px; }

        /* ── Main ── */
        .sl-main {
          flex: 1;
          padding: 2rem 2rem;
          overflow-y: auto;
          min-width: 0;
        }
        @media (max-width: 640px) {
          .sl-sidebar { width: 68px; padding: 1.25rem 0.5rem; }
          .sl-brand-name, .sl-brand-sub, .sl-nav-label,
          .sl-nav-btn span, .sl-sidebar-footer { display: none; }
          .sl-brand { justify-content: center; padding-bottom: 1rem; }
          .sl-nav-btn { justify-content: center; padding: 9px; }
          .sl-nav-icon { width: 34px; height: 34px; }
          .sl-main { padding: 1.25rem; }
        }
      `}</style>

      <div className="sl-root">
        {/* Sidebar */}
        <motion.aside
          className="sl-sidebar"
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          {/* Brand */}
          <div className="sl-brand">
            <div className="sl-brand-icon">🐾</div>
            <div>
              <p className="sl-brand-name">PetWorld</p>
              <p className="sl-brand-sub">Seller Panel</p>
            </div>
          </div>

          {/* Nav */}
          <p className="sl-nav-label">Menu</p>
          <nav className="sl-nav">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={`sl-nav-btn ${currentView === item.key ? "active" : ""}`}
              >
                <span className="sl-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer hint */}
          <div className="sl-sidebar-footer">
            <strong>Need help?</strong>
            Contact seller support
          </div>
        </motion.aside>

        {/* Main content */}
        <main className="sl-main">{children}</main>
      </div>
    </>
  );
}