import { Backdrop, Stack, Typography } from "@mui/material";
import Lottie from "lottie-react";
import { offlineAnimation } from "../../animation";
import { useEffect, useState } from "react";

const OfflineIndicator = () => {
  // Check if running in a browser environment
  const initialOnlineStatus = typeof window !== "undefined" && window.navigator.onLine;
  const [isOnline, setIsOnline] = useState(initialOnlineStatus);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Clean up the event listeners on unmount
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: 1301,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
      open={!isOnline} // Show backdrop when offline
    >
      <Stack
        justifyContent="center"
        alignItems="center"
        sx={{
          height: { xs: "60%", sm: "50%", md: "34%" },
          width: { xs: "60%", sm: "50%", md: "30%" },
        }}
      >
        <Lottie animationData={offlineAnimation} loop autoPlay style={{ height: "100%", width: "100%" }} />
        <Typography
          variant="h6"
          sx={{
            transform: "translateY(-3rem)",
            fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" },
          }}
        >
          No Internet Connection
        </Typography>
      </Stack>
    </Backdrop>
  );
};

export default OfflineIndicator;
