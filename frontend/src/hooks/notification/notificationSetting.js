import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../configs/axiosInstance";
import { useDispatch } from "react-redux";
import { showAlert } from "../../reduxSlices/alertSlice";

// API Calls
const toggleNotificationSettingApi = async () => {
  const response = await axiosInstance.patch("/notification/setting");
  return response.data;
};

const getNotificationSettingApi = async () => {
  const response = await axiosInstance.get("/notification/setting");
  return response.data;
};

const getPushNotificationSettingApi = async () => {
  const response = await axiosInstance.get("/notification/push-subscription");
  return response.data;
};

const togglePushNotificationSettingApi = async () => {
  const response = await axiosInstance.patch("/notification/push-subscription");
  return response.data;
};

// React Query Hooks
export const useToggleNotificationSetting = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { data: notificationSetting } = useGetNotificationSetting();

  const bulletNotificationEnabled = notificationSetting?.bulletNotificationEnabled;
  return useMutation({
    mutationFn: toggleNotificationSettingApi,
    onMutate: () => {
      dispatch(showAlert({ message: `${bulletNotificationEnabled ? "Disabling" : "Enabling"} bullet notifications...`, type: "info", loading: true }));
    },
    onSuccess: (data) => {
      console.log("Notification setting toggled:", data);
      dispatch(showAlert({ message: `Bullet notifications ${data.bulletNotificationEnabled ? "enabled" : "disabled"} `, type: "success", loading: false }));
      queryClient.setQueryData(["notificationSetting"], (oldData) => ({
        ...oldData,
        ...data,
      }));
    },
    onError: (error) => {
      console.error("Error toggling notification setting:", error);
      dispatch(showAlert({ message: `Failed to ${bulletNotificationEnabled ? "disable" : "enable"} bullet notifications.`, type: "error", loading: false }));
    },
  });
};

export const useGetNotificationSetting = () => {
  return useQuery({
    queryKey: ["notificationSetting"],
    queryFn: getNotificationSettingApi,
  });
};

export const useGetPushNotificationSetting = () => {
  return useQuery({
    queryKey: ["pushNotificationSetting"],
    queryFn: getPushNotificationSettingApi,
  });
};
