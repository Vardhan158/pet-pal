import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PawPrint, SlidersHorizontal, X } from "lucide-react";

/* ── Inject Poppins + filter styles ── */
if (!document.getElementById("pcf-styles")) {
  const s = document.createElement("style");
  s.id = "pcf-styles";
  s.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

    .pcf-root, .pcf-root * { font-family: 'Poppins', sans-serif; box-sizing: border-box; }

    /* Custom range slider */
    .pcf-range {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 5px;
      border-radius: 999px;
      outline: none;
      cursor: pointer;
      background: linear-gradient(to right, #38BDF8 0%, #38BDF8 var(--fill, 100%), #E2E8F0 var(--fill, 100%), #E2E8F0 100%);
      transition: background 0.15s;
    }
    .pcf-range::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px; height: 20px;
      border-radius: 50%;
      background: #fff;
      border: 3px solid #0EA5E9;
      box-shadow: 0 2px 8px rgba(14,165,233,0.3);
      transition: transform 0.15s, box-shadow 0.15s;
      cursor: pointer;
    }
    .pcf-range::-webkit-slider-thumb:hover {
      transform: scale(1.15);
      box-shadow: 0 4px 14px rgba(14,165,233,0.45);
    }
    .pcf-range::-moz-range-thumb {
      width: 20px; height: 20px;
      border-radius: 50%;
      background: #fff;
      border: 3px solid #0EA5E9;
      box-shadow: 0 2px 8px rgba(14,165,233,0.3);
      cursor: pointer;
    }

    /* Mobile top bar */
    .pcf-topbar {
      display: none;
      align-items: center; justify-content: space-between;
      padding: 14px 20px;
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid #E5E7EB;
      position: sticky; top: 0; z-index: 40;
    }
    @media (max-width: 767px) {
      .pcf-topbar { display: flex; }
    }

    .pcf-filter-toggle-btn {
      display: flex; align-items: center; gap: 7px;
      padding: 7px 16px; border-radius: 999px;
      border: 1.5px solid #BAE6FD;
      background: #F0F9FF; color: #0284C7;
      font-family: 'Poppins', sans-serif;
      font-size: 0.82rem; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
    }
    .pcf-filter-toggle-btn:hover {
      background: #E0F2FE;
      box-shadow: 0 2px 10px rgba(14,165,233,0.15);
    }

    /* Overlay (mobile) */
    .pcf-overlay {
      position: fixed; inset: 0; z-index: 49;
      background: rgba(0,0,0,0.25);
      backdrop-filter: blur(2px);
    }

    /* Sidebar */
    .pcf-sidebar {
      width: 280px;
      background: #fff;
      border-right: 1px solid #F0F9FF;
      height: calc(100vh - 70px);
      position: sticky; top: 70px;
      overflow-y: auto;
      padding: 32px 22px;
      box-shadow: 2px 0 20px rgba(14,165,233,0.05);
      flex-shrink: 0;
    }

    /* Mobile: fullscreen drawer */
    @media (max-width: 767px) {
      .pcf-sidebar {
        position: fixed; top: 0; left: 0;
        height: 100vh; z-index: 50;
        width: 290px;
        border-radius: 0 24px 24px 0;
        box-shadow: 8px 0 40px rgba(0,0,0,0.15);
      }
    }

    /* Stat chip */
    .pcf-stat-chip {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 14px; border-radius: 12px;
      margin-bottom: 8px;
    }

    /* Close button */
    .pcf-close-btn {
      display: flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: 50%;
      border: none; background: #F1F5F9; cursor: pointer;
      color: #6B7280; transition: background 0.15s;
    }
    .pcf-close-btn:hover { background: #E2E8F0; color: #374151; }
  `;
  document.head.appendChild(s);
}

export default function PetCategoryFilter({
  title,
  itemLabel,
  showFilters,
  setShowFilters,
  priceRange,
  maxPrice,
  onPriceChange,
  totalCount,
  availableCount,
}) {
  const fillPct = maxPrice > 0 ? Math.round((priceRange[1] / maxPrice) * 100) : 100;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const SidebarContent = (
    <div className="pcf-root pcf-sidebar">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg, #E0F2FE, #BAE6FD)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <SlidersHorizontal size={16} color="#0284C7" />
          </div>
          <span style={{ fontWeight: 700, fontSize: "1rem", color: "#0C1A2E" }}>Filters</span>
        </div>
        {/* Close on mobile */}
        <button className="pcf-close-btn md:hidden" onClick={() => setShowFilters(false)}>
          <X size={16} />
        </button>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#F1F5F9", marginBottom: 28 }} />

      {/* Price Range */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151",
            textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Price Range
          </span>
          <span style={{
            fontSize: "0.78rem", fontWeight: 700, color: "#0284C7",
            background: "#E0F2FE", borderRadius: 8, padding: "2px 9px",
          }}>
            ₹{priceRange[1].toLocaleString()}
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={maxPrice}
          value={priceRange[1]}
          onChange={(e) => onPriceChange([0, parseInt(e.target.value, 10)])}
          className="pcf-range"
          style={{ "--fill": `${fillPct}%` }}
        />

        <div style={{ display: "flex", justifyContent: "space-between",
          marginTop: 8, fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 500 }}>
          <span>₹0</span>
          <span>₹{maxPrice.toLocaleString()}</span>
        </div>

        {/* Range visual pill */}
        <div style={{
          marginTop: 14, padding: "8px 12px", borderRadius: 10,
          background: "#F0F9FF", border: "1px solid #BAE6FD",
          fontSize: "0.78rem", color: "#0369A1", fontWeight: 500,
          textAlign: "center",
        }}>
          ₹{priceRange[0].toLocaleString()} &mdash; ₹{priceRange[1].toLocaleString()}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#F1F5F9", marginBottom: 28 }} />

      {/* Stats */}
      <div>
        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151",
          textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 12 }}>
          Summary
        </span>

        <div className="pcf-stat-chip" style={{ background: "#F0F9FF", border: "1px solid #BAE6FD" }}>
          <span style={{ fontSize: "0.82rem", color: "#374151", fontWeight: 500 }}>
            Total {itemLabel}
          </span>
          <span style={{ fontWeight: 800, fontSize: "1rem", color: "#0284C7" }}>
            {totalCount}
          </span>
        </div>

        <div className="pcf-stat-chip" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
          <span style={{ fontSize: "0.82rem", color: "#374151", fontWeight: 500 }}>
            Available
          </span>
          <span style={{ fontWeight: 800, fontSize: "1rem", color: "#16A34A" }}>
            {availableCount}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 6 }}>
          <div style={{ height: 5, borderRadius: 999, background: "#E5E7EB", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 999,
              background: "linear-gradient(90deg, #38BDF8, #0EA5E9)",
              width: totalCount > 0 ? `${Math.round((availableCount / totalCount) * 100)}%` : "0%",
              transition: "width 0.4s ease",
            }} />
          </div>
          <p style={{ fontSize: "0.7rem", color: "#9CA3AF", marginTop: 5, textAlign: "right", fontWeight: 500 }}>
            {totalCount > 0 ? Math.round((availableCount / totalCount) * 100) : 0}% match
          </p>
        </div>
      </div>

      {/* Reset button */}
      <button
        onClick={() => onPriceChange([0, maxPrice])}
        style={{
          marginTop: 28, width: "100%", padding: "10px",
          border: "1.5px solid #BAE6FD", borderRadius: 12,
          background: "transparent", cursor: "pointer",
          fontFamily: "'Poppins', sans-serif", fontWeight: 600,
          fontSize: "0.82rem", color: "#0284C7",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#E0F2FE"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="pcf-topbar pcf-root">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PawPrint size={20} color="#0284C7" />
          <span style={{ fontWeight: 800, fontSize: "1.15rem", color: "#0C1A2E",
            letterSpacing: "-0.02em" }}>
            {title}
          </span>
        </div>
        <button className="pcf-filter-toggle-btn" onClick={() => setShowFilters(true)}>
          <SlidersHorizontal size={14} /> Filters
        </button>
      </div>

      {/* Desktop: always visible sidebar */}
      <div className="hidden md:block">
        {SidebarContent}
      </div>

      {/* Mobile: animated drawer */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              className="pcf-overlay md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              className="md:hidden"
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              style={{ position: "fixed", top: 0, left: 0, zIndex: 50 }}
            >
              {SidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}