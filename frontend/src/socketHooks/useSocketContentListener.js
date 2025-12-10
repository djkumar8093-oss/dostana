import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";

export const useSocketContentListener = (socket, userProfile) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // Helper: Update paginated data by applying a transformation to every page.
  const updatePages = (oldData, transformPage) => {
    if (!oldData || !oldData.pages) return oldData;
    return {
      ...oldData,
      pages: oldData.pages.map(transformPage),
    };
  };

  const updateContentReactions = (contents, contentId, userId, isReacted, reaction) => {
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

  const handleReaction = useCallback(
    async (socketData) => {
      // Skip if the reaction came from the current user.
      if (socketData.userId === userProfile?._id) return;

      const { contentId, targetUserId, data: reactionData } = socketData;
      const {
        reactionDetails: { isReacted, reaction, userId },
      } = reactionData;

      const updateDataForKey = (queryKey) => {
        const getValue = queryClient.getQueryData(queryKey);
        if (!getValue) return;
        queryClient.setQueryData(queryKey, (oldData) => {
          if (!oldData || !oldData.pages) return oldData;
          return updatePages(oldData, (page) => ({
            ...page,
            contents: updateContentReactions(page.contents, contentId, userId, isReacted, reaction),
          }));
        });
      };

      // Update all queries that might contain the content.
      [["contents"], ["contents", targetUserId], ["shared-contents"], ["saved-contents"]].forEach((queryKey) => updateDataForKey(queryKey));
    },
    [queryClient, userProfile]
  );

  const handleContentShare = useCallback(
    async (data) => {
      // Instead of manually prepending, we invalidate the query to fetch updated data
      queryClient.invalidateQueries({ queryKey: ["shared-contents"], exact: true });
    },
    [queryClient]
  );

  const handleNewComment = useCallback(
    (data) => {
      // Expecting both contentId and newComment in the socket data
      const { contentId, newComment } = data;
      // Get current comments data for this content
      const oldData = queryClient.getQueryData(["content-comments", contentId]);
      if (!oldData) return;

      // Update the cache by prepending the new comment to the first page
      queryClient.setQueryData(["content-comments", contentId], (oldData) => {
        if (!oldData || !oldData.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page, index) => {
            if (index === 0) {
              return { ...page, comments: [newComment, ...page.comments] };
            }
            return page;
          }),
        };
      });
    },
    [queryClient]
  );

  const handleContentCommentDeletion = useCallback(
    (data) => {
      const { commentId } = data;
      queryClient.setQueryData(["content-comments", commentId], (oldData) => {
        if (!oldData) return oldData;
        return updatePages(oldData, (page) => ({
          ...page,
          comments: page.comments.filter((c) => c._id !== commentId),
        }));
      });
    },
    [queryClient]
  );

  useEffect(() => {
    if (!socket) return;

    socket.on("contentReaction", handleReaction);
    socket.on("contentShare", handleContentShare);
    socket.on("contentNewComment", handleNewComment);
    socket.on("contentCommentDeletion", handleContentCommentDeletion);

    return () => {
      socket.off("contentReaction", handleReaction);
      socket.off("contentShare", handleContentShare);
      socket.off("contentNewComment", handleNewComment);
      socket.off("contentCommentDeletion", handleContentCommentDeletion);
    };
  }, [socket, handleReaction, handleContentShare, handleNewComment, handleContentCommentDeletion]);
};
