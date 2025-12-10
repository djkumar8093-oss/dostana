import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { registerSW } from "virtual:pwa-register";

// MUI Imports
import { CssBaseline } from "@mui/material";

// React Query Imports
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Redux Imports
import { Provider } from "react-redux";
import { store } from "./reduxStore/store.js";

// Notifications
import { SnackbarProvider } from "notistack";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Query Client Setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh indefinitely.
      staleTime: Infinity,
      // Disable refetching when the component mounts.
      refetchOnMount: false,
      // Disable refetching when the window is focused.
      refetchOnWindowFocus: false,
      // Disable refetching when the browser reconnects.
      refetchOnReconnect: false,
      retry: 2,
    },
  },
});

// Optional: Explicit service worker registration (if not using auto registration)

// Root Rendering
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <SnackbarProvider maxSnack={3} autoHideDuration={6000}>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || " "}>
            <App />
          </GoogleOAuthProvider>
        </SnackbarProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/notification-sw.js")
      .then((registration) => {
        console.log("ServiceWorker registration successful with scope: ", registration.scope);
      })
      .catch((error) => {
        console.error("ServiceWorker registration failed:", error);
      });
  });
}
