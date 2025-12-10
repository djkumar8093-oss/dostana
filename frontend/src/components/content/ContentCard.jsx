/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { Avatar, AvatarGroup, Box, Chip, CircularProgress, IconButton, List, ListItemText, SpeedDial, SpeedDialAction, Stack, Tooltip, Typography, useMediaQuery } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DownloadIcon from "@mui/icons-material/Download";
import SaveIcon from "@mui/icons-material/Save";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import { Delete } from "@mui/icons-material";
import FileSaver from "file-saver";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReactPlayer from "react-player";

// Helpers & Utils
import { formatDate } from "../../utilsFunction/dateFn.js";
import getReactedByText from "../../utilsFunction/getReactedByText";

// Redux slices and dialogs
import { openMediaDialog } from "../../reduxSlices/mediaPreviewSlice";

// Custom hooks for content actions
import { useToggleSaveContent } from "../../hooks/content/contentSave";
import { useDeleteContent } from "../../hooks/content/content";
// Removed: import { useGetReactionsByContentId } from "../../../hooks/content/contentReaction";

// Components (Reaction, Comment, Share)
import ReactionChip from "../reaction/ReactionChip";
import ReactionViewModal from "../reaction/ReactionViewModal";
import CommentsViewModal from "../comment/CommentsViewModal";
import ContentShareCardModal from "./ContentShareCardModal.jsx";

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
  exit: { y: 20, opacity: 0, transition: { duration: 0.3 } },
};

