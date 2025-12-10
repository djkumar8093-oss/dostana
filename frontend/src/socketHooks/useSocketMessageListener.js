import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { addMessageToChat, getLastMessageByChatId, removeMessageFromChat } from "../hooks/chat/message";
import { useDispatch } from "react-redux";
import { showNotistackAlert } from "../reduxSlices/notistackAlertSlice";
import { useParams } from "react-router-dom";
import { useGetNotificationSetting } from "../hooks/notification/notificationSetting";

// Common updater function to update a chat in both "chats" and "archived-chats" caches.
const updateChatInCache = (queryClient, chatId, updater) => {
  const keys = ["chats", "archived-chats"];
  keys.forEach((key) => {
    queryClient.setQueryData([key], (oldData) => {
      if (!oldData || !oldData.pages) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page) => {
          if (!page.chats) return page;
          return {
            ...page,
            chats: page.chats.map((chat) => (chat._id === chatId ? updater(chat) : chat)),
          };
        }),
      };
    });
  });
};

export const useSocketMessageListener = (socket) => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { data: notificationSetting } = useGetNotificationSetting();
  const bulletNotificationEnabled = notificationSetting?.bulletNotificationEnabled;
  const queryClient = useQueryClient();

  const handleNewMessage = useCallback(
    async (data) => {
      const { sender, chatId, newMessage } = data;
      const { _id: senderId, name: senderName, profileImage: senderProfileImage } = sender || {};

      // Update the chat's message list (for the sender's chat view)
      addMessageToChat(queryClient, senderId, newMessage);

      // Dispatch a notification if the sender is not the current user and notifications are enabled.
      if (userId !== senderId && bulletNotificationEnabled) {
        dispatch(
          showNotistackAlert({
            message: "sent you a message",
            avatarSrc: senderProfileImage,
            notificationType: "message",
            senderName,
          })
        );
        // Update unread counts in cache
        queryClient.setQueryData(["totalUnreadMessages"], (oldCount) => Math.max(oldCount + 1, 0));
        queryClient.setQueryData(["unreadCount", chatId], (oldCount) => Math.max(oldCount + 1, 0));
      }

      // Check if the chat already exists in the global "chats" cache.
      const chatsData = queryClient.getQueryData(["chats"]);
      let chatExists = false;
      if (chatsData && chatsData.pages) {
        for (const page of chatsData.pages) {
          if (page.chats && page.chats.some((chat) => chat._id === chatId)) {
            chatExists = true;
            break;
          }
        }
      }

      // If the chat is not present, invalidate the global "chats" query to refetch the list.
      if (!chatExists) {
        queryClient.invalidateQueries({ queryKey: ["chats"], exact: true });
      }
    },
    [dispatch, queryClient, userId, bulletNotificationEnabled]
  );

  const handleDeletedMessage = useCallback(
    async (data) => {
      const { senderId, deletedMessageId, chatId } = data;

      // Remove the deleted message from the chat messages cache.
      removeMessageFromChat(queryClient, senderId, deletedMessageId);

      // Fetch and update the last message for this chat after deletion.
      try {
        const lastMessageResponse = await getLastMessageByChatId(chatId);
        // Use the common updater to update both the sender and receiver caches.
        updateChatInCache(queryClient, chatId, (chat) => ({
          ...chat,
          lastMessage: lastMessageResponse.lastMessage,
        }));
      } catch (error) {
        console.error("Error updating last message after deletion:", error);
      }
    },
    [queryClient]
  );

  useEffect(() => {
    if (!socket) return;
    socket.on("newMessage", handleNewMessage);
    socket.on("messageDeleted", handleDeletedMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageDeleted", handleDeletedMessage);
    };
  }, [socket, handleNewMessage, handleDeletedMessage]);
};
