import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axiosInstance from "../../configs/axiosInstance";
import { showAlert } from "../../reduxSlices/alertSlice";

// API call for user login
const loginApi = async (data) => {
  const response = await axiosInstance.post("/auth/login", data);
  return response.data;
};

const useLogin = ({ passwordRef, emailRef }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch(); // For managing alert state

  return useMutation({
    mutationFn: loginApi,
    onMutate: () => {
      dispatch(showAlert({ message: "Logging in...", type: "info", loading: true }));
    },
    onSuccess: async () => {
      // Login successful
      dispatch(showAlert({ message: "Login successful", type: "success", loading: false }));
      // Refresh user profile data
      queryClient.removeQueries({ queryKey: ["userProfile"] });
      localStorage.setItem("isLoggedIn", true);
      navigate("/home");
    },
    onError: (error) => {
      console.log(error);
      let errorMessage = "Something went wrong. Please try again.";

      // Handle specific errors
      if (error.response?.status === 401) {
        errorMessage = "Invalid password.";
        if (passwordRef) {
          passwordRef.current.focus();
        }
      } else if (error.response?.status === 404) {
        errorMessage = error.response.data?.message || "Account has not been registered.";
        if (emailRef) {
          emailRef.current.focus();
        }
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = "Network error. Please check your connection.";
      }

      dispatch(showAlert({ message: errorMessage, type: "error", loading: false }));
    },
  });
};
export { useLogin };
