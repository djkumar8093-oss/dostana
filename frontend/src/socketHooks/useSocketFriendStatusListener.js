import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { showNotistackAlert } from "../reduxSlices/notistackAlertSlice";
import { useGetNotificationSetting } from "../hooks/notification/notificationSetting";

export const useSocketFriendStatusListener = (socket) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { data: notificationSetting } = useGetNotificationSetting();
  const bulletNotificationEnabled = notificationSetting?.bulletNotificationEnabled;

  const handleFriendStatusChanged = useCallback(
    (data) => {
      if (data.isOnline && bulletNotificationEnabled) {
        dispatch(
          showNotistackAlert({
            message: "Active now!",
            avatarSrc: data.profileImage,
            notificationType: "friend_online",
            senderName: data.name,
          })
        );
      }

      queryClient.setQueryData(["friendOnlineStatus", data.userId], (oldData) => {
        return oldData ? { ...oldData, isOnline: data.isOnline, lastSeen: data.lastSeen } : oldData;
      });
    },
    [dispatch, bulletNotificationEnabled, queryClient]
  );

  useEffect(() => {
    if (!socket) return;

    socket.on("friend-online-status", handleFriendStatusChanged);
    return () => socket.off("friend-online-status", handleFriendStatusChanged);
  }, [socket, handleFriendStatusChanged]);
};
