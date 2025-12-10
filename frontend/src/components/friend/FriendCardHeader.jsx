/* eslint-disable react/prop-types */
import { Button, SpeedDial, SpeedDialAction, Stack, Typography, CircularProgress } from "@mui/material";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { MoreVertOutlined } from "@mui/icons-material";
import { useState } from "react";
import { useManageFriendRequests } from "../../hooks/friends/friendRequests";
import AddFriendList from "./AddFriendList";

const FriendCardHeader = ({ mode = "pendingRequests", children }) => {
  const [isUserListOpen, setIsUserListOpen] = useState(false);

  // Replace separate hooks with the single useManageFriendRequests hook for each action.
  const { mutate: acceptAllRequests, isPending: isAcceptingRequests } = useManageFriendRequests("accept_all");
  const { mutate: declineAllRequests, isPending: isDecliningRequests } = useManageFriendRequests("cancel_all");
  const { mutate: removeAllFriends, isPending: isRemovingFriends } = useManageFriendRequests("remove_all");

  const handleToggleUserList = () => {
    setIsUserListOpen((prevState) => !prevState);
  };

  return (
    <>
      <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: { xs: ".2rem", sm: "1rem" }, fontSize: { md: "1.4rem", xs: "1rem", sm: "1.2rem" } }}>
          {mode === "pendingRequests" ? "Friend Requests" : mode === "friends" ? "Friends" : "Add Friends"}
        </Typography>

        {mode !== "suggestedUsers" && (
          <SpeedDial
            ariaLabel="SpeedDial Actions"
            direction="left"
            icon={<MoreVertOutlined sx={{ color: "#0000007f" }} />}
            sx={{
              "& .MuiSpeedDial-fab": {
                boxShadow: "none",
                backgroundColor: "transparent",
                "&:hover": { backgroundColor: "transparent" },
              },
            }}
          >
            {mode === "pendingRequests" && (
              <SpeedDialAction
                key="cancel-all"
                icon={isDecliningRequests ? <CircularProgress size={24} /> : <HighlightOffIcon />}
                tooltipTitle="Cancel All"
                onClick={declineAllRequests}
                disabled={isDecliningRequests}
              />
            )}
            {mode === "pendingRequests" && (
              <SpeedDialAction
                key="accept-all"
                icon={isAcceptingRequests ? <CircularProgress size={24} /> : <DoneAllIcon />}
                tooltipTitle="Accept All"
                onClick={acceptAllRequests}
                disabled={isAcceptingRequests}
              />
            )}
            {mode === "friends" && (
              <SpeedDialAction
                key="remove-all"
                icon={isRemovingFriends ? <CircularProgress size={24} /> : <PersonRemoveIcon />}
                tooltipTitle="Remove All Friends"
                onClick={removeAllFriends}
                disabled={isRemovingFriends}
              />
            )}
          </SpeedDial>
        )}

        {mode === "suggestedUsers" && (
          <Button sx={{ fontWeight: "bold", fontSize: ".8rem", alignSelf: "flex-end", mb: ".6rem" }} onClick={handleToggleUserList}>
            {isUserListOpen ? "Close" : "See All"}
          </Button>
        )}
      </Stack>

      {mode === "suggestedUsers" && !isUserListOpen ? <AddFriendList /> : children}
    </>
  );
};

export default FriendCardHeader;
