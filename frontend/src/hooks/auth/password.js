import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import axiosInstance from "../../configs/axiosInstance";
import { setLoading, showAlert } from "../../reduxSlices/alertSlice";
import { useNavigate } from "react-router-dom";

// API call to request password change
const requestChangePassword = async (data) => {
  console.log(data);
  const response = await axiosInstance.post("/auth/password/change", data);
  return response.data;
};

const requestResetPassword = async (data) => {
  const response = await axiosInstance.post("/auth/password/reset", data);
  return response.data;
};

const useChangePassword = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: requestChangePassword,
    onMutate: () => {
      dispatch(showAlert({ message: "Changing password...", type: "info", loading: true }));
    },
    onSuccess: () => {
      dispatch(showAlert({ message: "Password changed successfully!", type: "success", loading: false }));
    },
    onError: (error) => {
      let errorMessage = "Failed to change password. Please try again.";

      if (error.response?.status === 400) {
        errorMessage = error.response.data.message || "Invalid request data.";
      } else if (error.response?.status === 401) {
        errorMessage = "Incorrect password. Please try again.";
      }

      dispatch(showAlert({ message: errorMessage, type: "error", loading: false }));
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
};

// API call to request reset password

const useResetPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: requestResetPassword,
    onMutate: () => {
      dispatch(showAlert({ message: "Resetting password...", type: "info", loading: true }));
    },
    onSuccess: () => {
      dispatch(showAlert({ message: "Password reset successfully!Login with new password", type: "success", loading: false }));
      navigate("/login");
    },
    onError: (error) => {
      let errorMessage = "Failed to request password reset. Please try again.";
      console.log(error);
      // Handle specific errors
      if (error.response?.status === 404) {
        errorMessage = error.response.data.message || "Email not found.";
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = "Network error. Please check your connection.";
      }

      dispatch(showAlert({ message: errorMessage, type: "error", loading: false }));
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
};

export { useResetPassword, useChangePassword };
