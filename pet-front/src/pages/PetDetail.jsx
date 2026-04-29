import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../api/utils/axiosInstance";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

void motion;

const FALLBACK_IMAGE =
  "https://cdn-icons-png.flaticon.com/512/616/616408.png";

export default function PetDetail() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const normalizePet = (value) => {
    if (!value) return null;

    const pet = { ...value };
    pet.id = pet._id || pet.id;
    pet.title = pet.name || pet.title || "Pet";
    pet.type = pet.category || pet.type || "Unknown";

    if (!Array.isArray(pet.images)) {
      if (pet.image) pet.images = [pet.image];
      else if (Array.isArray(pet.additionalImages)) pet.images = pet.additionalImages;
      else pet.images = [];
    }

    if (!Array.isArray(pet.specifications)) {
      pet.specifications = [];
    }

    return pet;
  };

  const [pet, setPet] = useState(normalizePet(location.state?.pet ?? null));
  const [loading, setLoading] = useState(!location.state?.pet);
  const [addingToCart, setAddingToCart] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (pet) return;

    async function fetchPet() {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/pets/${id}`);
        const data = response.data?.pet;

        if (!data) {
          throw new Error("Pet not found");
        }

        setPet(normalizePet(data));
      } catch (error) {
        console.error("Error fetching pet details:", error);
        toast.error("Failed to load pet details");
      } finally {
        setLoading(false);
      }
    }

    fetchPet();
  }, [id, pet]);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    setAddingToCart(true);

    try {
      const petId = pet._id || pet.id;

      await axiosInstance.post("/cart/add", {
        petId,
        quantity: 1,
      });

      addToCart(petId, {
        petId,
        name: pet.name || pet.title,
        price: pet.offerPrice && pet.offerPrice > 0 ? pet.offerPrice : pet.price,
        image: pet.images?.[0] || pet.image,
        category: pet.category || pet.type,
        quantity: 1,
      });

      toast.success(`${pet.title} added to cart`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error("Please login to checkout");
      navigate("/login");
      return;
    }

    try {
      setProcessingPayment(true);

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Razorpay SDK failed to load");
        return;
      }

      const amount =
        pet.offerPrice && pet.offerPrice > 0 ? pet.offerPrice : pet.price;

      const { data } = await axiosInstance.post("/payments/create-order", {
        amount,
      });

      const order = data?.order || data;

      if (!order?.id || !data?.key) {
        throw new Error("Failed to create Razorpay order");
      }

      const razorpay = new window.Razorpay({
        key: data.key,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "PetPal",
        description: `Purchase of ${pet.title}`,
        image: FALLBACK_IMAGE,
        order_id: order.id,
        handler: async (response) => {
          try {
            await axiosInstance.post("/payments/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              petId: pet._id || pet.id,
              amount,
            });

            toast.success("Payment successful");
            navigate("/orders");
          } catch (error) {
            console.error("Payment verification failed:", error);
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: user.name || "Pet Lover",
          email: user.email || "",
          contact: user.phone || "",
        },
        theme: {
          color: "#4f46e5",
        },
      });

      razorpay.on("payment.failed", () => {
        toast.error("Payment failed");
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to process payment"
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading pet details...
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-gray-500">
        <p>Pet not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const images = (pet.images || []).filter(Boolean);
  const descriptionList = pet.description
    ? pet.description.split(".").filter((item) => item.trim().length > 0)
    : ["No detailed description available."];

  return (
    <div className="max-w-6xl w-full px-6 py-8 mx-auto">
      <Toaster position="top-right" />

      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-blue-600 hover:underline"
        >
          Back
        </button>
        <span>/</span>
        <span>{pet.type}</span>
        <span>/</span>
        <span className="text-indigo-500 font-medium truncate max-w-[200px]">
          {pet.title}
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        <div className="flex gap-4">
          <div className="flex flex-col gap-3">
            {images.map((image, index) => (
              <motion.div
                key={`${image}-${index}`}
                whileHover={{ scale: 1.05 }}
                className="border border-gray-300 rounded-lg overflow-hidden cursor-pointer w-20 h-20"
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </motion.div>
            ))}
          </div>

          <div className="border border-gray-300 rounded-lg overflow-hidden max-w-[400px]">
            <motion.img
              src={images[0] || FALLBACK_IMAGE}
              alt={pet.title}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <div className="w-full md:w-1/2 text-sm">
          <h1 className="text-3xl font-semibold">{pet.title}</h1>
          <p className="text-gray-500 text-base mt-1">{pet.category || pet.type}</p>

          <div className="mt-6">
            {pet.offerPrice && pet.offerPrice > 0 ? (
              <>
                <p className="text-gray-500/70 line-through">MRP: Rs.{pet.price}</p>
                <p className="text-2xl font-medium text-blue-600">
                  Rs.{pet.offerPrice}
                </p>
              </>
            ) : (
              <p className="text-2xl font-medium text-blue-600">Rs.{pet.price}</p>
            )}
            <p className="text-gray-500/70">(Inclusive of all taxes)</p>
          </div>

          <div className="mt-6">
            <p className="text-base font-medium mb-2">About This Pet</p>
            <ul className="list-disc ml-4 text-gray-600 leading-relaxed">
              {descriptionList.map((description, index) => (
                <li key={index}>{description}</li>
              ))}
            </ul>
          </div>

          {pet.specifications.length > 0 && (
            <div className="mt-8 border-t pt-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Specifications
              </h3>
              <div className="grid grid-cols-2 gap-3 text-gray-600 text-sm">
                {pet.specifications.map((spec, index) => (
                  <div key={index} className="flex justify-between border-b py-1">
                    <span className="font-medium">
                      {spec.label || `Spec ${index + 1}`}
                    </span>
                    <span>{spec.value || "N/A"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center mt-10 gap-4 text-base">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="w-full py-3.5 font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition rounded-lg"
            >
              {addingToCart ? "Adding..." : "Add to Cart"}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleBuyNow}
              disabled={processingPayment}
              className="w-full py-3.5 font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition rounded-lg flex items-center justify-center gap-2"
            >
              {processingPayment ? "Processing..." : "Buy Now"}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