const ContentCard = ({ content, userProfile, handleClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  // State for toggling full caption display
  const [expandedCaption, setExpandedCaption] = useState(false);

  // Destructure common properties from content object.
  // Note: reactionDetails is now attached directly to the content.
  const {
    media = [], // New media array: each item has { url, type }
    caption = "",
    user: contentOwner = {},
    createdAt = "",
    _id: contentId,
    type = "post", // defaults to "post" if not provided
    isSavedByUser,
    reactionDetails,
  } = content || {};

  const isSmallScreen = useMediaQuery("(max-width:480px)");
  const isBelow600 = useMediaQuery("(max-width:600px)");

  // Destructure reaction details.
  const { totalReactions, reactions } = reactionDetails || { totalReactions: 0, reactions: [] };

  const { profileImage, firstName = "", lastName = "" } = contentOwner || {};

  // Determine if the current user has reacted (for text details).
  const userReaction = reactionDetails?.reactions?.find((reaction) => reaction?.user?._id === userProfile?._id) || null;

  // Delete content hook – available only if the logged-in user is the owner.
  const { isPending: isDeletingContent, mutate: deleteContent } = useDeleteContent({ type });
  const isSelf = userProfile?._id === contentOwner?._id;

  // Saved content hooks (check status and toggle).
  const { mutate: toggleSaveContent, isPending: isTogglingSave } = useToggleSaveContent({ type });

  // Local state for tooltips and modal controls.
  const [openReactionViewModal, setOpenReactionViewModal] = useState(false);
  const [openCommentViewModal, setOpenCommentViewModal] = useState(false);
  const [openShareModal, setOpenShareModal] = useState(false);

  // Preview media (open media dialog) using the new media structure.
  const previewMedia = (index) => {
    console.log(media, index);
    dispatch(openMediaDialog({ mediaSources: media, showDownload: true, selectedIndex: index }));
  };

  // Navigate to the content owner's profile.
  const navigateToProfile = () => {
    if (userProfile._id === contentOwner._id) {
      navigate("/profile");
    } else {
      navigate(`/user-profile/${contentOwner?._id}`);
    }
  };

  // Handler for downloading media files.
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await Promise.all(
        media.map(async (item) => {
          const filename = item.url.split("/").pop();
          FileSaver.saveAs(item.url, filename);
        })
      );
      console.log("Media downloaded successfully");
    } catch (error) {
      console.error("Error downloading media:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const truncateName = (name) => (name.length > 30 && isSmallScreen ? `${name.substring(0, 16)}...` : name);

  // Handler for deleting content.
  const handleDeleteClick = () => {
    deleteContent({ contentId }, { onSuccess: () => handleClose() });
  };

  // Handler for toggling save/unsave status.
  const handleSaveOrUnsave = () => {
    toggleSaveContent(contentId);
  };

  const handleOpenReactionViewModal = async () => {
    setOpenReactionViewModal(true);
  };

  // Render the media section based on content type.
  const renderMediaSection = () => {
    if (media.length === 0) {
      return <Stack sx={{ height: "100%", width: "100%", bgcolor: "#000" }} />;
    }

    if (type === "post") {
      // Post media: grid-like layout with larger container.
      return (
        <Stack
          sx={{
            height: "26rem",
            width: "100%",
            overflow: "hidden",
            mt: { xs: ".4rem", sm: "1rem" },
            display: "flex",
            flexDirection: "row",
            gap: "0.5rem",
          }}
        >
          {media.map((item, index) => (
            <Box
              key={index}
              sx={{
                height: "100%",
                width: media.length > 1 ? "calc(100% / 2)" : "100%",
                bgcolor: "#000",
                position: "relative",
                cursor: "pointer",
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                previewMedia(index);
              }}
            >
              {item.type === "video" ? (
                <ReactPlayer url={item.url} width="100%" height="100%" controls style={{ objectFit: "contain" }} />
              ) : (
                <Box
                  component="img"
                  src={item.url}
                  sx={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                />
              )}
            </Box>
          ))}
        </Stack>
      );
    } else if (type === "thought") {
      // Tweet media: horizontally scrollable row.
      return (
        <Stack
          sx={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Stack
            flexDirection="row"
            gap={2}
            sx={{
              overflowX: "auto",
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
              width: "95%",
            }}
          >
            {media.map((item, index) => (
              <Box
                key={index}
                component={item.type === "image" ? "img" : "video"}
                loading="lazy"
                src={item.url}
                sx={{
                  height: "8rem",
                  width: "8rem",
                  cursor: "pointer",
                  objectFit: "contain",
                  bgcolor: "#000",
                  borderRadius: ".4rem",
                }}
                controls={item.type === "video"}
                onClick={() => {
                  previewMedia(index);
                }}
              />
            ))}
          </Stack>
        </Stack>
      );
    }
  };

  // Render action buttons based on content type.
  const renderActionButtons = () => {
    if (type === "post") {
      return (
        <Stack flexDirection="row" gap={1} sx={{ width: "100%" }}>
          <ReactionChip content={content} userProfile={userProfile} userReaction={userReaction} />
          <Chip icon={<CommentRoundedIcon />} label="Comment" onClick={() => setOpenCommentViewModal(true)} variant="outlined" sx={{ width: "100%" }} />
          <Chip icon={<ShareRoundedIcon />} label="Share" onClick={() => setOpenShareModal(true)} variant="outlined" sx={{ width: "100%" }} />
        </Stack>
      );
    } else if (type === "thought") {
      return (
        <Stack flexDirection="row" gap={1} sx={{ width: "100%" }}>
          <ReactionChip content={content} userProfile={userProfile} userReaction={userReaction} />
          <Chip icon={<CommentRoundedIcon />} label="Comment" onClick={() => setOpenCommentViewModal(true)} variant="outlined" sx={{ width: "100%" }} />
        </Stack>
      );
    }
  };

  return (
    // <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit" style={{ width: "100%" }}>
    <Stack
      sx={{
        minHeight: type === "post" ? "20rem" : "10rem",
        width: "100%",
        borderRadius: ".8rem",
        boxShadow: 3,
        bgcolor: "#fff",
        position: "relative",
      }}
    >
      {/* Header Section */}
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" pr={0} py={".4rem"} pl={{ md: ".8rem", sm: ".2rem" }}>
        <List sx={{ mr: "1.8rem" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {isBelow600 && handleClose && (
              <IconButton onClick={handleClose}>
                <ArrowBackIcon sx={{ ml: ".4rem" }} />
              </IconButton>
            )}
            <Tooltip title="View Profile">
              <IconButton onClick={navigateToProfile}>
                <Avatar
                  sx={{
                    height: { xs: "2.8rem", sm: "3.2rem" },
                    width: { xs: "2.8rem", sm: "3.2rem" },
                    boxShadow: 3,
                  }}
                  src={profileImage || ""}
                />
              </IconButton>
            </Tooltip>
            <ListItemText
              primary={truncateName(firstName + " " + lastName)}
              secondary={`${formatDate(createdAt)}`}
              sx={{ marginLeft: { sx: ".2rem", sm: ".5rem" } }}
              slotProps={{
                primary: {
                  sx: { fontWeight: "bold", color: "#0000008d", fontSize: { xs: ".9rem", sm: "1rem" } },
                },
              }}
            />
          </Box>
        </List>

        <SpeedDial
          ariaLabel="SpeedDial"
          direction="left"
          sx={{
            zIndex: 1,
            position: "absolute",
            right: { xs: "-.2rem", sm: ".2rem" },
            "& .MuiSpeedDial-fab": {
              boxShadow: "none",
              backgroundColor: "transparent",
              "&:hover": { backgroundColor: "transparent" },
            },
          }}
          icon={<MoreVertIcon sx={{ color: "#0000007f" }} />}
        >
          {isSelf && <SpeedDialAction icon={isDeletingContent ? <CircularProgress size={24} /> : <Delete />} tooltipTitle={isDeletingContent ? "Deleting..." : "Delete"} onClick={handleDeleteClick} />}
          {media.length > 0 && <SpeedDialAction icon={<DownloadIcon />} tooltipTitle={isDownloading ? "Downloading..." : "Download"} onClick={handleDownload} />}
          <SpeedDialAction
            icon={isTogglingSave ? <CircularProgress size={24} /> : <SaveIcon sx={{ color: isSavedByUser ? "#ffffff" : "#000000" }} />}
            tooltipTitle={isSavedByUser ? "Unsave" : "Save"}
            sx={{ bgcolor: isSavedByUser ? "#006400" : "transparent" }}
            onClick={handleSaveOrUnsave}
          />
          {type === "thought" && <SpeedDialAction icon={<ShareRoundedIcon />} tooltipTitle="Share" onClick={() => setOpenShareModal(true)} />}
        </SpeedDial>
      </Stack>

      {/* Caption Section (if any) */}
      {caption.trim().length > 0 && (
        <Stack sx={{ px: "1rem" }}>
          <Typography variant="body2" sx={{ color: "#000000" }}>
            {expandedCaption || caption.length <= 100 ? caption : `${caption.substring(0, 100)}... `}
            {!expandedCaption && caption.length > 100 && (
              <span style={{ color: "#1976d2", cursor: "pointer" }} onClick={() => setExpandedCaption(true)}>
                Read More
              </span>
            )}
          </Typography>
        </Stack>
      )}

      {/* Media Section */}
      {renderMediaSection()}

      {/* Reaction and Action Buttons */}
      <Stack p={".8rem"}>
        {totalReactions > 0 && (
          <Stack px={".2rem"} sx={{ mb: ".4rem" }} flexDirection="row" alignItems="center" gap={".2rem"}>
            <AvatarGroup max={3} onClick={() => setOpenReactionViewModal(true)} sx={{ cursor: "pointer" }}>
              {reactions.map((reaction, index) => (
                <Avatar key={index} sx={{ width: "1.6rem", height: "1.6rem", boxShadow: 3 }} src={reaction.user.profileImage || ""} />
              ))}
            </AvatarGroup>
            <Typography variant="body2" sx={{ ml: ".4rem", fontFamily: "poppins", fontSize: ".7rem", cursor: "pointer" }} onClick={handleOpenReactionViewModal}>
              {getReactedByText({ reactionDetails, userProfile })}
            </Typography>
          </Stack>
        )}

        {renderActionButtons()}
      </Stack>

      {/* Modals */}
      {openReactionViewModal && <ReactionViewModal contentOwner={contentOwner} open={openReactionViewModal} onClose={() => setOpenReactionViewModal(false)} content={content} />}
      {openCommentViewModal && <CommentsViewModal open={openCommentViewModal} onClose={() => setOpenCommentViewModal(false)} contentOwner={contentOwner} content={content} />}
      {openShareModal && <ContentShareCardModal open={openShareModal} onClose={() => setOpenShareModal(false)} content={content} contentOwner={contentOwner} />}
    </Stack>
    // </motion.div>
  );
};

export default React.memo(ContentCard);
