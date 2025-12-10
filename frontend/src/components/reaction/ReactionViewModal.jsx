/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { Avatar, Dialog, DialogContent, List, ListItemButton, Typography, Stack, Box, Button, Tooltip, useMediaQuery } from "@mui/material";
import { ThumbUpAlt } from "@mui/icons-material";
import Lottie from "lottie-react";
import ReactionViewModalSkeleton from "../skeletons/ReactionViewModalSkeleton";
import reactionAnimations from "../../constants/reactionAnimationList";
import ContentHeaderAndMedia from "../content/ContentHeaderAndMedia";
import { useGetReactionsForContent } from "../../hooks/content/contentReaction";
import { useNavigate } from "react-router-dom";
import { AvatarHeader } from "../content/AvatarHeader";

const ReactionViewModal = ({ onClose, open, content }) => {
  const { _id: contentId } = content || {};
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const isSmallScreen = useMediaQuery("(max-width:900px)");
  const isBelow600 = useMediaQuery("(max-width:600px)");

  // Fetch reactions (paginated, max 10 per page)
  const { data: reactionsData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useGetReactionsForContent({ contentId });

  // Get the logged-in user's profile

  // Flatten the paginated data
  const reactionsList = reactionsData?.pages?.flatMap((page) => page.reactionDetails.reactions) || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth={isSmallScreen ? "xs" : "sm"} fullWidth fullScreen={isBelow600}>
      <DialogContent
        onScroll={(e) => setScrolled(e.target.scrollTop > 0)}
        sx={{
          display: "flex",
          flexDirection: "column",
          maxHeight: { xs: "100vh", sm: "70vh" },
          p: 2,
          overflowY: "auto",
        }}
      >
        {/* Fixed media header */}
        <AvatarHeader contentOwner={content?.user} onClose={onClose} />
        <ContentHeaderAndMedia content={content} onClose={onClose} />

        {/* Scrollable reaction list area */}
        <Box sx={{ mt: 2 }}>
          <Stack alignItems={"center"} justifyContent={"space-between"} flexDirection={"row"}>
            <Typography
              sx={{
                fontWeight: "bold",
                fontFamily: "poppins",
                m: 0,
                textDecoration: scrolled ? "line-through" : "none",
                fontSize: { xs: ".9rem", sm: "1rem" },
              }}
            >
              Reacted
            </Typography>
          </Stack>

          {isLoading ? (
            <List sx={{ my: "1rem" }}>
              {[...Array(4)].map((_, index) => (
                <ReactionViewModalSkeleton key={index} />
              ))}
            </List>
          ) : (
            <Stack sx={{ mt: ".2rem" }}>
              {reactionsList.length > 0 ? (
                <List sx={{ maxHeight: "300px" }}>
                  {reactionsList.map((reaction) => {
                    const animation = reactionAnimations.find((anim) => anim.name === reaction?.type)?.animationData;
                    return (
                      <ListItemButton
                        key={reaction?._id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          borderRadius: 2,
                          mb: 1,
                          boxShadow: 3,
                          "&:hover": { backgroundColor: "rgba(0,0,0,0.05)" },
                          padding: 2,
                        }}
                      >
                        <Tooltip title={`Visit Profile`}>
                          <Avatar
                            src={reaction?.user?.profileImage || ""}
                            alt={reaction?.user?.firstName}
                            sx={{ boxShadow: 3, cursor: "pointer" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/user-profile/${reaction?.user?._id}`);
                            }}
                          />
                        </Tooltip>
                        <Box flex="1">
                          <Typography variant="body1" sx={{ fontWeight: "bold", fontSize: { xs: ".8rem", md: ".9rem" } }}>
                            {reaction?.user?.firstName} {reaction?.user?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "poppins" }}>
                            {reaction?.type || "Like"}
                          </Typography>
                        </Box>
                        <Stack sx={{ width: { md: "3rem", xs: "2rem" }, height: { md: "3rem", xs: "2rem" } }}>
                          {animation ? <Lottie animationData={animation} loop autoPlay style={{ height: "100%", width: "100%" }} /> : <ThumbUpAlt sx={{ color: "gray", fontSize: "2rem" }} />}
                        </Stack>
                      </ListItemButton>
                    );
                  })}
                </List>
              ) : (
                <Typography align="center" sx={{ mt: 2 }}>
                  No reactions yet.
                </Typography>
              )}

              {hasNextPage && (
                <Button onClick={fetchNextPage} disabled={isFetchingNextPage} sx={{ mt: 2, alignSelf: "center" }}>
                  {isFetchingNextPage ? "Loading more..." : "Load More"}
                </Button>
              )}
            </Stack>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ReactionViewModal;
