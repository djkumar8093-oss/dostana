import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../configs/axiosInstance";
import { useContext } from "react";
import { SocketContext } from "../../contextProvider/SocketProvider";
import { useUserProfile } from "../userProfile/userProfile";

/* ======================
   API Functions
   ====================== */
const sendMessageApi = async (data) => {
  const response = await axiosInstance.post(`/chat/send`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

const deleteMessageApi = async (body) => {
  const response = await axiosInstance.post(`/chat/message`, body);
  return response.data;
};

const markMessagesAsReadApi = async ({ chatId }) => {
  const response = await axiosInstance.post(`/chat/markMessagesAsRead`, { chatId });
  return response.data;
};

const getTotalUnreadMessagesApi = async () => {
  const response = await axiosInstance.get(`/chat/unread/total`);
  return response.data.totalUnreadMessages;
};

const getUnreadCountForChatApi = async (chatId) => {
  const response = await axiosInstance.get(`/chat/unread/${chatId}`);
  return response.data.unreadCount;
};

export const getLastMessageByChatId = async (chatId) => {
  if (!chatId) return;
  const response = await axiosInstance.get(`/chat/lastMessage/${chatId}`);
  return response.data;
};

const markMessageAsReadByChatIdApi = async ({ messageIds, chatId }) => {
  const response = await axiosInstance.post(`/chat/message/read`, { messageIds, chatId });
  return response.data;
};

/* ======================
   Utility Functions
   ====================== */
export const addMessageToChat = (queryClient, recipientId, newMessage) => {
  const getChats = queryClient.getQueryData(["chats", recipientId]);
  if (!getChats) return;
  queryClient.setQueryData(["chats", recipientId], (oldData) => {
    if (!oldData || !oldData.pages) {
      return { pages: [{ messages: [newMessage] }] };
    }

    const updatedPages = oldData.pages.map((page, index, pages) => {
      if (index === pages.length - 1) {
        return { ...page, messages: [...(page.messages || []), newMessage] };
      }
      return page;
    });

    return { ...oldData, pages: updatedPages };
  });
};

export const removeMessageFromChat = (queryClient, recipientId, deletedMessageId) => {
  queryClient.setQueryData(["chats", recipientId], (oldData) => {
    if (!oldData || !oldData.pages) return oldData;
    const updatedPages = oldData.pages.map((page) => ({
      ...page,
      messages: (page.messages || []).filter((msg) => msg._id !== deletedMessageId),
    }));
    return { ...oldData, pages: updatedPages };
  });
};

// Common function to update a chat in both "chats" and "archived-chats" caches
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

/* ======================
   React Query Hooks
   ====================== */

// Hook: Mark messages as read
export const useMarkMessagesAsRead = () => {
  return useMutation({
    mutationFn: markMessagesAsReadApi,
    onSuccess: () => {},
    onError: (error) => {
      console.error("Error marking messages as read:", error);
    },
  });
};

// Hook: Get total unread messages count for the logged-in user
export const useGetTotalUnreadMessages = () => {
  return useQuery({
    queryKey: ["totalUnreadMessages"],
    queryFn: getTotalUnreadMessagesApi,
  });
};

// Hook: Get unread message count for a specific chat
export const useGetUnreadCountForChat = (chatId) => {
  return useQuery({
    queryKey: ["unreadCount", chatId],
    queryFn: () => getUnreadCountForChatApi(chatId),
    enabled: Boolean(chatId), // only run if chatId is provided
  });
};

// Hook: Get the last message by chat ID
export const useGetLastMessageByChatId = (chatId) => {
  return useQuery({
    queryKey: ["lastMessage", chatId],
    queryFn: () => getLastMessageByChatId(chatId),
    enabled: Boolean(chatId), // only run if chatId is provided
  });
};

// Hook: Send a message
export const useSendMessage = (onPendingMessageStatusChange) => {
  const queryClient = useQueryClient();
  const socket = useContext(SocketContext);
  const { data: userProfile } = useUserProfile();

  return useMutation({
    mutationFn: sendMessageApi,
    onSuccess: (data, variables) => {
      // Extract clientId from the FormData instance
      const clientId = variables?.get("clientId");
      if (clientId && typeof onPendingMessageStatusChange === "function") {
        onPendingMessageStatusChange(clientId, "sent");
      }

      const sender = {
        profileImage: userProfile?.profileImage,
        name: `${userProfile?.firstName} ${userProfile?.lastName}`,
        _id: userProfile?._id,
      };

      const { recipientId, newMessage, chatId } = data;
      socket.emit("newMessage", { targetUserId: recipientId, newMessage, sender, chatId });
      addMessageToChat(queryClient, recipientId, newMessage);
      updateChatInCache(queryClient, chatId, (chat) => ({
        ...chat,
        lastMessage: newMessage,
      }));
    },
    onError: (error, variables) => {
      const clientId = variables?.get("clientId");
      if (clientId && typeof onPendingMessageStatusChange === "function") {
        onPendingMessageStatusChange(clientId, "failed");
      }
      console.error("Error sending message:", error);
    },
  });
};

// Hook: Delete a message
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  const socket = useContext(SocketContext);
  const { data: userProfile } = useUserProfile();

  return useMutation({
    mutationFn: deleteMessageApi,
    onSuccess: async (data, variables) => {
      const { recipientId, messageId, deleteFor, chatId } = variables;
      if (deleteFor === "Everyone") {
        socket.emit("messageDeleted", {
          targetUserId: recipientId,
          deletedMessageId: messageId,
          senderId: userProfile?._id,
          chatId: data.chatId,
        });
      }
      removeMessageFromChat(queryClient, recipientId, messageId);
      try {
        const lastMessageResponse = await getLastMessageByChatId(chatId);
        console.log(lastMessageResponse);
        updateChatInCache(queryClient, chatId, (chat) => ({
          ...chat,
          lastMessage: lastMessageResponse.lastMessage,
        }));
      } catch (error) {
        console.error("Error updating last message after deletion:", error);
      }
    },
  });
};

// Hook: Mark messages as read by message IDs
export const useMarkMessageAsReadByChatId = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markMessageAsReadByChatIdApi,
    onSuccess: (data, { chatId }) => {
      const count = data.count;

      const getUnreadCount = queryClient.getQueryData(["unreadCount", chatId]);
      if (!getUnreadCount) return;

      queryClient.setQueryData(["unreadCount", chatId], (oldCount) => {
        if (!oldCount) return oldCount;
        return Math.max(oldCount - count, 0);
      });
      const getTotalUnreadMessagesCount = queryClient.getQueryData(["totalUnreadMessages"]);
      if (!getTotalUnreadMessagesCount) return;
      queryClient.setQueryData(["totalUnreadMessages"], (oldCount) => {
        if (!oldCount) return oldCount;
        return Math.max(oldCount - count, 0);
      });
    },
    onError: (error) => {
      console.error("Error marking messages as read:", error);
    },
  });
};
