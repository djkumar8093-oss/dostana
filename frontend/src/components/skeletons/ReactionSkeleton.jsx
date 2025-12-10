import React from "react";
import { Stack, Skeleton, Avatar } from "@mui/material";

const ReactionSkeleton = () => {
  return (
    <Stack px={".8rem"} sx={{ cursor: "pointer", mb: ".4rem" }} flexDirection={"row"} alignItems={"center"} gap={".2rem"}>
      {/* AvatarGroup Skeleton */}
      <Stack direction="row" gap={"-.2rem"}>
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="circular" width={24} height={24} />
      </Stack>

      {/* Text Skeleton */}
      <Skeleton variant="text" width={180} height={16} sx={{ marginLeft: ".4rem" }} />
    </Stack>
  );
};

export default ReactionSkeleton;
