import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp"; // Install icon

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (!deferredPrompt) return null; // Hide button if install prompt is unavailable

  return (
    <Button
      fullWidth
      startIcon={<GetAppIcon />}
      onClick={handleInstallClick}
      sx={{
        justifyContent: "flex-start",
        textTransform: "none",
        fontWeight: "bold",
        color: "#000000a6",
        p: "1rem",
        px: ".8rem",
        "&:hover": {
          backgroundColor: "action.hover",
        },
      }}
    >
      Install App
    </Button>
  );
};

export default InstallButton;
