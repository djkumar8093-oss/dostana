/* eslint-disable react/prop-types */
import React, { useMemo, useState } from "react";
import { List, ListItem, Stack, Typography, Box, Paper, Button, Skeleton, useMediaQuery } from "@mui/material";
import ChatListView from "./ChatListView";
import Lottie from "lottie-react";
import { chatSecondaryAnimation } from "../../animation";
import ChatIcon from "@mui/icons-material/Chat";
import ArchiveIcon from "@mui/icons-material/Archive";
import { useGetAllChats, useGetArchivedChats } from "../../hooks/chat/chat";
import { useNavigate } from "react-router-dom";

const ChatManagement = () => {
  const [activeTab, setActiveTab] = useState("normal");
  const navigate = useNavigate();

  // Fetch chats using different hooks
  const {
    data: normalChats,
    isLoading: isLoadingNormal,
    error: errorNormal,
    fetchNextPage: fetchNextPageNormal,
    hasNextPage: hasNextPageNormal,
    isFetchingNextPage: isFetchingNextPageNormal,
  } = useGetAllChats();

  const {
    data: archivedChats,
    isLoading: isLoadingArchived,
    error: errorArchived,
    fetchNextPage: fetchNextPageArchived,
    hasNextPage: hasNextPageArchived,
    isFetchingNextPage: isFetchingNextPageArchived,
  } = useGetArchivedChats();

  // Choose the proper query data based on activeTab
  const chatsData = activeTab === "archived" ? archivedChats : normalChats;
  const isLoading = activeTab === "archived" ? isLoadingArchived : isLoadingNormal;
  const error = activeTab === "archived" ? errorArchived : errorNormal;
  const fetchNextPage = activeTab === "archived" ? fetchNextPageArchived : fetchNextPageNormal;
  const hasNextPage = activeTab === "archived" ? hasNextPageArchived : hasNextPageNormal;
  const isFetchingNextPage = activeTab === "archived" ? isFetchingNextPageArchived : isFetchingNextPageNormal;

  const isBelow500 = useMediaQuery("(max-width:460px)");
  const isBelow460 = useMediaQuery("(max-width:410px)");

  // Combine all pages of chats into a single array
  const allChats = useMemo(() => chatsData?.pages.flatMap((page) => page.chats) || [], [chatsData]);

  // Skeleton loader for chat list items
  const ChatListSkeleton = () => (
    <List sx={{ maxHeight: "60vh", overflow: "auto" }}>
      {[1, 2, 3, 4, 5].map((item) => (
        <ListItem key={item} divider>
          <Skeleton variant="circular" width={48} height={48} />
          <Box sx={{ ml: 2, flex: 1 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        </ListItem>
      ))}
    </List>
  );

  return (
    <>
      <Stack alignItems="center" spacing={2} p={2} sx={{ width: { md: "40rem", sm: "35rem", xs: "100%" } }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{
            alignSelf: "flex-start",
            fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.3rem" },
          }}
        >
          Chats
        </Typography>
        <Box width="100%" component={Paper} sx={{ padding: "1rem", borderRadius: "1rem" }} elevation={3}>
          {/* Toggle Buttons */}
          <Stack direction={isBelow460 ? "column" : "row"} spacing={2} mb={2} justifyContent={isBelow500 ? "space-between" : "flex-end"} alignItems={isBelow460 ? "flex-end" : "flex-start"}>
            <Button
              variant={activeTab === "normal" ? "contained" : "outlined"}
              onClick={() => setActiveTab("normal")}
              startIcon={<ChatIcon />}
              sx={{
                fontSize: { xs: ".8rem", sm: ".9rem", minWidth: isBelow460 ? "70%" : "auto" },
              }}
            >
              Normal Chats
            </Button>
            <Button
              variant={activeTab === "archived" ? "contained" : "outlined"}
              onClick={() => setActiveTab("archived")}
              startIcon={<ArchiveIcon />}
              sx={{
                fontSize: { xs: ".8rem", sm: ".9rem", minWidth: isBelow460 ? "70%" : "auto" },
              }}
            >
              Archived Chats
            </Button>
          </Stack>

          {isLoading ? (
            <ChatListSkeleton />
          ) : allChats && allChats.length > 0 ? (
            <List sx={{ maxHeight: "60vh", overflow: "auto" }}>
              {allChats.map((chat) => (
                <ChatListView key={chat._id} chat={chat} />
              ))}
            </List>
          ) : (
            <Stack
              alignItems="center"
              justifyContent="center"
              height="20rem"
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: "0.6rem",
              }}
            >
              <Lottie animationData={chatSecondaryAnimation} loop autoPlay style={{ height: "60%", width: "60%" }} />
              <Typography variant="body2" sx={{ color: "#000000a6", fontWeight: "bold", mt: { xs: 0, sm: "1rem" } }}>
                No chats found
              </Typography>
              <Button variant="contained" color="secondary" sx={{ mt: "1rem", fontWeight: "bold", fontSize: { sm: ".8rem", xs: ".6rem" } }} onClick={() => navigate("/friends")}>
                Start messaging your friends
              </Button>
            </Stack>
          )}

          {/* Load Older Messages Button */}
          {hasNextPage && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Button variant="outlined" onClick={() => fetchNextPage()} disabled={isFetchingNextPage} sx={{ fontWeight: "bold" }}>
                {isFetchingNextPage ? "Loading..." : "Load Older Messages"}
              </Button>
            </Box>
          )}
        </Box>
      </Stack>
    </>
  );
};

export default ChatManagement;
