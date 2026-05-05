import express from "express";
import { registerUser, loginUser, getProfile, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Register new user
router.post("/register", registerUser);

// Login (admin/seller/user)
router.post("/login", loginUser);

// Get user profile (protected)
router.get("/profile", protect, getProfile);

// Update user profile (protected)
router.put("/profile", protect, updateProfile);

export default router;
