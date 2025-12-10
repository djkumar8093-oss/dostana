import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../configs/axiosInstance";

const toggleArchiveApi = async ({ chatId, recipientId }) => {
  const response = await axiosInstance.patch(`/chat/archive/${chatId}`, { recipientId, chatId });
  return response.data;
};

export const useToggleArchive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleArchiveApi,
    onSuccess: (data) => {
      const { archived, chatId, recipientId } = data;

      // Get current cached data for both queries
      const normalChats = queryClient.getQueryData(["chats"]);
      const archivedChats = queryClient.getQueryData(["archived-chats"]);

      queryClient.setQueryData(["chats", recipientId], (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, pages: oldData.pages.map((page) => ({ ...page, archived })) };
      });

      // Find the chat in either cache and update its archived status
      let updatedChat = null;
      if (normalChats) {
        normalChats.pages.forEach((page) => {
          page.chats.forEach((chat) => {
            if (chat._id.toString() === chatId.toString()) {
              updatedChat = { ...chat, archived };
            }
          });
        });
      }
      if (!updatedChat && archivedChats) {
        archivedChats.pages.forEach((page) => {
          page.chats.forEach((chat) => {
            if (chat._id.toString() === chatId.toString()) {
              updatedChat = { ...chat, archived };
            }
          });
        });
      }
      if (!updatedChat) return; // Nothing to update if chat not found

      if (archived) {
        // Chat is now archived.
        // Remove it from normal chats:
        if (normalChats) {
          const newNormalData = {
            ...normalChats,
            pages: normalChats.pages.map((page) => ({
              ...page,
              chats: page.chats.filter((chat) => chat._id.toString() !== chatId.toString()),
            })),
          };
          queryClient.setQueryData(["chats"], newNormalData);
        }
        // Prepend it to archived chats:
        if (archivedChats) {
          const firstPage = archivedChats.pages[0] || { chats: [] };
          const newFirstPage = {
            ...firstPage,
            chats: [updatedChat, ...firstPage.chats.filter((chat) => chat._id.toString() !== chatId.toString())],
          };
          const newArchivedData = {
            ...archivedChats,
            pages: [newFirstPage, ...archivedChats.pages.slice(1)],
          };
          queryClient.setQueryData(["archived-chats"], newArchivedData);
        } else {
          // No archived chats yet – create a new cache
          queryClient.setQueryData(["archived-chats"], { pages: [{ chats: [updatedChat] }], pageParams: [] });
        }
      } else {
        // Chat is now unarchived.
        // Remove it from archived chats:
        if (archivedChats) {
          const newArchivedData = {
            ...archivedChats,
            pages: archivedChats.pages.map((page) => ({
              ...page,
              chats: page.chats.filter((chat) => chat._id.toString() !== chatId.toString()),
            })),
          };
          queryClient.setQueryData(["archived-chats"], newArchivedData);
        }
        // Prepend it to normal chats:
        if (normalChats) {
          const firstPage = normalChats.pages[0] || { chats: [] };
          const newFirstPage = {
            ...firstPage,
            chats: [updatedChat, ...firstPage.chats.filter((chat) => chat._id.toString() !== chatId.toString())],
          };
          const newNormalData = {
            ...normalChats,
            pages: [newFirstPage, ...normalChats.pages.slice(1)],
          };
          queryClient.setQueryData(["chats"], newNormalData);
        } else {
          // No normal chats yet – create a new cache
          queryClient.setQueryData(["chats"], { pages: [{ chats: [updatedChat] }], pageParams: [] });
        }
      }
    },
    onError: (err) => {
      console.error(err);
    },
  });
};
