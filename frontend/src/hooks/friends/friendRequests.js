import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import axiosInstance from "../../configs/axiosInstance";
import { useUserProfile } from "../userProfile/userProfile";
import { useCreateNotification } from "../notification/notification";
import { showAlert } from "../../reduxSlices/alertSlice";
import { useContext } from "react";
import { SocketContext } from "../../contextProvider/SocketProvider.jsx";

const acceptFriendRequestApi = async (requesterId) => {
  const response = await axiosInstance.post(`/friend/accept-request/${requesterId}`);
  return response.data;
};

const declineFriendRequestApi = async (requesterId) => {
  const response = await axiosInstance.post(`/friend/decline-request/${requesterId}`);
  return response.data;
};

const getFriendRequestsApi = async ({ pageParam = 1 }) => {
  const response = await axiosInstance.get(`/friend/friend-requests?page=${pageParam}&limit=10`);
  return response.data;
};
const getFriendRequestCountApi = async () => {
  const response = await axiosInstance.get("/friend/friend-requests?countOnly=true");
  return response.data.total;
};

const manageFriendRequestsApi = async (action) => {
  const response = await axiosInstance.post("/friend/manage-requests", { action });
  return response.data;
};

const useAcceptFriendRequest = () => {
  const socket = useContext(SocketContext);
  const queryClient = useQueryClient();

  const { mutate: createNotification } = useCreateNotification();

  return useMutation({
    mutationFn: acceptFriendRequestApi,
    onMutate: () => {},
    onSuccess: (data, requesterId) => {
      const { friendRequest } = data;
      const requester = friendRequest.requester;
      const recipient = friendRequest.recipient;
      socket.emit("friend-request-accepted", {
        targetUserId: requesterId,
        requesterProfile: recipient,
      });

      createNotification({
        referenceId: recipient._id,
        type: "friend_request_accepted",
        userId: requesterId,
        action: "Accepted your friend request!",
      });

      // Remove the accepted request from the "friendRequests" cache
      queryClient.setQueryData(["friendRequests"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            friendRequests: page.friendRequests.filter((req) => req._id !== requesterId),
          })),
        };
      });

      // Add the new friend to the "friends" cache (prepend to first page)
      queryClient.setQueryData(["friends"], (oldData) => {
        if (!oldData || oldData.pages.length === 0) return { pages: [{ friends: [requester] }] };
        const firstPage = oldData.pages[0];
        return {
          ...oldData,
          pages: [{ ...firstPage, friends: [requester, ...firstPage.friends] }, ...oldData.pages.slice(1)],
        };
      });

      // Update relationship cache
      queryClient.setQueryData(["relationship", requesterId], {
        message: "Users are friends",
        relationship: "friends",
      });

      queryClient.setQueryData(["friendRequestCount"], (oldCount) => (typeof oldCount === "number" ? oldCount - 1 : oldCount));
    },
    onError: (err) => {},
    onSettled: () => {},
  });
};

const useDeclineFriendRequest = () => {
  const socket = useContext(SocketContext);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: declineFriendRequestApi,
    onMutate: () => {},
    onSuccess: (data, requesterId) => {
      const { friendRequest } = data;
      const requester = { ...friendRequest.requester, status: "none" };
      const recipient = friendRequest.recipient;

      socket.emit("friend-request-declined", {
        targetUserId: requesterId,
        requesterProfile: recipient,
      });

      // Remove the declined request from the "friendRequests" cache
      queryClient.setQueryData(["friendRequests"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            friendRequests: page.friendRequests.filter((req) => req._id !== requesterId),
          })),
        };
      });

      // Update relationship cache to "none"
      queryClient.setQueryData(["relationship", requesterId], {
        message: "No relationship found",
        relationship: "none",
      });

      queryClient.setQueryData(["friendRequestCount"], (oldCount) => (typeof oldCount === "number" ? oldCount - 1 : oldCount));

      // Update "suggestedUsers": mark the user as available for friend request
      queryClient.setQueryData(["suggestedUsers"], (oldData) => {
        if (!oldData) {
          // If the suggestedUsers cache doesn't exist, create one with the requester.
          return {
            pages: [{ suggestedUsers: [requester] }],
            pageParams: [undefined],
          };
        }
        const newPages = [...oldData.pages];
        if (newPages.length > 0) {
          newPages[0] = {
            ...newPages[0],
            suggestedUsers: [requester, ...newPages[0].suggestedUsers],
          };
        } else {
          // In case pages array exists but is empty.
          newPages.push({ suggestedUsers: [requester] });
        }
        return { ...oldData, pages: newPages };
      });
    },
    onError: (err) => {
      console.log(err);
    },
    onSettled: () => {},
  });
};

const useFriendRequestCount = () => {
  return useQuery({
    queryKey: ["friendRequestCount"],
    queryFn: getFriendRequestCountApi,
  });
};

