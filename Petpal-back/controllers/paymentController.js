import Razorpay from "razorpay";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Order from "../models/orderModel.js";
import { sendEmail } from "../utils/sendEmail.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are missing in .env");
  }

  return { keyId, keySecret };
};

export const createOrder = async (req, res) => {
  try {
    const numericAmount = Number(req.body?.amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid amount is required",
      });
    }

    const { keyId, keySecret } = getRazorpayConfig();
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(numericAmount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return res.status(200).json({
      success: true,
      key: keyId,
      order,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);

    return res.status(500).json({
      success: false,
      message: "Razorpay order creation failed",
      error: error?.error?.description || error?.message || "Unknown error",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay payment details",
      });
    }

    const { keySecret } = getRazorpayConfig();

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay signature",
      });
    }

    const order = await Order.findOneAndUpdate(
      {
        $or: [
          { paymentId: razorpay_payment_id },
          { razorpayOrderId: razorpay_order_id },
        ],
      },
      {
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        paymentStatus: "Paid",
      },
      { new: true }
    );

    if (order?.user?.email) {
      // Non-blocking - fire and forget
      sendEmail(
        order.user.email,
        "Payment Successful - PetPal Order Confirmed!",
        `
          <h2>Hi ${order.user.name || "PetPal User"},</h2>
          <p>Your payment for order <strong>${order._id}</strong> has been confirmed successfully.</p>
          <p><strong>Amount Paid:</strong> Rs.${order.totalAmount}</p>
          <p>You can track your order anytime in <strong>My Orders</strong>.</p>
          <br>
          <p>Regards,<br><strong>PetPal Team</strong></p>
        `
      ).catch(err => console.error("Payment confirmation email failed:", err.message));
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Payment verification failed:", error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};
