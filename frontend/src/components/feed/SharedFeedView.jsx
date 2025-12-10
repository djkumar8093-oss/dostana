import React, { useMemo, useEffect, useRef } from "react";
import { Avatar, AvatarGroup, Stack, Tooltip, Typography, Skeleton, IconButton } from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import { useNavigate } from "react-router-dom";

import NoFeedMsg from "../common/NoFeedMsg";
import ContentCardSkeleton from "../skeletons/ContentCardSkeleton";
import { useGetSharedContent } from "../../hooks/content/contentShare";
import ContentCard from "../content/ContentCard";
import { useUserProfile } from "../../hooks/userProfile/userProfile";

const SharedFeedView = () => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetSharedContent();
  const { data: userProfile } = useUserProfile();
  const navigate = useNavigate();
  const bottomDivRef = useRef(null);

  console.log(data);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (bottomDivRef.current) observer.observe(bottomDivRef.current);

    return () => {
      if (bottomDivRef.current) observer.unobserve(bottomDivRef.current);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sharedContents = useMemo(() => data?.pages?.flatMap((page) => page?.contents || []) || [], [data]);

  if (isLoading) {
    return (
      <Stack flex={1} py={2} spacing={3} sx={{ width: { xs: "90%", sm: "28rem", md: "38rem" } }}>
        {[...Array(3)].map((_, index) => (
          <Stack key={index} spacing={1}>
            <Stack direction="row" justifyContent="flex-end" spacing={1} alignItems="center">
              <AvatarGroup max={4}>
                {[...Array(4)].map((_, idx) => (
                  <Skeleton key={idx} variant="circular" width={24} height={24} sx={{ boxShadow: 3 }} />
                ))}
              </AvatarGroup>
              <Skeleton variant="text" width={120} height={20} />
            </Stack>
            <ContentCardSkeleton />
          </Stack>
        ))}
      </Stack>
    );
  }

  if (!sharedContents.length) return <NoFeedMsg textMsg="No shared content found" btnTitle={"Explore"} />;

  return (
    <Stack flex={1} py={2} gap={3} sx={{ width: { xs: "90%", sm: "28rem", md: "38rem" } }}>
      {sharedContents.map((content) => {
        const { _id, shareType, sharedWith, sharedBy } = content || {};
        let sharedWithText = "";
        let avatarGroup = null;

        if (shareType === "sharedByMe" && sharedWith?.length) {
          sharedWithText = `Shared with ${sharedWith[0]?.firstName || "Unknown"}${sharedWith.length > 1 ? ` and ${sharedWith.length - 1} other(s)` : ""}`;
          avatarGroup = (
            <AvatarGroup max={4} sx={{ display: "flex", flexWrap: "wrap" }}>
              {sharedWith
                ?.filter((user) => user) // Remove null values
                ?.map((user) => (
                  <Tooltip key={user?._id} title={`Shared with ${user?.firstName || "Unknown"}`}>
                    <Avatar src={user?.profileImage} sx={{ width: 24, height: 24, boxShadow: 3 }} />
                  </Tooltip>
                ))}
            </AvatarGroup>
          );
        } else if (shareType === "sharedWithMe" && sharedBy) {
          avatarGroup = (
            <AvatarGroup max={4} sx={{ display: "flex", flexWrap: "wrap" }}>
              <Tooltip title={`Shared by ${sharedBy?.firstName}`}>
                <IconButton onClick={() => navigate(`/user-profile/${sharedBy?._id}`)}>
                  <Avatar alt={sharedBy?.firstName} src={sharedBy?.profileImage} sx={{ width: 24, height: 24, boxShadow: 3 }} />
                </IconButton>
              </Tooltip>
            </AvatarGroup>
          );
        }

        return (
          <Stack key={_id} direction="column" spacing={2} alignItems="flex-end">
            {(shareType === "sharedByMe" || shareType === "sharedWithMe") && (
              <Stack direction="row" alignItems="center" spacing={1}>
                {avatarGroup}
                {shareType === "sharedByMe" && (
                  <Typography variant="body2" color="textSecondary">
                    {sharedWithText}
                  </Typography>
                )}
                <Tooltip title="Share">
                  <ShareIcon style={{ cursor: "pointer" }} />
                </Tooltip>
              </Stack>
            )}
            <ContentCard content={content} userProfile={userProfile} />
          </Stack>
        );
      })}

      <div ref={bottomDivRef} style={{ height: "20px" }} />
      {isFetchingNextPage && <Typography sx={{ textAlign: "center", mt: 2 }}>Loading more...</Typography>}
    </Stack>
  );
};

export default SharedFeedView;
