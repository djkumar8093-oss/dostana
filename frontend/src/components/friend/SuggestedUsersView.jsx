import React from "react";
import FriendAndRequestCard from "./FriendAndRequestCard";
import { Stack } from "@mui/material";

const SuggestedUsersView = () => {
  return (
    <Stack mt="1rem">
      <FriendAndRequestCard mode="suggestedUsers" />;
    </Stack>
  );
};

export default SuggestedUsersView;
