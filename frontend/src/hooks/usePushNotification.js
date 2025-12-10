// src/hooks/usePushNotifications.js
import { useEffect } from "react";
import axiosInstance from "../configs/axiosInstance";

// Sample VAPID public key (replace with your own key for production)
const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

const usePushNotifications = () => {
  useEffect(() => {
    const initPushNotifications = async () => {
      try {
        if (!("serviceWorker" in navigator)) {
          console.error("Service Workers are not supported in this browser.");
          return;
        }

        // Register the service worker
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("Service Worker registered:", registration);

        // Request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.error("Notification permission not granted.");
          return;
        }

        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        // Log and send the subscription (token) to your backend
        console.log("Successfully obtained subscription", JSON.stringify(subscription));
        await axiosInstance.post("notification/push-subscription", { subscription });
      } catch (error) {
        console.error("Error during push initialization:", error);
      }
    };

    initPushNotifications();
  }, []);

  return null;
};

// Utility function to convert the VAPID public key
const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
};

export default usePushNotifications;
