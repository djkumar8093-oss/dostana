import React, { useMemo, useState } from "react";
import { Button, Stack, Typography } from "@mui/material";
import Lottie from "lottie-react";
import { useGetSavedContent } from "../../hooks/content/contentSave";
import { emptyFeedAnimation } from "../../animation";
import ContentFeed from "../content/ContentFeed";
import NoFeedMsg from "../common/NoFeedMsg";

const SavedFeedView = () => {
  const { isLoading: isLoadingSavedContent, fetchNextPage, hasNextPage, isFetchingNextPage, data } = useGetSavedContent();
  console.log(data);

  // Flatten the saved content from all pages
  const savedContents = useMemo(() => {
    if (!data || !data.pages) return [];
    return data.pages.flatMap((page) => page.contents || []);
  }, [data]);

  return (
    <Stack alignItems="center" pb="1rem" width={"100%"} flex={1}>
      {isLoadingSavedContent ? (
        <ContentFeed loading />
      ) : savedContents.length > 0 ? (
        <ContentFeed contents={savedContents} fetchNextPage={fetchNextPage} hasNextPage={hasNextPage} isFetchingNextPage={isFetchingNextPage} />
      ) : (
        <NoFeedMsg textMsg={"No saved content found"} btnTitle={"Explore"} />
      )}
    </Stack>
  );
};

export default SavedFeedView;
