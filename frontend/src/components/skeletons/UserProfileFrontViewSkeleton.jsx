import React from "react";
import { Skeleton, Stack, Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const UserProfileFrontViewSkeleton = ({ isSelf }) => {
  const theme = useTheme();
  const isBelowSm = useMediaQuery(theme.breakpoints.down("md"));
  const isBelow380 = useMediaQuery("(max-width:380px)");

  // Adjust dimensions based on screen size:
  // Cover image height: matches the main component's responsive values (md: 30rem, sm: 22rem, xs: 18rem)
  const coverHeight = isBelowSm ? (isBelow380 ? "18rem" : "22rem") : "30rem";
  // Container width: full width on small screens, or fixed width on larger screens
  const containerWidth = isBelowSm ? "99%" : "60rem";
  // Profile image size: smaller on small screens
  const profileSize = isBelowSm ? 48 : 64;
  // Name text width: slightly smaller on small screens
  const nameWidth = isBelowSm ? 100 : 120;
  // Button dimensions: adjust width and height based on screen size
  const buttonWidth = isBelowSm ? 120 : 160;
  const buttonHeight = isBelowSm ? 32 : 40;

  return (
    <Stack flex={1} width={"100%"} alignItems={"center"} overflow={"auto"} pb={2}>
      <Stack width={containerWidth}>
        {/* Cover Image Skeleton */}
        <Stack
          sx={{
            width: "100%",
            height: coverHeight,
            bgcolor: "#e0e0e0",
            mt: "1rem",
            position: "relative",
            borderRadius: "1rem",
          }}
        >
          <Skeleton
            variant="rectangular"
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: "1rem",
            }}
          />
          {/* Profile Image and Name Skeleton */}
          <Stack
            sx={{
              position: "absolute",
              bgcolor: "#ffffffe1",
              top: "1rem",
              left: { xs: ".4rem", sm: "2rem" },
              p: "1rem",
              borderRadius: ".8rem",
            }}
            flexDirection="row"
            alignItems="center"
            gap={".6rem"}
          >
            <Skeleton variant="circular" width={profileSize} height={profileSize} />
            <Skeleton variant="text" width={nameWidth} height={24} />
          </Stack>
        </Stack>

        {/* About Section Skeleton */}
        <Stack alignItems="center" justifyContent="center" m="3rem">
          <Skeleton variant="text" width="80%" height={24} />
        </Stack>

        {/* Buttons Skeleton */}
        {!isSelf && (
          <Stack direction={isBelow380 ? "column" : "row"} justifyContent="flex-end" gap="1rem" mb="1rem">
            <Skeleton variant="rectangular" width={buttonWidth} height={buttonHeight} />
            <Skeleton variant="rectangular" width={buttonWidth} height={buttonHeight} />
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

export default UserProfileFrontViewSkeleton;
