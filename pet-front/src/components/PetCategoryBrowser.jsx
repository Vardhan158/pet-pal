import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Heart, PawPrint, Search, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../api/utils/axiosInstance";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import PetCategoryFilter from "./PetCategoryFilter";

const FALLBACK_IMAGE =
  "https://cdn-icons-png.flaticon.com/512/616/616408.png";

export default function PetCategoryBrowser({
  category,
  title,
  itemLabel,
  accentClass = "text-cyan-700",
  accentSoftClass = "border-cyan-200 hover:bg-cyan-50",
  accentRingClass = "accent-cyan-600",
  summaryGradientClass = "from-cyan-100 to-blue-100",
  pageGradientClass = "from-blue-50 via-white to-cyan-50",
  buttonGradientClass = "from-cyan-500 to-blue-600",
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
    if (fetched.current) {
      return;
    }

    fetched.current = true;

    async function fetchPets() {
      try {
        const response = await axiosInstance.get(
          `/pets/approved?category=${encodeURIComponent(category)}`
        );
        const items = response.data?.pets || [];
        const normalized = items.map((pet) => ({
          ...pet,
          images: Array.isArray(pet.images)
            ? pet.images
            : pet.image
              ? [pet.image]
              : [],
          specifications: Array.isArray(pet.specifications)
            ? pet.specifications
            : [],
        }));

        setPets(normalized);

        const highest = Math.max(
          ...normalized.map((pet) => Number(pet.offerPrice || pet.price || 0)),
          50000
        );
        setMaxPrice(highest);
        setPriceRange([0, highest]);
      } catch (error) {
        console.error(`Error fetching ${category}:`, error);
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
      const searchable = [
        pet.name,
        pet.description,
        pet.category,
        pet.breed,
        ...(pet.specifications || []).flatMap((spec) => [spec.label, spec.value]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const priceToCheck = Number(pet.offerPrice || pet.price || 0);
      const matchesSearch = !term || searchable.includes(term);
      const matchesPrice =
        priceToCheck >= priceRange[0] && priceToCheck <= priceRange[1];

      return matchesSearch && matchesPrice;
    });
  }, [pets, priceRange, search]);

  const handleAddToCart = async (pet) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      await axiosInstance.post("/cart/add", {
        petId: pet._id,
        quantity: 1,
      });

      addToCart(pet._id || pet.id, {
        petId: pet._id,
        name: pet.name,
        price: pet.offerPrice || pet.price,
        image: pet.images?.[0] || pet.image,
        category: pet.category,
        quantity: 1,
      });

      toast.success(`${pet.name} added to cart`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Error adding to cart");
    }
  };

  const handleWishlist = async (pet) => {
    if (!user) {
      toast.error("Please login to add to wishlist");
      navigate("/login");
      return;
    }

    const alreadyLiked = wishlist.some((item) => item._id === pet._id);

    try {
      if (alreadyLiked) {
        await axiosInstance.delete(`/wishlist/remove/${pet._id}`);
        toast(`${pet.name} removed from wishlist`);
      } else {
        await axiosInstance.post("/wishlist/add", { petId: pet._id });
        toast.success(`${pet.name} added to wishlist`);
      }

      await refreshWishlist();
    } catch (error) {
      console.error("Error updating wishlist:", error?.response?.data || error);
      const message = error?.response?.data?.message || "Wishlist update failed";
      toast.error(message);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row bg-gradient-to-br ${pageGradientClass} overflow-hidden`}
    >
      <PetCategoryFilter
        title={title}
        itemLabel={itemLabel}
        accentClass={accentClass}
        accentSoftClass={accentSoftClass}
        accentRingClass={accentRingClass}
        summaryGradientClass={summaryGradientClass}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        priceRange={priceRange}
        maxPrice={maxPrice}
        onPriceChange={setPriceRange}
        totalCount={pets.length}
        availableCount={filteredPets.length}
      />

      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-10">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1
            className={`text-3xl sm:text-4xl font-extrabold flex justify-center items-center gap-3 ${accentClass}`}
          >
            <PawPrint className="w-7 h-7 sm:w-8 sm:h-8" />
            Explore {title}
          </h1>
          <p className="text-gray-600 mt-2 text-base sm:text-lg max-w-2xl mx-auto">
            Browse verified listings, compare prices, and find the right match for
            your home.
          </p>

          <div className="mt-6 flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={`Search ${itemLabel.toLowerCase()} by name, breed, or description...`}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white/80 backdrop-blur-md focus:ring-2 focus:ring-cyan-500 outline-none transition text-sm sm:text-base"
              />
            </div>
          </div>
        </motion.div>

        {loading ? (
          <p className="text-center text-gray-500 text-lg animate-pulse mt-20">
            Loading {itemLabel.toLowerCase()}...
          </p>
        ) : filteredPets.length === 0 ? (
          <p className="text-center text-gray-400 text-lg mt-20">
            No {itemLabel.toLowerCase()} match your filters.
          </p>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
          >
            {filteredPets.map((pet, index) => {
              const isLiked = wishlist.some((item) => item._id === pet._id);
              const image = pet.images?.[0] || pet.image || FALLBACK_IMAGE;
              const displayPrice = pet.offerPrice || pet.price;

              return (
                <motion.div
                  key={pet._id}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.06 }}
                  whileHover={{ scale: 1.03 }}
                  className="relative bg-white/95 backdrop-blur-lg rounded-2xl shadow-md hover:shadow-xl overflow-hidden border border-gray-100 transition-all cursor-pointer"
                  onClick={() => navigate(`/pets/${pet._id}`)}
                >
                  <div className="relative h-52 sm:h-60 md:h-64 overflow-hidden bg-gradient-to-br from-cyan-100 to-blue-100">
                    <motion.img
                      src={image}
                      alt={pet.name}
                      className="object-cover w-full h-full"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <div className="p-4 sm:p-5">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
                      {pet.name}
                    </h2>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">
                      {pet.category}
                    </p>

                    <div className="text-xs text-gray-600 mt-2 space-y-1 min-h-[3rem]">
                      {pet.specifications.length > 0 ? (
                        pet.specifications.slice(0, 2).map((spec, specIndex) => (
                          <p key={`${pet._id}-spec-${specIndex}`}>
                            <strong>{spec.label}:</strong> {spec.value}
                          </p>
                        ))
                      ) : (
                        <>
                          {pet.breed && (
                            <p>
                              <strong>Breed:</strong> {pet.breed}
                            </p>
                          )}
                          {pet.age && (
                            <p>
                              <strong>Age:</strong> {pet.age}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        {pet.offerPrice && pet.offerPrice > 0 ? (
                          <>
                            <p className="text-xs text-gray-400 line-through">
                              Rs.{Number(pet.price || 0).toLocaleString()}
                            </p>
                            <p className={`text-base sm:text-lg font-bold ${accentClass}`}>
                              Rs.{Number(displayPrice || 0).toLocaleString()}
                            </p>
                          </>
                        ) : (
                          <p className={`text-base sm:text-lg font-bold ${accentClass}`}>
                            Rs.{Number(displayPrice || 0).toLocaleString()}
                          </p>
                        )}

                        <Heart
                          fill={isLiked ? "red" : "none"}
                          strokeWidth={1.5}
                          className={`transition cursor-pointer ml-auto ${
                            isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"
                          }`}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleWishlist(pet);
                          }}
                        />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleAddToCart(pet);
                      }}
                      className={`w-full mt-3 bg-gradient-to-r ${buttonGradientClass} text-white py-2 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2`}
                    >
                      <ShoppingCart size={16} /> Add to Cart
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {totalItems > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/cart")}
            className={`flex items-center gap-2 bg-gradient-to-r ${buttonGradientClass} text-white text-sm sm:text-base font-semibold py-3 px-5 sm:px-6 rounded-full shadow-xl hover:shadow-2xl transition-all`}
          >
            <ShoppingCart size={20} /> Cart ({totalItems})
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
