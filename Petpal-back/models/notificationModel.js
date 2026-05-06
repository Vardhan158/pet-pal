import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    /* 👤 RECIPIENT - Can be User or Admin */
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    recipientType: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    /* 📢 TYPE & CONTENT */
    type: {
      type: String,
      enum: ["offer", "product", "order", "system", "seller-submission"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },

    /* 🔗 RELATED ENTITY */
    relatedId: { type: String, default: null }, // offerId, petId, orderId, etc.
    relatedType: {
      type: String,
      enum: ["offer", "pet", "order", "other"],
      default: "other",
    },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", default: null }, // For seller submissions

    /* ✅ STATUS */
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
