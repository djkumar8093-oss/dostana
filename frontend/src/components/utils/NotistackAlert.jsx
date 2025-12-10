import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSnackbar } from "notistack";
import { Alert, Avatar, Badge, Typography, Box, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import { hideNotistackAlert } from "../../reduxSlices/notistackAlertSlice";
import { notificationSound } from "../../assets";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": { transform: "scale(0.8)", opacity: 1 },
    "100%": { transform: "scale(2.4)", opacity: 0 },
  },
}));

const NotistackAlert = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const { isVisible, message, avatarSrc, notificationType, senderName } = useSelector((state) => state.notistackAlert);

  useEffect(() => {
    if (!isVisible) return;

    const sound = new Audio(notificationSound);
    sound.play().catch((error) => console.error("Error playing sound:", error));

    enqueueSnackbar("", {
      anchorOrigin: { vertical: "bottom", horizontal: "left" },
      content: (key) => (
        <Alert
          key={key}
          severity={notificationType === "friend_online" ? "info" : "success"}
          icon={
            <StyledBadge overlap="circular" variant="dot" anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
              <Avatar src={avatarSrc} sx={{ boxShadow: 3 }} />
            </StyledBadge>
          }
          sx={{
            display: "flex",
            alignItems: "center",
            color: "#333",
            fontSize: { xs: ".8rem", sm: "1rem" },
            textTransform: "none",
            borderRadius: ".4rem",
            bgcolor: "#fff",
            maxWidth: "100%",
          }}
          variant="filled"
          component={Paper}
          elevation={3}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", fontSize: { xs: ".8rem", sm: "1.1rem" } }}>
              {senderName}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: { xs: ".7rem", sm: "1rem" } }}>
              {message}
            </Typography>
          </Box>
        </Alert>
      ),
      autoHideDuration: 7000,
    });

    dispatch(hideNotistackAlert());
  }, [isVisible, message, avatarSrc, notificationType, senderName, enqueueSnackbar, dispatch]);

  return null;
};

export default NotistackAlert;
