import React, { useMemo, useState } from "react";
import { Stack } from "@mui/material";
import { useParams } from "react-router-dom";

import UserNoContentMsg from "./UserNoContentMsg";
import SelfProfileNoContentMsg from "./SelfProfileNoContentMsg";
import { useGetContents } from "../../hooks/content/content";
import ContentFeed from "../content/ContentFeed";
import { useUserProfile } from "../../hooks/userProfile/userProfile";

const UserProfileFeedView = () => {
  const { userId: routeUserId } = useParams();
  const { data: userProfile } = useUserProfile();
  const userId = routeUserId || userProfile?._id;

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetContents(userId);

  const isSelf = !routeUserId || userProfile?._id === userId;
  const userContents = useMemo(() => {
    if (!data || !data.pages) return [];
    return data.pages.flatMap((page) => page.contents || []);
  }, [data]);

  const hasContent = userContents.length > 0;

  const renderContent = () => {
    if (isLoading) {
      return <ContentFeed loading />;
    }

    if (hasContent) {
      return (
        <>
          <ContentFeed contents={userContents} fetchNextPage={fetchNextPage} hasNextPage={hasNextPage} isFetchingNextPage={isFetchingNextPage} />
        </>
      );
    }

    if (isSelf) {
      return <UserNoContentMsg isUserPostedContent={hasContent} />;
    }

    return <SelfProfileNoContentMsg isUserPostedContent={hasContent} />;
  };

  return (
    <Stack p={1} alignItems="center" width={"100%"}>
      {renderContent()}
    </Stack>
  );
};

export default UserProfileFeedView;
