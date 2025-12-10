import { useEffect, useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SocketContext } from "../contextProvider/SocketProvider";
import { useDispatch } from "react-redux";
import { showNotistackAlert } from "../reduxSlices/notistackAlertSlice";
import { useGetNotificationSetting } from "../hooks/notification/notificationSetting";

export const useSocketNotificationListener = () => {
  const socket = useContext(SocketContext);
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { data: notificationSetting } = useGetNotificationSetting();
  const bulletNotificationEnabled = notificationSetting?.bulletNotificationEnabled;

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data) => {
      const { notification } = data;

      // Dispatch a notistack alert for the new notification if notifications are enabled.
      if (bulletNotificationEnabled) {
        dispatch(
          showNotistackAlert({
            message: notification.action,
            avatarSrc: notification.sender.profileImage,
            notificationType: "notification",
            senderName: `${notification.sender.firstName} ${notification.sender.lastName}`,
          })
        );
      }

      // Invalidate the unreadNotificationCount and notifications queries to fetch the latest data
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["notifications"], exact: true });
    };

    socket.on("new-notification", handleNewNotification);

    return () => {
      socket.off("new-notification", handleNewNotification);
    };
  }, [socket, queryClient, dispatch, bulletNotificationEnabled]);
};
