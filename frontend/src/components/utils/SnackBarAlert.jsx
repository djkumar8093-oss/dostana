import React, { useEffect } from "react";
import { Snackbar, Slide, Alert, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import Lottie from "lottie-react";
import { hideAlert } from "../../reduxSlices/alertSlice";
import { alertError, alertSpinner, alertSuccess } from "../../animation";

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

export default function SnackBarAlert() {
  const dispatch = useDispatch();
  const { isVisible, message, type, loading } = useSelector((state) => state.alert);

  // Close the alert automatically only if notifications are enabled
  useEffect(() => {
    if (type === "success" || type === "error") {
      const timer1 = setTimeout(() => {
        dispatch(hideAlert());
      }, 6000);
      return () => clearTimeout(timer1);
    }
  }, [type, dispatch, message]);

  // Updated handleCloseSnackbar to ignore "clickaway" events
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch(hideAlert());
  };

  const renderIcon = () => {
    if (loading) {
      return <Lottie animationData={alertSpinner} style={{ height: "1.8rem", width: "1.8rem", margin: 0 }} autoplay loop />;
    }
    if (type === "error") {
      return <Lottie animationData={alertError} style={{ height: "1.8rem", width: "1.8rem", margin: 0 }} autoplay loop={false} />;
    }
    if (type === "success") {
      return <Lottie animationData={alertSuccess} style={{ height: "1.8rem", width: "1.8rem", margin: 0 }} autoplay loop={false} />;
    }
    return null;
  };

  return (
    <Snackbar open={isVisible} onClose={handleCloseSnackbar} TransitionComponent={SlideTransition} autoHideDuration={loading ? null : 6200} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
      <Alert
        severity={type}
        sx={{
          display: "flex",
          alignItems: "center",
          minWidth: { xs: "15rem", sm: "20rem" },
          bgcolor: loading && "#e0e0e096",
          maxWidth: "100%",
          fontSize: { xs: "0.7rem", sm: "1rem" },
          mt: { xs: "2rem", sm: ".6rem" },
        }}
        icon={renderIcon()}
        action={
          !loading && (
            <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )
        }
      >
        <span style={{ display: "flex", alignItems: "center", fontWeight: 600 }}>{message || "Something went wrong"}</span>
      </Alert>
    </Snackbar>
  );
}
