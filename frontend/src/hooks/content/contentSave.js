import { useMutation, useQueryClient, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useContext } from "react";
import { setLoading, showAlert } from "../../reduxSlices/alertSlice";
import axiosInstance from "../../configs/axiosInstance";
import { SocketContext } from "../../contextProvider/SocketProvider";
const fetchSavedContentApi = async ({ pageParam = 1 }) => {
  const response = await axiosInstance.get("/content", {
    params: { page: pageParam, limit: 10, filterType: "saved" },
  });
  return response.data;
};

const toggleSaveContentApi = async (contentId) => {
  const response = await axiosInstance.patch(`/content/toggle-save/${contentId}`);
  return response.data;
};
export const useToggleSaveContent = ({ type = "post" }) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const socket = useContext(SocketContext);

  return useMutation({
    mutationFn: toggleSaveContentApi,
    onMutate: async (contentId) => {
      dispatch(setLoading(true));
      // Optionally: optimistic updates can be done here.
    },
    onSuccess: (data, contentId) => {
      // data returns { message, content, isSaved }
      // Update the "contents" cache.
      console.log(data);
      console.log(contentId);
      const userId = data?.content?.user?._id;
      queryClient.setQueryData(["content", contentId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          isSavedByUser: data.content.isSavedByUser,
        };
      });
      queryClient.setQueryData(["contents"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            contents: page.contents.map((content) => (content._id === contentId ? { ...content, isSavedByUser: data.content.isSavedByUser } : content)),
          })),
        };
      });
      queryClient.setQueryData(["contents", userId], (oldData) => {
        if (!oldData) return oldData;
        console.log(oldData);
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            contents: page.contents.map((content) => (content._id === contentId ? { ...content, isSavedByUser: data.content.isSavedByUser } : content)),
          })),
        };
      });
      queryClient.setQueryData(["shared-contents"], (oldData) => {
        if (!oldData) return oldData;
        console.log(oldData);
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            contents: page.contents.map((content) => (content._id === contentId ? { ...content, isSavedByUser: data.content.isSavedByUser } : content)),
          })),
        };
      });

      // Update the "saved-content" infinite query.
      queryClient.setQueryData(["saved-contents"], (oldData) => {
        console.log(oldData);
        if (!oldData) {
          // If no saved content exists and we are saving, initialize it.
          return data.isSaved ? { pages: [{ savedContents: [data.content], nextPage: null, totalDocuments: 1 }], pageParams: [1] } : oldData;
        }
        if (data.isSaved) {
          // Prepend the newly saved content to the first page.
          return {
            ...oldData,
            pages: oldData.pages.map((page, index) => {
              if (index === 0) {
                return { ...page, contents: [data.content, ...page.contents] };
              }
              return page;
            }),
          };
        } else {
          // Remove the content from all pages when unsaved.
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              contents: page.contents.filter((content) => content._id !== contentId),
            })),
          };
        }
      });
    },
    onError: (err) => {
      console.log(err);
      dispatch(
        showAlert({
          message: "Something went wrong. Please try again.",
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
export const useGetSavedContent = () => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["saved-contents"],
    queryFn: ({ pageParam = 1 }) => fetchSavedContentApi({ pageParam }),
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
