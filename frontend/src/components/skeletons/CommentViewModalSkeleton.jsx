import React from "react";
import { Avatar, Skeleton, Stack, List, ListItem } from "@mui/material";

const CommentViewModalSkeleton = () => {
  return (
    <List>
      {[...Array(3)].map((_, index) => (
        <ListItem key={index} disableGutters>
          <Stack direction="row" width="100%" spacing={2} alignItems={"flex-start"}>
            {/* Circular Skeleton for Profile Image */}
            <Skeleton variant="circular" width={60} height={60} />
            {/* Rectangular Skeleton for Comment */}
            <Skeleton variant="rectangular" height={100} width="80%" sx={{ borderRadius: ".4rem" }} />
          </Stack>
        </ListItem>
      ))}
    </List>
  );
};

export default CommentViewModalSkeleton;
