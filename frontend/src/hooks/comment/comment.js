import { useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import axiosInstance from "../../configs/axiosInstance";
import { useCreateNotification } from "../notification/notification";
import { useContext } from "react";
import { SocketContext } from "../../contextProvider/SocketProvider";

// API calls
const createCommentApi = async (data) => (await axiosInstance.post("/comment", data)).data;
const deleteCommentApi = async ({ commentId }) => (await axiosInstance.delete(`/comment/delete/${commentId}`)).data;
const fetchCommentsForContent = async ({ pageParam = 1, contentId, limit = 10 }) => (await axiosInstance.get(`/comment/${contentId}?page=${pageParam}&limit=${limit}`)).data;

// Hook: Create a Comment (updates query data only when the API call is successful)
export const useCreateComment = ({ type }) => {
  const queryClient = useQueryClient();
  const { mutate: createNotification } = useCreateNotification();
  const socket = useContext(SocketContext);

  return useMutation({
    mutationFn: createCommentApi, // Using explicit mutation function
    onSuccess: (response, variables) => {
      const { contentId, targetUserId } = variables;
      const newComment = response.comment;
      createNotification({
        type: "content-comment",
        referenceId: contentId,
        action: `Commented on your ${type}!`,
        user: targetUserId,
      });
      socket.emit("contentNewComment", { targetUserId, contentId, newComment });

      queryClient.setQueryData(["content-comments", contentId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page, index) => {
            // Add the new comment to the beginning of the first page
            if (index === 0) {
              return { ...page, comments: [newComment, ...page.comments] };
            }
            return page;
          }),
        };
      });
    },
    onError: (error, variables) => {
      // Optionally, show an alert or log the error here
    },
  });
};

// Hook: Delete Comment (updates query data only on successful deletion)
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  const socket = useContext(SocketContext);

  return useMutation({
    mutationFn: deleteCommentApi, // Using explicit mutation function
    onSuccess: (response, { commentId, targetUserId }) => {
      const { comment } = response;
      console.log(comment._id);
      socket.emit("contentCommentDeletion", { commentId, targetUserId });
      queryClient.setQueryData(["content-comments", comment.content], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            comments: page.comments.filter((c) => {
              console.log(c._id, comment._id);
              return c._id !== comment._id;
            }),
          })),
        };
      });
    },
    onError: (error) => {
      // Optionally, handle the error here (e.g. show an alert)
    },
  });
};

// Hook: Fetch Comments by Content ID (Infinite Query)
export const useGetCommentsForContent = ({ contentId, limit = 10 }) =>
  useInfiniteQuery({
    queryKey: ["content-comments", contentId],
    queryFn: ({ pageParam = 1 }) => fetchCommentsForContent({ contentId, pageParam, limit }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!contentId,
  });
