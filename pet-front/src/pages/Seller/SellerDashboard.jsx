// src/pages/Seller/SellerDashboard.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SellerLayout    from "../../pages/Seller/SellerLayout";
import SellerProducts  from "../../pages/Seller/SellerProducts";
import SellerOrders    from "../../pages/Seller/SellerOrders";
import SellerAnalytics from "../../pages/Seller/SellerAnalytics";
import SellerAddProduct from "../../pages/Seller/SellerAddProduct";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";

const VIEW_META = {
  products:   { label: "Products",    emoji: "🐾" },
  orders:     { label: "Orders",      emoji: "📦" },
  analytics:  { label: "Analytics",   emoji: "📊" },
  addProduct: { label: "Add Product", emoji: "➕" },
};

export default function SellerDashboard() {
  const [view, setView]           = useState("products");
  const [editingPet, setEditingPet] = useState(null);
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    if (location?.state?.pet) {
      setEditingPet(location.state.pet);
      setView("addProduct");
      navigate(location.pathname, { replace: true });
    }
    const params = new URLSearchParams(location.search);
    const qview  = params.get("view");
    if (qview) setView(qview);
  }, [location, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    setTimeout(() => { toast.dismiss(); navigate("/login", { replace: true }); }, 2000);
  };

  const meta = VIEW_META[view] || VIEW_META.products;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }

        .sd-root { font-family: 'Poppins', sans-serif; }

        /* ── Top bar ── */
        .sd-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 2rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid #eef0f6;
        }

        .sd-page-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sd-page-icon {
          width: 42px; height: 42px;
          background: linear-gradient(135deg, #f5a623, #f76b1c);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; flex-shrink: 0;
        }
        .sd-page-name {
          font-size: 1.45rem;
          font-weight: 700;
          color: #1a1a2e;
          letter-spacing: -0.4px;
        }
        .sd-page-sub {
          font-size: 0.78rem;
          color: #9499b0;
        }

        /* ── Logout button ── */
        .sd-logout {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #fff1f1;
          border: 1px solid #fad5d5;
          color: #d44545;
          font-family: 'Poppins', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 11px;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          white-space: nowrap;
        }
        .sd-logout:hover  { background: #ffe0e0; }
        .sd-logout:active { transform: scale(0.97); }
      `}</style>

      <SellerLayout setView={setView} currentView={view}>
        <div className="sd-root">

          {/* Top bar */}
          <div className="sd-topbar">
            <div className="sd-page-title">
              <div className="sd-page-icon">{meta.emoji}</div>
              <div>
                <p className="sd-page-name">{meta.label}</p>
                <p className="sd-page-sub">Seller Dashboard</p>
              </div>
            </div>

            <button className="sd-logout" onClick={handleLogout}>
              <LogOut size={15} />
              Logout
            </button>
          </div>

          {/* View content */}
          {view === "products"   && <SellerProducts />}
          {view === "orders"     && <SellerOrders />}
          {view === "analytics"  && <SellerAnalytics />}
          {view === "addProduct" && (
            <SellerAddProduct
              editingPet={editingPet}
              clearEditing={() => setEditingPet(null)}
            />
          )}

        </div>
      </SellerLayout>
    </>
  );
}