import { ListItem, ListItemAvatar, ListItemButton, ListItemText, Skeleton } from "@mui/material";
import React from "react";

const ShareCardUserListSkeleton = () => {
  return (
    <ListItem>
      <ListItemButton sx={{ p: 1, borderRadius: 1 }}>
        <ListItemAvatar>
          <Skeleton variant="circular" width={40} height={40} />
        </ListItemAvatar>
        <ListItemText primary={<Skeleton variant="text" width="60%" />} secondary={<Skeleton variant="text" width="40%" />} />
        <Skeleton variant="rectangular" width={24} height={24} sx={{ borderRadius: "50%" }} />
      </ListItemButton>
    </ListItem>
  );
};

export default ShareCardUserListSkeleton;
