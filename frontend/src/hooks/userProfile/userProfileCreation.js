import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../configs/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showAlert, setLoading } from "../../reduxSlices/alertSlice";

// API call for profile creation
const createProfileApi = async (data) => {
  const response = await axiosInstance.post("/profile/create-profile", data, { headers: { "Content-Type": "multipart/form-data" } });
  return response.data;
};

const useProfileCreation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProfileApi,
    onMutate: () => {
      dispatch(showAlert({ message: "Creating profile...", type: "info", loading: true }));
    },
    onSuccess: (response) => {
      dispatch(showAlert({ message: "Welcome to Dostana ", type: "success", loading: false }));
      queryClient.invalidateQueries(["userProfile"]);
      queryClient.removeQueries(["userProfile"]);
      navigate("/home");
    },
    onError: (error) => {
      let errorMessage = "Failed to create profile. Please try again.";
      console.log(error);

      // Handle specific errors if needed
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

export { useProfileCreation };