const useManageFriendRequests = (action) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const socket = useContext(SocketContext);
  const { data: userProfile } = useUserProfile();
  const { mutate: createNotification } = useCreateNotification();

  return useMutation({
    mutationFn: () => manageFriendRequestsApi(action),
    onMutate: () => {},
    onSuccess: (data) => {
      // data: { message, friendRequests: [...], action }
      const { friendRequests, message, action: performedAction } = data;

      if (performedAction === "accept_all") {
        dispatch(showAlert({ message: "All friend requests accepted!", type: "success", loading: false }));
        // Process accepted friend requests
        friendRequests.forEach((request) => {
          // Emit socket event to notify the requester their friend request was accepted
          socket.emit("friend-request-accepted", {
            targetUserId: request.requester._id,
            requesterProfile: request.recipient,
          });
          // Create a notification for the requester
          createNotification({
            referenceId: request.recipient._id,
            type: "friend_request_accepted",
            userId: request.requester._id,
            action: "Accepted your friend request!",
          });
          // Update relationship cache: mark requester as friend
          queryClient.setQueryData(["relationship", request.requester._id], {
            message: "Users are friends",
            relationship: "friends",
          });
          // Add the new friend to the friends cache (prepend to first page)
          queryClient.setQueryData(["friends"], (oldData) => {
            if (!oldData || oldData.pages.length === 0) {
              return { pages: [{ friends: [request.requester] }] };
            }
            const firstPage = oldData.pages[0];
            return {
              ...oldData,
              pages: [{ ...firstPage, friends: [request.requester, ...firstPage.friends] }, ...oldData.pages.slice(1)],
            };
          });
        });
        // Remove accepted requests from the friendRequests cache
        queryClient.setQueryData(["friendRequests"], (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              friendRequests: page.friendRequests.filter((req) => !friendRequests.some((r) => r.requester._id === req._id)),
            })),
          };
        });
        // Update the friend request count
        queryClient.setQueryData(["friendRequestCount"], (oldCount) => (typeof oldCount === "number" ? oldCount - friendRequests.length : oldCount));
      } else if (performedAction === "cancel_all") {
        dispatch(showAlert({ message: "All friend requests declined!", type: "success", loading: false }));
        // Process cancellation of all pending requests
        friendRequests.forEach((request) => {
          socket.emit("friend-request-cancelled", {
            targetUserId: request.requester._id,
            requesterProfile: request.recipient,
          });
          // Update relationship cache: mark requester as having no relationship
          queryClient.setQueryData(["relationship", request.requester._id], {
            message: "No relationship found",
            relationship: "none",
          });
        });
        // Remove canceled requests from friendRequests cache
        queryClient.setQueryData(["friendRequests"], (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              friendRequests: page.friendRequests.filter((req) => !friendRequests.some((r) => r.requester._id === req._id)),
            })),
          };
        });
        queryClient.setQueryData(["friendRequestCount"], (oldCount) => (typeof oldCount === "number" ? oldCount - friendRequests.length : oldCount));
        // Update suggestedUsers: add back each requester with "none" status
        queryClient.setQueryData(["suggestedUsers"], (oldData) => {
          if (!oldData) return oldData;
          const newPages = [...oldData.pages];
          friendRequests.forEach((request) => {
            const requester = { ...request.requester, status: "none" };
            newPages[0].suggestedUsers.push(requester);
          });
          return { ...oldData, pages: newPages };
        });
      } else if (performedAction === "remove_all") {
        dispatch(showAlert({ message: "All friends removed!", type: "success", loading: false }));
        // Process removal of all friends
        friendRequests.forEach((friendship) => {
          // Determine the friend (the other party)
          const friendId = friendship.requester._id === userProfile?._id ? friendship.recipient._id : friendship.requester._id;
          socket.emit("friend-removed", {
            targetUserId: friendId,
            requesterProfile: friendship.requester._id === userProfile?._id ? friendship.recipient : friendship.requester,
          });
          // Update relationship cache to "none"
          queryClient.setQueryData(["relationship", friendId], {
            message: "No relationship found",
            relationship: "none",
          });
          // Remove the friend from the friends cache
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
          // Add the removed friend to the suggestedUsers list
          queryClient.setQueryData(["suggestedUsers"], (oldData) => {
            if (!oldData || oldData.pages.length === 0) return oldData;
            const friendObj = friendship.requester._id === userProfile?._id ? friendship.recipient : friendship.requester;
            friendObj.status = "none";
            oldData.pages[0].suggestedUsers.push(friendObj);
            return oldData;
          });
        });
      }
    },
    onError: (err) => {
      console.log(err);
    },
    onSettled: () => {},
  });
};

const useGetFriendRequests = () => {
  return useInfiniteQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequestsApi,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextPage : undefined),
  });
};

export { useAcceptFriendRequest, useDeclineFriendRequest, useGetFriendRequests, useManageFriendRequests, useFriendRequestCount };
