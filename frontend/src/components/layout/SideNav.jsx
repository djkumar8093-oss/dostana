import { Stack } from "@mui/material";
import SideNavFriendRequestsView from "../friend/SideNavFriendRequestsView";
const SideNav = () => {
  return (
    <Stack sx={{ position: "absolute", top: 0, left: 0 }}>
      <SideNavFriendRequestsView />
    </Stack>
  );
};

export default SideNav;
