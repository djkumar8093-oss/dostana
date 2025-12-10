// src/apiRequests/share.js
import { useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import axiosInstance from "../../configs/axiosInstance";
import { setLoading, showAlert } from "../../reduxSlices/alertSlice";
import { useCreateNotification } from "../notification/notification";
import { useContext } from "react";
import { SocketContext } from "../../contextProvider/SocketProvider";
import { useUserProfile } from "../userProfile/userProfile";
import _ from "lodash";

// API call to share content
const shareContentApi = async (data) => {
  const response = await axiosInstance.post("/content/share", data);
  return response.data;
};

// API call to fetch paginated shared content
const fetchSharedContentsApi = async ({ pageParam = 1 }) => {
  const response = await axiosInstance.get("/content", {
    params: { page: pageParam, limit: 10, filterType: "shared" },
  });
  return response.data;
};

const useShareContent = ({ type }) => {
  const { mutate: createNotification } = useCreateNotification();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const socket = useContext(SocketContext);
  const { data: userProfile } = useUserProfile();
  return useMutation({
    mutationFn: shareContentApi,
    onMutate: () => {
      dispatch(
        showAlert({
          message: `Sharing ${type} with friends...`,
          type: "info",
          loading: true,
        })
      );
    },
    onSuccess: (response, { userIds }) => {
      // Assume the response contains the updated share document as `content`
      const newShare = response.content;

      userIds.forEach((userId) => {
        createNotification({
          type: "content-share",
          receiverIds: userIds,
          action: `Shared a ${type} with you!`,
          referenceId: newShare._id,
          user: userId,
        });
        socket.emit("contentShare", {
          targetUserId: userId,
          sharedContent: newShare,
          requesterProfile: {
            firstName: userProfile?.firstName,
            lastName: userProfile?.lastName,
            profileImage: userProfile?.profileImage,
            _id: userProfile?._id,
          },
        });
      });

      // Optimistically update the infinite query cache for shared contents:
      queryClient.setQueryData(["shared-contents"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page, index) => {
            if (index === 0) {
              return { ...page, contents: [newShare, ...page.contents] };
            }
            return page;
          }),
        };
      });
      dispatch(
        showAlert({
          message: `${type} shared with friends!`,
          type: "success",
          loading: false,
        })
      );
    },
    onError: (error) => {
      let errorMessage = `Failed to share ${type} with friends. Please try again.`;
      if (error.response?.status === 400) {
        errorMessage = error.response.data.message || "Invalid data provided.";
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = "Network error. Please check your connection.";
      }
      dispatch(
        showAlert({
          message: errorMessage,
          type: "error",
          loading: false,
        })
      );
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
};

const useGetSharedContent = () => {
  return useInfiniteQuery({
    queryKey: ["shared-contents"],
    queryFn: ({ pageParam = 1 }) => fetchSharedContentsApi({ pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage || null,
  });
};

export { useShareContent, useGetSharedContent };
