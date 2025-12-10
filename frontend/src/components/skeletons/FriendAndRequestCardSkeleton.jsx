import React from "react";
import { ListItem, Skeleton, Stack, List } from "@mui/material";

const FriendAndRequestCardSkeleton = ({ mode = "pendingRequests" }) => {
  return (
    <List sx={{ borderRadius: "0.6rem", border: "1px solid #e0e0e0" }}>
      {[...Array(5)].map((_, index) => (
        <ListItem key={index}>
          <Stack flexDirection="row" alignItems="center" spacing={2} width="100%">
            <Skeleton variant="circular" width={50} height={50} />
            <Stack flex={1}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </Stack>
            <Stack flexDirection={"row"} gap={1}>
              <Skeleton variant="rectangular" width={90} height={30} />
              {mode !== "allUsers" && <Skeleton variant="rectangular" width={90} height={30} />}
            </Stack>
          </Stack>
        </ListItem>
      ))}
    </List>
  );
};

export default FriendAndRequestCardSkeleton;
