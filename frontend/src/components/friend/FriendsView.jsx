import React from "react";
import FriendAndRequestCard from "./FriendAndRequestCard";
import { Stack } from "@mui/material";

const FriendsView = () => {
  return (
    <Stack gap={4} my="1rem" width={"100%"}>
      <FriendAndRequestCard mode="friends" />
      <FriendAndRequestCard mode="suggestedUsers" />
    </Stack>
  );
};

export default FriendsView;
