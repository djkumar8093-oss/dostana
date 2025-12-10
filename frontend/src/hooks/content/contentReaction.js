import { QueryClientContext, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../configs/axiosInstance";
import { notificationSound } from "../../assets";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCreateNotification } from "../notification/notification";
import { useContext } from "react";
import { SocketContext } from "../../contextProvider/SocketProvider";

const toggleReactionApi = async (data) => {
  const response = await axiosInstance.patch(`/content/${data.contentId}/reaction`, data);
  return response.data;
};

const getReactionsApi = async ({ contentId, pageParam = 1 }) => {
  const response = await axiosInstance.get(`/content/${contentId}/reactions`, {
    params: { page: pageParam },
  });
  return response.data;
};

export const updateQueryData = (queryClient, contentId, targetUserId, data) => {
  const {
    reactionDetails: { isReacted, reaction, userId },
  } = data;

  const updateContentReactions = (contents) => {
    if (!contents) return contents;
    return contents.map((content) => {
      if (content._id !== contentId) return content;

      const newReactions = new Map(content.reactionDetails.reactions.map((r) => [r.user._id, r]));

      if (isReacted) {
        newReactions.set(userId, reaction);
      } else {
        newReactions.delete(userId);
      }

      return {
        ...content,
        reactionDetails: {
          totalReactions: newReactions.size,
          reactions: Array.from(newReactions.values()),
        },
      };
    });
  };

  const updateData = (key) => {
    queryClient.setQueryData(key, (oldData) => {
      if (!oldData || !oldData.pages) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          contents: updateContentReactions(page.contents),
        })),
      };
    });
  };

  updateData(["contents"]);
  updateData(["contents", targetUserId]);
  updateData(["shared-contents"]);
  updateData(["saved-contents"]);
  queryClient.setQueryData(["content", contentId], (oldData) => updateContentReactions([oldData])[0] || oldData);
};

export const useToggleReaction = ({ type }) => {
  const socket = useContext(SocketContext);
  const queryClient = useQueryClient();
  const sound = new Audio(notificationSound);
  const { mutate: createNotification } = useCreateNotification();

  return useMutation({
    mutationFn: toggleReactionApi,
    onSuccess: (data, { contentId, targetUserId }) => {
      console.log(data);
      sound.play().catch(console.error);
      if (data.reactionDetails.isReacted) {
        createNotification({
          type: "content-reaction",
          userId: targetUserId,
          referenceId: contentId,
          action: `Reacted to your ${type}!`,
        });
      }
      socket.emit("contentReaction", { targetUserId, contentId, data });
      updateQueryData(queryClient, contentId, targetUserId, data);
    },
  });
};

export const useGetReactionsForContent = ({ contentId }) => {
  return useInfiniteQuery({
    queryKey: ["content-reactions", contentId],
    queryFn: ({ pageParam = 1 }) => getReactionsApi({ contentId, pageParam }),
    refetchOnMount: "always",
    staleTime: 0,
    getNextPageParam: (lastPage) => lastPage.reactionDetails.nextPage || null,
  });
};
