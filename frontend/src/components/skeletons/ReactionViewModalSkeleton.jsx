import { ListItem, ListItemAvatar, ListItemText, Skeleton } from "@mui/material";

const ReactionViewModalSkeleton = () => {
  return (
    <ListItem>
      <ListItemAvatar>
        <Skeleton variant="circular" width={40} height={40} />
      </ListItemAvatar>
      <ListItemText>
        <Skeleton width="60%" />
      </ListItemText>
      <Skeleton variant="rectangular" width={40} height={40} />
    </ListItem>
  );
};

export default ReactionViewModalSkeleton;
