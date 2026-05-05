import React, { useContext } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

// 🧭 Layout Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import RealtimeNotifications from "./components/RealtimeNotifications";

// 🏠 Pages
import Home from "./pages/Home";
import LoginSignup from "./pages/LoginSignup";
import PetDetail from "./pages/PetDetail";
import Wishlist from "./pages/Wishlist";
import CartPage from "./pages/CartPage";
import Dog from "./pages/Dog/Dog"; // 🐶 Dog page
import DogDetails from "./pages/Dog/DogDetails";
import Cat from "./pages/Cat"; // 🐱 Cat page
import Bird from "./pages/Bird"; // 🐦 Bird page
import Fish from "./pages/Fish"; // 🐟 Fish page
import SearchResults from "./pages/SearchResults";
import Checkout from "./pages/Checkout"; // ✅ Import the new page
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";

// 🧑‍💼 Dashboards
import AdminDashboard from "./pages/Admin/AdminDashboard";
import SellerDashboard from "./pages/Seller/SellerDashboard";

/* ============================================
   🔒 Protected Route Wrapper
============================================ */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold text-indigo-600">
        Loading Pet World...
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Restrict access if role not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/* ============================================
   🌍 Main App Content (Routes + Layout)
============================================ */
const AppContent = () => {
  const location = useLocation();

  // Hide Navbar & Footer on dashboards or login page
  const hideLayout =
    location.pathname.includes("/dashboard") || location.pathname === "/login";

  return (
    <>
      <Toaster 
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3500,
          style: {
            background: "#fff",
            color: "#1e1b4b",
            fontFamily: "'Poppins', sans-serif",
            fontSize: "0.95rem",
            fontWeight: 500,
            borderRadius: "14px",
            boxShadow: "0 10px 32px rgba(99, 102, 241, 0.15)",
            border: "1px solid #ede9fe",
            padding: "14px 18px",
          },
          success: {
            style: {
              background: "#f0fdf4",
              color: "#15803d",
              border: "1.5px solid #bbf7d0",
            },
            iconTheme: {
              primary: "#22c55e",
              secondary: "#f0fdf4",
            },
          },
          error: {
            style: {
              background: "#fef2f2",
              color: "#be123c",
              border: "1.5px solid #fecdd3",
            },
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fef2f2",
            },
          },
          loading: {
            style: {
              background: "#f5f3ff",
              color: "#6366f1",
              border: "1.5px solid #e8e4fc",
            },
          },
        }}
      />
      <RealtimeNotifications />
      {!hideLayout && <Navbar />}

      <main className="min-h-screen bg-gray-50">
        <Routes>
          {/* 🏠 Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/pets/:id" element={<PetDetail />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/dogs" element={<Dog />} />
          <Route path="/dogs/:id" element={<DogDetails />} />
          <Route path="/cats" element={<Cat />} />
          <Route path="/birds" element={<Bird />} />
          <Route path="/fish" element={<Fish />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* 🧑‍💼 Admin Dashboard */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 🛍️ Seller Dashboard */}
          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />

          {/* 🚫 Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!hideLayout}
    </>
  );
};

export default AppContent;
