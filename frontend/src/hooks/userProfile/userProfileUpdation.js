import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import axiosInstance from "../../configs/axiosInstance";
import { setLoading, showAlert } from "../../reduxSlices/alertSlice";

// API call for profile update
const updateProfileApi = async (data) => {
  const response = await axiosInstance.patch("/profile/update-profile", data, { headers: { "Content-Type": "multipart/form-data" } });
  return response.data;
};

const useUpdateProfile = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient(); // Access React Query Client

  return useMutation({
    mutationFn: updateProfileApi,
    onMutate: () => {
      dispatch(showAlert({ message: "Updating profile...", type: "info", loading: true }));
    },
    onSuccess: (response) => {
      // Invalidate and refetch the user profile query to get the latest data
      console.log(response);
      dispatch(showAlert({ message: "Profile updated successfully!", type: "success", loading: false }));
      queryClient.setQueryData(["userProfile"], () => response.userProfile);
    },
    onError: (error) => {
      let errorMessage = "Failed to update profile. Please try again.";
      console.log(error);
      // Handle specific errors
      if (error.response?.status === 400) {
        errorMessage = error.response.data.message || "Invalid profile data.";
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

// API call to delete user image

export { useUpdateProfile };
