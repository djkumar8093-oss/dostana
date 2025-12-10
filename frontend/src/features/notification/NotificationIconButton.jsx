import React, { useState, useCallback, useMemo } from "react";
import { Badge, IconButton, Tooltip } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationModal from "./NotificationModal";
import { useGetUnreadNotificationCount } from "../../hooks/notification/notificationReader";

const NotificationButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: unreadCount, isLoading } = useGetUnreadNotificationCount();

  // ✅ Memoize toggleModal to prevent unnecessary re-renders
  const toggleModal = useCallback(() => {
    setIsModalOpen((prev) => !prev);
  }, []);

  // ✅ Memoize badgeContent calculation
  const badgeContent = useMemo(() => (!isLoading && unreadCount > 0 ? unreadCount : 0), [isLoading, unreadCount]);

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton onClick={toggleModal}>
          <Badge badgeContent={badgeContent} color="secondary" max={99}>
            <NotificationsIcon color="action" sx={{ width: { xs: "1.7rem", sm: "1.8rem", md: "2rem" }, height: { xs: "1.7rem", sm: "1.8rem", md: "2rem" } }} />
          </Badge>
        </IconButton>
      </Tooltip>

      {isModalOpen && <NotificationModal open={isModalOpen} handleClose={toggleModal} />}
    </>
  );
};

export default NotificationButton;
