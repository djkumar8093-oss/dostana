// Ensure the service worker doesn't get overwritten by Vite's PWA plugin
self.__WB_MANIFEST;

// Import Workbox libraries
importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.2.0/workbox-sw.js");

// Skip waiting and claim clients immediately
self.addEventListener("install", () => {
  console.log("✅ Service Worker Installed");
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  console.log("✅ Service Worker Activated");
  self.clients.claim();
});

// Precache assets
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

// Handle push events
self.addEventListener("push", (event) => {
  console.log("🔥 Push event received:", event);
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error("❌ Error parsing push data:", e);
    }
  }
  const title = data.title || "Dostana Notification";
  const options = {
    body: data.body || "You have a new message.",
    icon: "/companyFaviIcon.png",
    data: {
      url: data.data?.url || "https://dostana-ui.vercel.app",
    },
  };
  console.log("✅ Showing notification...");
  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("✅ Notification clicked...");
  event.notification.close();
  const clickUrl = event.notification.data?.url;
  if (clickUrl) {
    event.waitUntil(clients.openWindow(clickUrl));
  }
});
