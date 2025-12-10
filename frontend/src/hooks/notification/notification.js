import { useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../configs/axiosInstance";
import { setLoading, showAlert } from "../../reduxSlices/alertSlice";
import { useDispatch } from "react-redux";
import { useContext } from "react";
import { SocketContext } from "../../contextProvider/SocketProvider";

// Create a new notification
const createNotificationApi = async (notificationData) => {
  const response = await axiosInstance.post("/notification", notificationData);
  return response.data;
};

// Delete a specific notification
const deleteNotificationApi = async (notificationId) => {
  const response = await axiosInstance.delete(`/notification/delete/${notificationId}`);
  return response.data;
};

// Fetch notifications with pagination support for infinite scrolling
const fetchNotificationsInfiniteApi = async ({ pageParam = 1 }) => {
  // Adjust the limit (here set to 10) as needed.
  const response = await axiosInstance.get(`/notification?countOnly=false&page=${pageParam}&limit=10`);
  return response.data;
};

// Delete all notifications
const deleteAllNotificationsApi = async () => {
  const response = await axiosInstance.delete("/notification/delete-all");
  return response.data;
};

export const useCreateNotification = () => {
  const socket = useContext(SocketContext);
  return useMutation({
    mutationFn: createNotificationApi,
    onSuccess: (data) => {
      const { notification, userId } = data;
      socket.emit("new-notification", { targetUserId: userId, notification });
    },
    onError: (err) => {
      console.error("Error creating notification:", err);
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotificationApi,
    // Instead of removing the notification immediately (optimistic update),
    // we update the query cache only after a successful API response.
    onSuccess: (data, notificationId) => {
      // Update the infinite query data by filtering out the deleted notification from every page.

      queryClient.setQueryData(["notifications"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            notifications: page.notifications.filter((notification) => notification._id !== notificationId),
          })),
        };
      });
      // Optionally, invalidate queries to refetch fresh data.
    },
    onError: (error) => {
      console.error("Error deleting notification:", error);
    },
  });
};

// Infinite query hook for notifications
export const useGetNotifications = () => {
  return useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotificationsInfiniteApi,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  });
};

export const useDeleteAllNotifications = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAllNotificationsApi,
    onSuccess: () => {
      dispatch(
        showAlert({
          message: "All notifications deleted",
          type: "success",
          loading: false,
        })
      );
      // Update the cache to remove all notifications from every page.
      queryClient.setQueryData(["notifications"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            notifications: [],
          })),
        };
      });
      // Optionally, invalidate queries to refetch data.
    },
    onError: () => {
      dispatch(
        showAlert({
          message: "Failed to delete all notifications.",
          type: "error",
          loading: false,
        })
      );
    },
  });
};
