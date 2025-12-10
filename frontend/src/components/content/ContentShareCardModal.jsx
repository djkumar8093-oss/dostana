/* eslint-disable react/prop-types */
import React, { useState, useEffect, useContext, useRef } from "react";
import { Button, Dialog, DialogContent, Stack, Typography, Checkbox, List, ListItem, ListItemAvatar, ListItemText, Avatar, ListItemButton, Box, useMediaQuery } from "@mui/material";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";
import ShareIcon from "@mui/icons-material/Share";

import { useShareContent } from "../../hooks/content/contentShare";
import { SocketContext } from "../../contextProvider/SocketProvider";
import { useCreateNotification } from "../../hooks/notification/notification";
import ContentHeaderAndMedia from "./ContentHeaderAndMedia";
import { emptyFeedAnimation, sharingContentAnimation } from "../../animation";
import ShareCardUserListSkeleton from "../skeletons/ShareCardUserListSkeleton";
import { useUserProfile } from "../../hooks/userProfile/userProfile";
import { useGetFriends } from "../../hooks/friends/friends";
import { AvatarHeader } from "./AvatarHeader";

const ContentShareCardModal = ({ onClose, open, content }) => {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  const { data: userProfile } = useUserProfile();

  // Share content hook (and its loading state)
  const { mutate: shareContent, isPending: isSharingContent } = useShareContent({ type: content.type });
  const { mutate: createNotification } = useCreateNotification();

  // Infinite query for friends
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetFriends();

  const isBelow600 = useMediaQuery("(max-width:600px)");
  const isBelow480 = useMediaQuery("(max-width:480px)");

  // Flatten paginated friends into a single array.
  const friends = data ? data.pages.flatMap((page) => page.friends) : [];

  // Set up an Intersection Observer to load more friends when the sentinel is visible.
  const loadMoreRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Local state for friend selection and sharing text animation.
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sharingText, setSharingText] = useState("Sharing");

  // Destructure the content details
  const { _id: contentId } = content || {};

  const handleCheckboxChange = (event, user) => {
    if (event.target.checked) {
      setSelectedUsers([...selectedUsers, user._id]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== user._id));
    }
  };

  const handleButtonClick = (user) => {
    if (selectedUsers.includes(user._id)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user._id]);
    }
  };

  const handleShare = () => {
    if (selectedUsers.length > 0) {
      shareContent(
        { contentId, userIds: selectedUsers },
        {
          onSuccess: () => {
            onClose();
            createNotification({
              type: "content-share",
              receiverIds: selectedUsers,
              action: `Shared a post with you!`,
              referenceId: contentId,
            });
            socket.emit("contentShare", {
              userIds: selectedUsers,
              senderName: `${userProfile?.firstName} ${userProfile?.lastName}`,
              contentId,
              senderProfileImage: userProfile?.profileImage,
            });
          },
        }
      );
    }
  };

  const handleAddFriends = () => {
    navigate("/friends");
  };

  // Animate the sharing text while sharing is in progress.
  useEffect(() => {
    let interval;
    if (isSharingContent) {
      interval = setInterval(() => {
        setSharingText((prev) => (prev === "Sharing..." ? "Sharing" : `${prev}.`));
      }, 500);
    } else {
      setSharingText("Sharing");
    }
    return () => clearInterval(interval);
  }, [isSharingContent]);

  return (
    <Dialog open={open} maxWidth="sm" fullWidth onClose={onClose} fullScreen={isBelow600}>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          p: 2,
          maxHeight: { xs: "100vh", sm: "70vh" },
        }}
      >
        {/* Scrollable area for header and friend list */}
        <AvatarHeader contentOwner={content?.user} onClose={onClose} />
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <ContentHeaderAndMedia content={content} onClose={onClose} />
          <Stack flexDirection="row" justifyContent="space-between" alignItems="center" py={2}>
            <Typography
              variant="body1"
              fontWeight="bold"
              color="#000000d1"
              sx={{
                backgroundColor: "inherit",
                zIndex: 1,
                mb: ".4rem",
                py: 1,
              }}
            >
              Share
            </Typography>
          </Stack>
          <Stack>
            {isLoading ? (
              // While loading, show skeleton placeholders.
              Array.from({ length: 3 }).map((_, index) => <ShareCardUserListSkeleton key={index} />)
            ) : friends.length === 0 ? (
              // When no friends are available, show an empty state with a CTA.
              <Stack alignItems="center" justifyContent="center" mt={1}>
                <Stack sx={{ width: { sm: "14rem", xs: "10rem" }, height: { sm: "14rem", xs: "10rem" } }}>
                  <Lottie animationData={emptyFeedAnimation} loop autoPlay style={{ height: "100%", width: "100%" }} />
                </Stack>
                <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: { sm: ".9rem", xs: ".8rem" } }}>
                  You have no friends to share this feed.
                </Typography>
                <Button
                  onClick={handleAddFriends}
                  variant="contained"
                  sx={{
                    mt: 2,
                    fontFamily: "Poppins",
                    fontWeight: "bold",
                    px: { md: "2rem", xs: "1rem" },
                  }}
                  size={isBelow600 ? "small" : "medium"}
                >
                  Start to Add Friends
                </Button>
              </Stack>
            ) : (
              // Render the list of friends.
              <List sx={{}}>
                {friends.map((user) => (
                  <ListItem key={user._id}>
                    <ListItemButton onClick={() => handleButtonClick(user)} sx={{ p: "1rem", borderRadius: ".4rem", boxShadow: 3 }}>
                      <ListItemAvatar>
                        <Avatar src={user.profileImage || ""} sx={{ height: { sm: "3rem", xs: "2.6rem" }, width: { sm: "3rem", xs: "2.6rem" }, boxShadow: 3 }} />
                      </ListItemAvatar>
                      <ListItemText primary={`${user.firstName} ${user.lastName}`} primaryTypographyProps={{ fontWeight: "bold", fontSize: { sm: "1rem", xs: ".9rem" } }} />
                      <Checkbox onChange={(event) => handleCheckboxChange(event, user)} checked={selectedUsers.includes(user._id)} />
                    </ListItemButton>
                  </ListItem>
                ))}
                {/* Sentinel for Intersection Observer */}
                <div ref={loadMoreRef} style={{ height: 1 }} />
                {isFetchingNextPage && (
                  <Stack alignItems="center" justifyContent="center" mt={1}>
                    <Typography variant="body2">Loading more friends...</Typography>
                  </Stack>
                )}
              </List>
            )}
          </Stack>
        </Box>
        {/* Fixed share button area */}
        {friends.length > 0 && (
          <Box sx={{ pt: 1, display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={handleShare}
              disabled={isSharingContent || selectedUsers.length === 0}
              sx={{
                p: ".5rem",
                fontFamily: "Poppins",
                px: { sm: "3.4rem", xs: "2rem" },
                mt: "1rem",
                mr: 2,
              }}
              variant="contained"
              color="primary"
              startIcon={<ShareIcon />}
              size={isBelow600 ? "small" : "medium"}
            >
              Share
            </Button>
          </Box>
        )}
        {/* Overlay for sharing animation */}
        {isSharingContent && (
          <Stack
            sx={{
              position: "absolute",
              height: "100%",
              width: "100%",
              top: 0,
              left: 0,
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#000000b2",
            }}
          >
            <Stack sx={{ height: { xs: "8rem", sm: "10rem" }, width: { xs: "8rem", sm: "10rem" } }}>
              <Lottie animationData={sharingContentAnimation} loop autoPlay style={{ height: "100%", width: "100%" }} />
            </Stack>
            <Typography variant="h6" color="#fff" sx={{ mt: 2, fontFamily: "Poppins", fontSize: { xs: ".9rem", sm: "1rem", md: "1.2rem" } }}>
              {sharingText}
            </Typography>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContentShareCardModal;
