import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import axiosInstance from "../../configs/axiosInstance";
import { setLoading, showAlert } from "../../reduxSlices/alertSlice";
import { useNavigate } from "react-router-dom";

// API call to delete the account
const requestDeleteAccountApi = async (data) => {
  const response = await axiosInstance.delete("/auth/account", { data });
  return response.data;
};
const useDeleteAccount = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: requestDeleteAccountApi,
    onSuccess: () => {
      navigate("/login");
      dispatch(showAlert({ message: "Account deleted successfully!", type: "success", loading: false }));
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("token");
    },
    onMutate: () => {
      dispatch(showAlert({ message: "Deleting account...", type: "info", loading: true }));
    },
    onError: (error) => {
      let errorMessage = "Failed to delete account. Please try again.";
      if (error.response?.status === 400) {
        errorMessage = error.response.data.message || "Invalid request data.";
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = "Network error. Please check your connection.";
      }
      dispatch(showAlert({ message: errorMessage, type: "error", loading: false }));
      localStorage.clear();
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
};

export { useDeleteAccount };
