import { List, Skeleton, Stack, useMediaQuery, useTheme } from "@mui/material";
import React from "react";

const AddFriendListSkeleton = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const skeletonCount = isMobile ? 2 : 3; // Show fewer skeletons on smaller screens

  return (
    <Stack sx={{ overflowX: "auto", whiteSpace: "nowrap", paddingBottom: "1rem" }}>
      <List
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: "1rem",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {[...Array(skeletonCount)].map((_, index) => (
          <Stack
            key={index}
            alignItems="center"
            sx={{
              minWidth: { xs: "8rem", sm: "10rem" },
              border: "1px solid #e0e0e0",
              borderRadius: "0.6rem",
              padding: "1rem",
            }}
          >
            <Skeleton variant="circular" width={isMobile ? 60 : 80} height={isMobile ? 60 : 80} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="rectangular" width="70%" height={30} sx={{ mt: 1 }} />
          </Stack>
        ))}
      </List>
    </Stack>
  );
};

export default AddFriendListSkeleton;
