import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axiosInstance from "../../configs/axiosInstance";
import { setLoading, showAlert } from "../../reduxSlices/alertSlice";

// API call for user signup
const signupApi = async (data) => {
  const response = await axiosInstance.post("/auth/signup", data);
  return response.data;
};

const useSignup = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch(); // For managing alert state

  return useMutation({
    mutationFn: signupApi,
    onMutate: () => {
      dispatch(showAlert({ message: "Signing up...", type: "info", loading: true }));
    },
    onSuccess: async () => {
      // Signup successful
      dispatch(showAlert({ message: "Signup successful", type: "success", loading: false }));

      // Redirect to profile setup page
      navigate("/welcome");

      // Refresh user profile data
      await queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      await queryClient.refetchQueries({ queryKey: ["userProfile"], exact: true });
    },
    onError: (error) => {
      let errorMessage = "Something went wrong. Please try again.";
      console.log(error);
      if (error.code === "ERR_NETWORK") {
        errorMessage = "Network error. Please check your connection.";
      }

      dispatch(showAlert({ message: errorMessage, type: "error", loading: false }));
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
};

export { useSignup };
