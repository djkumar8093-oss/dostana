import React from "react";
import { Box, Skeleton, Stack, Avatar } from "@mui/material";

const ContentCardSkeleton = () => {
  return (
    <Stack
      sx={{
        minHeight: "20rem",
        width: "100%",
        mt: "1rem",
        borderRadius: ".8rem",
        bgcolor: "#fff",
        boxShadow: 3,
        position: "relative",
      }}
    >
      {/* Header Section Skeleton */}
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" pr={0} py={".4rem"} pl={".8rem"}>
        <Stack flexDirection="row" alignItems="center" gap=".8rem">
          <Skeleton variant="circular" width={50} height={50} />
          <Stack>
            <Skeleton variant="text" width={120} height={20} />
            <Skeleton variant="text" width={80} height={15} />
          </Stack>
        </Stack>
      </Stack>

      {/* Caption Skeleton */}
      <Stack sx={{ px: "1rem", mt: "1rem" }}>
        <Skeleton variant="text" width="80%" height={20} />
        <Skeleton variant="text" width="60%" height={20} />
      </Stack>

      {/* Media Section Skeleton */}
      <Skeleton
        variant="rectangular"
        height="26rem"
        width="100%"
        sx={{
          mt: "1rem",
          bgcolor: "rgba(0,0,0,0.1)",
        }}
      />

      {/* Action Buttons Skeleton */}
      <Stack p={".4rem"} sx={{ mt: ".8rem" }}>
        <Skeleton variant="rectangular" height={40} width="100%" />
        <Stack flexDirection="row" gap=".8rem" mt={".8rem"} justifyContent={"space-between"}>
          <Skeleton variant="rectangular" height={40} width={"100%"} />
          <Skeleton variant="rectangular" height={40} width={"100%"} />
          <Skeleton variant="rectangular" height={40} width={"100%"} />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ContentCardSkeleton;
