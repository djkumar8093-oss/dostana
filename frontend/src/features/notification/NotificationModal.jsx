import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle, List, SpeedDial, SpeedDialAction, Stack, Typography, Skeleton, CircularProgress, useMediaQuery, Box, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import { DeleteRounded, SettingsRounded, NotificationsActiveRounded } from "@mui/icons-material";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import Lottie from "lottie-react";
import { notificationAnimation } from "../../animation";

import { useMarkNotificationsAsReadByIds } from "../../hooks/notification/notificationReader";
import { useDeleteAllNotifications, useGetNotifications } from "../../hooks/notification/notification";
import NotificationList from "./NotificationList";
import { AnimatePresence } from "motion/react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useGetNotificationSetting, useToggleNotificationSetting } from "../../hooks/notification/notificationSetting";

// Custom styled SpeedDial component
const CustomSpeedDial = styled(SpeedDial)(({ theme }) => ({
  position: "relative",
  "& .MuiFab-root": {
    backgroundColor: "transparent",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "transparent",
      boxShadow: "none",
    },
    "&:active": {
      backgroundColor: "transparent",
    },
  },
}));

// eslint-disable-next-line react/prop-types
const NotificationModal = ({ open, handleClose }) => {
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const [openSetting, setOpenSetting] = useState(false);
  const dialogContentRef = useRef(null);
  const bottomRef = useRef(null);
  const viewedNotificationIdsRef = useRef(new Set());

  const { mutate: markNotificationsAsReadByIds } = useMarkNotificationsAsReadByIds();

  // Mark notifications as read when the modal is closed
  useEffect(() => {
    return () => {
      const ids = Array.from(viewedNotificationIdsRef.current);
      if (ids.length > 0) {
        markNotificationsAsReadByIds(ids);
      }
    };
  }, [markNotificationsAsReadByIds]);

  const handleOpenSettings = () => setOpenSetting(true);
  const handleCloseSetting = () => setOpenSetting(false);

  const isBelow600 = useMediaQuery("(max-width:600px)");

  // Fetch notification settings
  const { data: notificationData } = useGetNotificationSetting();
  const bulletNotificationEnabled = notificationData?.bulletNotificationEnabled;

  const { mutate: toggleNotificationSetting, isPending: isTogglingSetting } = useToggleNotificationSetting();
  const handleToggleNotifications = () => {
    toggleNotificationSetting();
  };

  // Fetch notifications
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetNotifications();
  const notifications = useMemo(() => (data ? data.pages.flatMap((page) => page.notifications) : []), [data]);

  // Delete all notifications
  const { mutate: deleteAllNotifications, isPending: isDeletingNotifications } = useDeleteAllNotifications();
  const handleDeleteAll = () => {
    deleteAllNotifications(null, {
      onSuccess: () => {
        handleCloseSetting();
      },
    });
  };

  // Infinite scroll for notifications
  useEffect(() => {
    const currentRef = bottomRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: dialogContentRef.current,
        threshold: 0.1,
      }
    );
    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [bottomRef, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Track viewed notifications
  const handleNotificationViewed = useCallback((notificationId) => {
    viewedNotificationIdsRef.current.add(notificationId);
  }, []);

  // Close the notification modal
  const hideNotificationModal = useCallback(() => {
    handleClose();
  }, [handleClose]);

  // Use the push notifications hook

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth={isSmallScreen ? "xs" : "sm"} fullScreen={isBelow600}>
      {/* Header with title and SpeedDial */}
      <Stack
        sx={{
          width: "100%",
          paddingX: isSmallScreen ? "0.5rem" : "1rem",
          pt: { sm: "1rem" },
          position: "relative",
        }}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack sx={{ alignItems: "center", flexDirection: "row", py: ".3rem" }}>
          {isBelow600 && (
            <IconButton onClick={hideNotificationModal}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <DialogTitle
            sx={{
              fontWeight: "bold",
              fontSize: isSmallScreen ? "1rem" : "1.3rem",
              p: 0,
              m: 0,
            }}
          >
            Notifications
          </DialogTitle>
        </Stack>
        <Stack sx={{ position: "absolute", zIndex: 1300, right: "1rem" }}>
          <CustomSpeedDial
            ariaLabel="Notification settings"
            icon={<SettingsRounded color="action" />}
            onOpen={handleOpenSettings}
            onClose={handleCloseSetting}
            open={openSetting}
            direction="left"
            FabProps={{
              size: "medium",
              sx: {
                "&:hover": {
                  transform: "rotate(45deg)",
                  transition: "transform 0.3s",
                },
              },
            }}
          >
            {/* Delete All Notifications */}
            <SpeedDialAction
              icon={isDeletingNotifications ? <CircularProgress size={24} /> : <DeleteRounded />}
              tooltipTitle={isDeletingNotifications ? "Deleting..." : "Delete All"}
              onClick={handleDeleteAll}
              tooltipPlacement={isSmallScreen ? "top" : "right"}
            />
            {/* Toggle In-App (Bullet) Notifications */}
            <SpeedDialAction
              icon={isTogglingSetting ? <CircularProgress size={24} /> : bulletNotificationEnabled ? <NotificationsActiveRounded /> : <NotificationsOffIcon />}
              tooltipTitle={bulletNotificationEnabled ? "Turn Off Notifications" : "Turn On Notifications"}
              onClick={handleToggleNotifications}
              tooltipPlacement={isSmallScreen ? "top" : "right"}
            />
          </CustomSpeedDial>
        </Stack>
      </Stack>

      {/* Notification content */}
      <DialogContent
        ref={dialogContentRef}
        sx={{
          maxHeight: { xs: "100vh", sm: "60vh" },
          overflowY: "auto",
          padding: isSmallScreen ? "0.5rem" : "1rem",
        }}
      >
        {isLoading ? (
          // Loading skeleton
          Array.from(new Array(5)).map((_, idx) => <Skeleton key={idx} variant="rectangular" height={60} sx={{ borderRadius: ".6rem", marginBottom: "0.5rem" }} />)
        ) : notifications && notifications.length > 0 ? (
          // Notification list
          <List sx={{ width: "100%", px: ".4rem" }}>
            <AnimatePresence>
              {notifications.map((notification) => (
                <NotificationList key={notification._id} notification={notification} onView={handleNotificationViewed} hideNotificationModal={hideNotificationModal} />
              ))}
            </AnimatePresence>
            <div ref={bottomRef} style={{ height: "1px" }}></div>
            {isFetchingNextPage && (
              <Stack alignItems="center" justifyContent="center" sx={{ padding: "1rem" }}>
                <CircularProgress size={24} />
              </Stack>
            )}
          </List>
        ) : (
          // Empty state
          <Stack justifyContent="center" alignItems="center" sx={{ width: "100%", padding: "1rem" }}>
            <Lottie
              animationData={notificationAnimation}
              style={{
                height: "40%",
                width: "40%",
                objectFit: "cover",
              }}
            />
            <Typography variant="body1" sx={{ marginTop: "1rem", transform: "translateY(-3rem)" }}>
              No notifications yet.
            </Typography>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(NotificationModal);
