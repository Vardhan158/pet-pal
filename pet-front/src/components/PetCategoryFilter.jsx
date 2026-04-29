import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PawPrint, SlidersHorizontal, X } from "lucide-react";

export default function PetCategoryFilter({
  title,
  itemLabel,
  accentClass,
  accentSoftClass,
  accentRingClass,
  summaryGradientClass,
  showFilters,
  setShowFilters,
  priceRange,
  maxPrice,
  onPriceChange,
  totalCount,
  availableCount,
}) {
  const showSidebar = showFilters || window.innerWidth >= 768;

  return (
    <>
      <div className="md:hidden flex justify-between items-center px-4 py-4 bg-white/70 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <h1 className={`text-2xl font-bold flex items-center gap-2 ${accentClass}`}>
          <PawPrint className={`w-6 h-6 ${accentClass}`} /> {title}
        </h1>
        <button
          onClick={() => setShowFilters(true)}
          className={`flex items-center gap-2 font-medium border px-3 py-1.5 rounded-full shadow-sm transition ${accentClass} ${accentSoftClass}`}
        >
          <SlidersHorizontal size={18} />
          Filters
        </button>
      </div>

      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -200, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="md:w-72 w-full md:static fixed top-0 left-0 h-screen md:h-auto bg-white/90 backdrop-blur-lg shadow-xl md:shadow-none rounded-r-2xl z-50 border-r border-gray-100 p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center md:mb-4">
              <h2 className={`text-lg font-bold flex items-center gap-2 ${accentClass}`}>
                <SlidersHorizontal size={18} /> Filters
              </h2>
              <button
                onClick={() => setShowFilters(false)}
                className="md:hidden p-2 rounded-full hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6">
              <label className="block text-sm text-gray-700 mb-2 font-medium">
                Price Range: Rs.{priceRange[0].toLocaleString()} - Rs.{priceRange[1].toLocaleString()}
              </label>
              <input
                type="range"
                min="0"
                max={maxPrice}
                value={priceRange[1]}
                onChange={(event) => onPriceChange([0, parseInt(event.target.value, 10)])}
                className={`w-full ${accentRingClass}`}
              />
              <div className="text-xs text-gray-500 mt-1 flex justify-between">
                <span>Rs.0</span>
                <span>Rs.{maxPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className={`mt-8 p-4 rounded-lg bg-gradient-to-r ${summaryGradientClass}`}>
              <p className="text-sm text-gray-700">
                <strong>Total {itemLabel}:</strong> {totalCount}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <strong>Available:</strong> {availableCount}
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
