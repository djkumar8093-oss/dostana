// FriendAndRequestCard.jsx
import React, { useEffect, useRef, useCallback } from "react";
import { Box, Button, List, Stack, Typography, Paper } from "@mui/material";
import Lottie from "lottie-react";
import FriendCardHeader from "./FriendCardHeader";
import UsersListView from "./UsersListView";
import FriendAndRequestCardSkeleton from "../skeletons/FriendAndRequestCardSkeleton";
import { friendAnimation } from "../../animation";
import { useGetFriendRequests } from "../../hooks/friends/friendRequests";
import { useGetFriends } from "../../hooks/friends/friends";
import { useGetSuggestedUsers } from "../../hooks/friends/suggestedUsers";

const FriendAndRequestCard = ({ mode = "pendingRequests" }) => {
  // Retrieve data for each mode using infinite queries.
  const {
    data: pendingRequestsData,
    isLoading: loadingPending,
    isFetched: fetchedPending,
    fetchNextPage: fetchNextFriendRequests,
    hasNextPage: hasNextFriendRequests,
    isFetchingNextPage: fetchingNextFriendRequests,
  } = useGetFriendRequests();

  const {
    data: friendsData,
    isLoading: loadingFriends,
    isFetched: fetchedFriends,
    fetchNextPage: fetchNextFriends,
    hasNextPage: hasNextFriends,
    isFetchingNextPage: fetchingNextFriends,
  } = useGetFriends();

  const {
    data: suggestedUsersData,
    isLoading: loadingSuggested,
    isFetched: fetchedSuggested,
    fetchNextPage: fetchNextSuggested,
    hasNextPage: hasNextSuggested,
    isFetchingNextPage: fetchingNextSuggested,
  } = useGetSuggestedUsers();

  // Flatten the infinite query pages into one list per mode.
  const pendingRequests = pendingRequestsData ? pendingRequestsData.pages.flatMap((page) => page.friendRequests) : [];
  const friends = friendsData ? friendsData.pages.flatMap((page) => page.friends) : [];
  const suggestedUsers = suggestedUsersData ? suggestedUsersData.pages.flatMap((page) => page.suggestedUsers) : [];

  // Choose which list and pagination functions to use based on the mode.
  let list = [];
  let fetchNextPage = useCallback(() => {}, []);
  let hasNextPage = false;
  let isFetchingNextPage = false;
  let loading = false;
  let fetched = false;

  if (mode === "pendingRequests") {
    list = pendingRequests;
    fetchNextPage = fetchNextFriendRequests;
    hasNextPage = hasNextFriendRequests;
    isFetchingNextPage = fetchingNextFriendRequests;
    loading = loadingPending;
    fetched = fetchedPending;
  } else if (mode === "friends") {
    list = friends;
    fetchNextPage = fetchNextFriends;
    hasNextPage = hasNextFriends;
    isFetchingNextPage = fetchingNextFriends;
    loading = loadingFriends;
    fetched = fetchedFriends;
  } else if (mode === "suggestedUsers") {
    list = suggestedUsers;
    fetchNextPage = fetchNextSuggested;
    hasNextPage = hasNextSuggested;
    isFetchingNextPage = fetchingNextSuggested;
    loading = loadingSuggested;
    fetched = fetchedSuggested;
  }

  // Infinite scroll logic using Intersection Observer.
  const loadMore = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage]);

  const loadMoreRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    });
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [loadMore]);

  // Determine an appropriate empty state message based on the mode.
  const getEmptyMessage = () => {
    if (mode === "pendingRequests") return "No friend requests found";
    if (mode === "friends") return "No friends found";
    if (mode === "suggestedUsers") return "No suggested users found";
    return "No results found";
  };

  return (
    <Stack alignItems="center" spacing={2} width={"100%"}>
      <Stack mt="1rem" sx={{ width: { md: "40rem", sm: "35rem", xs: "96%" } }}>
        <FriendCardHeader mode={mode}>
          {loading ? (
            <FriendAndRequestCardSkeleton />
          ) : list && list.length > 0 ? (
            <Paper elevation={3} sx={{ borderRadius: "0.8rem", overflow: "hidden", py: 2, pb: 0 }}>
              <Stack sx={{ maxHeight: "50vh", overflow: "auto", padding: "0 1rem 1rem" }}>
                <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: ".6rem" }}>
                  {list.map((user) => (
                    <UsersListView key={user._id} mode={mode} user={user} />
                  ))}
                  {/* Dummy element to trigger infinite scrolling */}
                  <div ref={loadMoreRef} style={{ height: "1px" }} />
                </List>
              </Stack>
              {isFetchingNextPage && (
                <Typography align="center" sx={{ py: 1 }}>
                  Loading more...
                </Typography>
              )}
            </Paper>
          ) : fetched ? (
            <Paper elevation={3} sx={{ borderRadius: "0.8rem", padding: "2rem", textAlign: "center" }}>
              <Lottie animationData={friendAnimation} loop autoPlay style={{ height: "200px", margin: "0 auto" }} />
              <Typography variant="body2" sx={{ color: "#000000a6", fontWeight: "bold", mt: 2 }}>
                {getEmptyMessage()}
              </Typography>
            </Paper>
          ) : (
            <FriendAndRequestCardSkeleton />
          )}
        </FriendCardHeader>
      </Stack>
    </Stack>
  );
};

export default FriendAndRequestCard;
