import React, { useState } from "react";
import { Button, Stack } from "@mui/material";
import { FeedRounded, InfoRounded } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const UserProfilePageNavTab = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(tab);
  };
  return (
    <Stack direction="row" justifyContent="space-evenly" width="100%">
      <Button
        onClick={() => handleTabChange("feed")}
        sx={{
          flex: 1,
          py: 2,
          borderBottom: activeTab === "feed" ? "3px solid #1976d2" : "none",
          color: activeTab === "feed" ? "#1976d2" : "inherit",
          fontWeight: activeTab === "feed" ? "bold" : "normal",
        }}
        startIcon={<FeedRounded />}
      >
        Feed
      </Button>
      <Button
        onClick={() => handleTabChange("details")}
        sx={{
          flex: 1,
          py: 2,
          borderBottom: activeTab === "details" ? "3px solid #1976d2" : "none",
          color: activeTab === "details" ? "#1976d2" : "inherit",
          fontWeight: activeTab === "details" ? "bold" : "normal",
        }}
        startIcon={<InfoRounded />}
      >
        Details
      </Button>
    </Stack>
  );
};

export default UserProfilePageNavTab;
