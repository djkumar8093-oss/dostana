import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import axiosInstance from "../../configs/axiosInstance";
import { SocketContext } from "../../contextProvider/SocketProvider.jsx";

const removeFriendApi = async (friendId) => {
  const response = await axiosInstance.delete(`/friend/remove-friend/${friendId}`);
  return response.data;
};

const getFriendsApi = async ({ pageParam = 1 }) => {
  const response = await axiosInstance.get(`/friend/friends?page=${pageParam}&limit=10`);
  return response.data;
};
const fetchRelationshipApi = async (userId) => {
  const response = await axiosInstance.get(`/friend/relationship/${userId}`);
  return response.data;
};

const fetchFriendOnlineStatusApi = async (userId) => {
  const response = await axiosInstance.get(`/friend/user-status/${userId}`);
  return response.data.userStatus;
};
const fetchSearchFriendRelationships = async ({ queryKey }) => {
  const [_key, { type, query, page = 1, limit = 10 }] = queryKey;
  const response = await axiosInstance.get("/friend/search", {
    params: { type, query, page, limit },
  });
  return response.data;
};

export const useRemoveFriend = () => {
  const socket = useContext(SocketContext);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFriendApi,
    onMutate: () => {},
    onSuccess: (data, friendId) => {
      const { friendship } = data;
      const requester = friendship.requester;
      const recipient = friendship.recipient;
      // Remove the friend from the "friends" cache
      socket.emit("friend-removed", {
        targetUserId: friendId,
        requesterProfile: requester._id === friendId ? recipient : requester,
      });
      queryClient.setQueryData(["friends"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            friends: page.friends.filter((friend) => friend._id !== friendId),
          })),
        };
      });
      // Update relationship cache to "none"
      queryClient.setQueryData(["relationship", friendId], {
        message: "No relationship found",
        relationship: "none",
      });
      // Add the removed friend back into "suggestedUsers" if not already present
      queryClient.setQueryData(["suggestedUsers"], (oldData) => {
        if (!oldData || oldData.pages.length === 0) return oldData;
        const user = requester._id === friendId ? requester : recipient;
        const otherUser = { ...user, status: "none" };

        const firstPage = oldData.pages[0];

        firstPage.suggestedUsers.push({ ...otherUser, status: "none" });
        return { ...oldData };
      });
    },

    onError: (err) => {},
    onSettled: () => {},
  });
};

export const useGetFriends = () => {
  return useInfiniteQuery({
    queryKey: ["friends"],
    queryFn: getFriendsApi,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextPage : undefined),
  });
};

export const useGetRelationshipById = (userId) =>
  useQuery({
    queryKey: ["relationship", userId],
    queryFn: () => fetchRelationshipApi(userId),
    enabled: Boolean(userId),
  });

export const useGetFriendOnlineStatus = ({ userId, mode }) =>
  useQuery({
    queryKey: ["friendOnlineStatus", userId],
    queryFn: () => fetchFriendOnlineStatusApi(userId),
    enabled: Boolean(userId) && (mode === "friends" || mode === "chats"),
  });

export const useSearchFriendRelationships = ({ type, query, page = 1, limit = 10, enabled }) => {
  return useQuery({ queryKey: ["searchFriendRelationships", { type, query, page, limit }], queryFn: fetchSearchFriendRelationships, enabled });
};
