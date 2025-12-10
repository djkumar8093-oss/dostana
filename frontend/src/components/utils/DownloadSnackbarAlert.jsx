import React, { useEffect } from "react";
import { Snackbar, Slide, Alert, IconButton } from "@mui/material";
import { Close as CloseIcon, CloudDownload } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { hideDownloading } from "../../reduxSlices/downloadingSlice";
import Lottie from "lottie-react";
import { alertError, alertSuccess } from "../../animation";

function SlideTransition(props) {
  return <Slide {...props} direction="right" />;
}

export default function DownloadSnackbarAlert() {
  const dispatch = useDispatch();
  const { isVisible, message, type } = useSelector((state) => state.downloading);

  useEffect(() => {
    let timer;
    if (type === "success" || type === "error") {
      timer = setTimeout(() => {
        dispatch(hideDownloading());
      }, 6000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [type, dispatch, message]);

  const handleCloseSnackbar = () => {
    dispatch(hideDownloading());
  };

  const renderIcon = () => {
    if (type === "downloading") {
      return <CloudDownload fontSize="small" />;
    }

    if (type === "error") {
      return (
        <Lottie
          animationData={alertError}
          style={{
            height: "1.8rem",
            width: "1.8rem",
            margin: 0,
          }}
          autoplay
          loop={false}
        />
      );
    }

    if (type === "success") {
      return (
        <Lottie
          animationData={alertSuccess}
          style={{
            height: "1.8rem",
            width: "1.8rem",
            margin: 0,
          }}
          autoplay
          loop={false}
        />
      );
    }

    return null;
  };

  return (
    <Snackbar open={isVisible} onClose={handleCloseSnackbar} TransitionComponent={SlideTransition} autoHideDuration={type === "downloading" ? null : 6200} anchorOrigin={{ vertical: "top", horizontal: "left" }} sx={{ zIndex: 9999 }}>
      <Alert
        severity={type === "downloading" ? "info" : type}
        sx={{
          display: "flex",
          alignItems: "center",
          minWidth: "20rem",
          bgcolor: type === "downloading" && "#e0e0e096",
        }}
        icon={renderIcon()}
        action={
          type !== "downloading" && (
            <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )
        }
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            fontWeight: 600,
          }}
        >
          {message}
        </span>
      </Alert>
    </Snackbar>
  );
}
