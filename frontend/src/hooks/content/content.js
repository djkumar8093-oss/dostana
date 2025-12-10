import { useMutation, useQueryClient, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useContext } from "react";
import { setLoading, showAlert } from "../../reduxSlices/alertSlice";
import axiosInstance from "../../configs/axiosInstance";
import { SocketContext } from "../../contextProvider/SocketProvider";
import { updateContent } from "../../reduxSlices/contentSlice";
import { useUserProfile } from "../userProfile/userProfile";

const createContentApi = async (data) => {
  const response = await axiosInstance.post("/content/create-content", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

const deleteContentApi = async ({ contentId }) => {
  const response = await axiosInstance.delete(`/content/${contentId}`);
  return response.data;
};

const fetchContentsApi = async ({ pageParam = 1, userId = null }) => {
  const response = await axiosInstance.get("/content", {
    params: { page: pageParam, limit: 10, userId },
  });
  return response.data;
};

const fetchContentByIdApi = async (contentId) => {
  const response = await axiosInstance.get(`/content/${contentId}`);
  return response.data.content;
};

const prependToFirstPage = (oldData, newItem, listKey) => {
  if (!oldData || !oldData.pages || !oldData.pages.length) return oldData;
  const firstPage = oldData.pages[0];
  const updatedFirstPage = {
    ...firstPage,
    [listKey]: [newItem, ...firstPage[listKey]],
  };
  return {
    ...oldData,
    pages: [updatedFirstPage, ...oldData.pages.slice(1)],
  };
};

// Updated to accept pageParam for infinite scrolling
export const useCreateContent = ({ handleClose, type }) => {
  const socket = useContext(SocketContext);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createContentApi,
    onMutate: () => {
      // Immediately close modal and show posting alert
      handleClose();
      dispatch(setLoading(true));
      dispatch(showAlert({ type: "info", message: "Posting Content...", isPosting: true, loading: true }));
    },
    onSuccess: (response, { newContentId }) => {
      const newContent = response.content;
      dispatch(updateContent({ id: newContentId, updates: { status: "success" } }));

      queryClient.setQueryData(["contents"], (oldData) => prependToFirstPage(oldData, newContent, "contents"));

      queryClient.setQueryData(["contents", newContent.user._id], (oldData) => prependToFirstPage(oldData, newContent, "contents"));
      dispatch(setLoading(false));
      dispatch(showAlert({ type: "success", message: "Content posted successfully!", isPosting: false, loading: false }));
    },
    onError: (error, { newContentId }) => {
      dispatch(updateContent({ id: newContentId, updates: { status: "error" } }));
      dispatch(setLoading(false));
      dispatch(showAlert({ type: "error", message: "Failed to post content. Please try again.", isPosting: false }));
    },
    onSettled: () => {},
  });
};

export const useDeleteContent = ({ type = "post" }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContentApi,

    onSuccess: async (data) => {
      // Update the infinite query cache optimistically:
      const contentId = data.content._id;
      const contentOwnerId = data.content.user;

      queryClient.setQueryData(["contents"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            contents: page.contents.filter((c) => c._id !== contentId),
          })),
        };
      });
      queryClient.setQueryData(["contents", contentOwnerId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            contents: page.contents.filter((c) => c._id !== contentId),
          })),
        };
      });

      // socket.emit("contentDeletion", { contentId, contentOwnerId });
    },
    onError: (error) => {},
    onSettled: () => {},
  });
};

// Hook to fetch all content or user-specific content
export const useGetContents = (userId) => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: userId ? ["contents", userId] : ["contents"],
    queryFn: ({ pageParam = 1 }) => fetchContentsApi({ pageParam, userId }),
    getNextPageParam: (lastPage) => lastPage.nextPage || null,
  });

  return {
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    data,
  };
};

export const useGetContentById = ({ contentId }) => {
  return useQuery({
    queryKey: ["content", contentId], // Cache key includes contentId
    queryFn: () => fetchContentByIdApi(contentId),
    enabled: !!contentId, // Ensures the query only runs if contentId is provided
  });
};
