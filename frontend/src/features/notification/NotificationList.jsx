/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from "react";
import { Avatar, IconButton, Paper, Box, Typography, ListItemButton, CircularProgress, Menu, MenuItem } from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import { formatDate } from "../../utilsFunction/dateFn";
import { useNavigate } from "react-router-dom";
import SingleContentModal from "../../components/content/SingleContentModal";
import { useDeleteNotification } from "../../hooks/notification/notification";
import { motion } from "motion/react";

const NotificationList = ({ notification, onView, hideNotificationModal }) => {
  const navigate = useNavigate();
  const { mutate: deleteNotification, isPending: isDeletingNotification } = useDeleteNotification();
  const [selectedContentId, setSelectedContentId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const containerRef = useRef(null);

  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    deleteNotification(notification?._id, {
      onSuccess: () => {
        handleMenuClose();
      },
    });
  };

  const handleNavigate = (event) => {
    // Prevent navigation if the menu is open
    if (anchorEl) {
      handleMenuClose();
      return;
    }
    if (notification?.type === "friend_request_sent" || notification?.type === "friend_request_accepted") {
      navigate(`/user-profile/${notification?.referenceId}`);
      hideNotificationModal && hideNotificationModal();
    } else if (notification?.type === "content-comment" || notification?.type === "content-reaction" || notification?.type === "content-share") {
      setSelectedContentId(notification?.referenceId);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (onView) {
              onView(notification?._id);
            }
            observerInstance.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [notification?._id, onView, notification]);

  return (
    <>
      <motion.div exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
        <Paper
          ref={containerRef}
          elevation={3}
          sx={{
            borderRadius: "1rem",
            padding: "0.8rem",
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
            width: "100%",
            cursor: "pointer",
            position: "relative",
            py: "1rem",
          }}
          component={ListItemButton}
          disableRipple
          onClick={handleNavigate}
        >
          <Avatar src={notification?.sender?.profileImage} sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }} />
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="body1" fontWeight={600} sx={{ fontSize: { xs: ".8rem", sm: "1rem" } }}>
              {notification?.sender?.firstName || ""} {notification?.sender?.lastName || ""}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: ".8rem", sm: ".9rem" } }}>
              {notification?.action}
            </Typography>
          </Box>
          <Box
            sx={{
              ml: "auto",
              textAlign: "right",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              mr: { xs: "-.5rem", sm: 0 },
            }}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(e);
              }}
            >
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem onClick={handleDelete}>{isDeletingNotification ? <CircularProgress size={20} /> : "Delete"}</MenuItem>
            </Menu>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ position: "absolute", bottom: -2, right: 12 }}>
            {formatDate(notification?.createdAt)}
          </Typography>
        </Paper>

        {selectedContentId && <SingleContentModal contentId={selectedContentId} open={Boolean(selectedContentId)} handleClose={() => setSelectedContentId(null)} />}
      </motion.div>
    </>
  );
};

export default React.memo(NotificationList);
