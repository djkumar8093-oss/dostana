import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../configs/axiosInstance";

const logoutUserApi = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: logoutUserApi,
    onSuccess: (data) => {
      navigate("/login", { replace: true });
      queryClient.removeQueries();
      localStorage.clear();
    },
    onError: (error) => {
      if (error.code === "ERR_NETWORK") {
        console.error("Network error occurred during logout.");
      }
    },
  });
};

export { useLogout };
