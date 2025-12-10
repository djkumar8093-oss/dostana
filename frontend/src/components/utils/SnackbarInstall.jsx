import React, { useState, useEffect } from "react";
import { Button, Snackbar, Alert, IconButton } from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";
import CloseIcon from "@mui/icons-material/Close";

const SnackbarInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);

      // Check if already installed
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      setIsInstalled(isStandalone);

      if (!isStandalone) {
        setShowSnackbar(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
    setShowSnackbar(false);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    setShowSnackbar(false);
    // Optional: Store dismissal in localStorage
    localStorage.setItem("installPromptDismissed", "true");
  };

  if (isInstalled) return null;

  return (
    <Snackbar
      open={showSnackbar}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      autoHideDuration={10000}
      sx={{
        "& .MuiSnackbarContent-root": {
          backgroundColor: "background.paper",
          color: "text.primary",
          boxShadow: 3,
        },
      }}
    >
      <Alert
        icon={<GetAppIcon fontSize="inherit" />}
        severity="info"
        variant="filled"
        onClose={handleClose}
        action={
          <>
            <Button color="primary" size="small" onClick={handleInstallClick} sx={{ mr: 1, color: "white" }}>
              Install
            </Button>
            <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        }
        sx={{
          width: "90%",
          alignItems: "center",
          bgcolor: "primary.main",
          "& .MuiAlert-message": {
            display: "flex",
            alignItems: "center",
            gap: 1,
          },
        }}
      >
        Install this app for better experience!
      </Alert>
    </Snackbar>
  );
};

export default SnackbarInstallButton;
