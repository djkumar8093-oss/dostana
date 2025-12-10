import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../configs/axiosInstance";

// API call to fetch the authenticated user's profile
const fetchAuthenticatedUserProfile = async () => {
  const response = await axiosInstance.get("/profile");
  return response.data.userProfile;
};

// API call to fetch a user profile by a given id
const fetchUserProfileById = async (userId) => {
  const response = await axiosInstance.get(`/profile/${userId}`);
  return response.data.userProfile;
};

const searchUsersApi = async (query) => {
  if (!query) {
    throw new Error("Search query is required");
  }
  const response = await axiosInstance.get(`/profile/searchUsers?query=${query}`);
  return response.data.users; // Assuming the response contains a `users` array
};

// Hook to fetch the authenticated user's profile
export const useUserProfile = () => {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchAuthenticatedUserProfile,
    staleTime: 60 * 10000,
  });
};

// Hook to fetch a user profile by id
export const useGetUserProfileById = (userId) => {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => fetchUserProfileById(userId),
    staleTime: 60 * 10000,
    enabled: !!userId, // Only run query if userId is provided
  });
};

export const useSearchUsers = (query) => {
  return useQuery({
    queryKey: ["searchUsers", query],
    queryFn: () => searchUsersApi(query),
    enabled: !!query, // Prevent the query from running if `query` is empty
  });
};
