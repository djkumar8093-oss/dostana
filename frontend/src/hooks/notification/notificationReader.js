import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../configs/axiosInstance";

// API function for marking selected notifications as read by IDs
const markNotificationsAsReadByIdsApi = async (notificationIds) => {
  const response = await axiosInstance.patch("/notification/read", { notificationIds });
  return response.data;
};

// Hook to mark selected notifications as read
export const useMarkNotificationsAsReadByIds = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationsAsReadByIdsApi,
    onSuccess: (data, notificationIds) => {
      // Update the unread notification count in cache by subtracting the number of notifications marked as read.
      queryClient.setQueryData(["unreadNotificationCount"], (oldCount) => {
        if (typeof oldCount === "number") {
          return Math.max(oldCount - notificationIds.length, 0);
        }
        return oldCount;
      });
    },
  });
};

// API function to get unread notification count
const getUnreadNotificationCountApi = async () => {
  const response = await axiosInstance.get("/notification/unread/count");
  return response.data.unreadCount;
};

// Hook to get unread notification count
export const useGetUnreadNotificationCount = () => {
  return useQuery({
    queryKey: ["unreadNotificationCount"],
    queryFn: getUnreadNotificationCountApi,
  });
};
