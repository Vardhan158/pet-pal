import Notification from "../models/notificationModel.js";

const notificationClients = new Map();

const sendEvent = (res, event, data) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

export const sendNotificationToUser = (userId, notification) => {
  const clients = notificationClients.get(userId?.toString());
  if (!clients) return;

  for (const client of clients) {
    sendEvent(client, "notification", notification);
  }
};

export const streamNotifications = async (req, res) => {
  const userId = req.user._id.toString();

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  sendEvent(res, "connected", { success: true });

  if (!notificationClients.has(userId)) {
    notificationClients.set(userId, new Set());
  }
  notificationClients.get(userId).add(res);

  const keepAlive = setInterval(() => {
    sendEvent(res, "ping", { time: Date.now() });
  }, 25000);

  req.on("close", () => {
    clearInterval(keepAlive);
    const clients = notificationClients.get(userId);
    clients?.delete(res);
    if (clients?.size === 0) {
      notificationClients.delete(userId);
    }
  });
};

/* 🔔 GET ALL NOTIFICATIONS FOR USER */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
    });
  }
};

/* 🔔 GET ALL NOTIFICATIONS FOR ADMIN */
export const getAdminNotifications = async (req, res) => {
  try {
    const adminId = req.user._id;
    const notifications = await Notification.find({ 
      admin: adminId,
      recipientType: "admin"
    })
      .populate("seller", "name email")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error("❌ Error fetching admin notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin notifications",
    });
  }
};

/* ✅ MARK NOTIFICATION AS READ */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Verify ownership - check if user owns it or admin owns it
    if (notification.recipientType === "admin") {
      if (!notification.admin || notification.admin.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }
    } else {
      if (!notification.user || notification.user.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Error updating notification",
    });
  }
};

/* 🗑️ DELETE NOTIFICATION */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Verify ownership - check if user owns it or admin owns it
    if (notification.recipientType === "admin") {
      if (!notification.admin || notification.admin.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }
    } else {
      if (!notification.user || notification.user.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }
    }

    await Notification.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting notification",
    });
  }
};

/* 📢 CREATE NOTIFICATION (Internal Helper) */
export const createNotification = async (
  userId = null,
  type,
  title,
  message,
  relatedId = null,
  relatedType = "other",
  sellerId = null,
  adminId = null,
  recipientType = "user"
) => {
  try {
    const notificationData = {
      type,
      title,
      message,
      relatedId,
      relatedType,
      read: false,
      recipientType,
    };

    // Set recipient based on type
    if (recipientType === "admin" && adminId) {
      notificationData.admin = adminId;
      notificationData.seller = sellerId; // Track which seller submitted
    } else {
      notificationData.user = userId;
    }

    const notification = await Notification.create(notificationData);
    
    // Send real-time notification if user
    if (recipientType === "user" && userId) {
      sendNotificationToUser(userId, notification);
    }
    // TODO: Add admin real-time notification support here if needed
    
    return notification;
  } catch (error) {
    console.error("❌ Error creating notification:", error);
    return null;
  }
};

/* 🧹 DELETE ALL NOTIFICATIONS FOR USER */
export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ user: userId });

    res.status(200).json({
      success: true,
      message: "All notifications deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting all notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting notifications",
    });
  }
};
