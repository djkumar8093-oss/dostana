import React from "react";
import { Skeleton, Stack, Box, Avatar, Typography, Button } from "@mui/material";

const TweetViewCardSkeleton = () => {
  const commonButtonStyles = {
    p: ".8rem",
    color: "#0000008d",
    textTransform: "none",
    fontWeight: "bold",
  };

  return (
    <Stack
      sx={{
        minHeight: "10rem",
        width: "38rem",
        mt: "1rem",
        borderRadius: ".8rem",
        boxShadow: 3,
        bgcolor: "#fff",
        padding: "1rem",
      }}
    >
      {/* Header Section */}
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Stack flexDirection="row" alignItems="center" gap={2}>
          <Skeleton variant="circular" width={50} height={50} />
          <Stack>
            <Skeleton variant="text" width={120} height={20} />
            <Skeleton variant="text" width={100} height={15} />
          </Stack>
        </Stack>
      </Stack>

      {/* Media Section */}
      <Stack width="100%" justifyContent="center" alignItems="center" mb={2}>
        <Stack
          flexDirection="row"
          gap={1}
          sx={{
            overflowX: "auto",
            width: "95%",
            "&::-webkit-scrollbar": { display: "none" },
            msOverflowStyle: "none",
          }}
        >
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} variant="rectangular" width={80} height={80} />
          ))}
        </Stack>
      </Stack>

      {/* Caption Section */}
      <Stack mb={2}>
        <Skeleton variant="text" width="90%" height={20} />
        <Skeleton variant="text" width="80%" height={15} />
      </Stack>

      {/* Actions Section */}
      <Stack p=".4rem">
        <Stack px=".8rem" mb=".4rem" flexDirection="row" alignItems="center" gap=".4rem">
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="text" width={200} height={15} />
        </Stack>
        <Stack flexDirection="row" gap={1}>
          <Button fullWidth sx={commonButtonStyles}>
            <Skeleton variant="text" width="80%" height={20} />
          </Button>
          <Button fullWidth sx={commonButtonStyles}>
            <Skeleton variant="text" width="80%" height={20} />
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default TweetViewCardSkeleton;
