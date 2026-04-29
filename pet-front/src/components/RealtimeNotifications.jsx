import { useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../api/utils/axiosInstance";
import { useAuth } from "../context/AuthContext";

export const NOTIFICATION_EVENT = "petworld:notification";

export default function RealtimeNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!user || !token || !window.EventSource) return;

    const apiBaseUrl = axiosInstance.defaults.baseURL || "https://pet-pal-x74f.onrender.com/api";
    const streamUrl = `${apiBaseUrl}/notifications/stream?token=${encodeURIComponent(token)}`;
    const source = new EventSource(streamUrl);

    source.addEventListener("notification", (event) => {
      const notification = JSON.parse(event.data);
      window.dispatchEvent(
        new CustomEvent(NOTIFICATION_EVENT, { detail: notification })
      );

      if (notification?.type === "order") {
        toast.success(notification.message || "Your order was updated");
      } else if (notification?.message) {
        toast(notification.message);
      }
    });

    return () => source.close();
  }, [user]);

  return null;
}
