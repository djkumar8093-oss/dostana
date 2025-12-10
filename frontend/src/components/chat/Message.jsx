/* eslint-disable react/prop-types */
import React, { useState, useRef, useContext, useEffect } from "react";
import { Avatar, Box, IconButton, Menu, MenuItem, Stack, Typography, Tooltip, CircularProgress } from "@mui/material";
import { BlockRounded, Delete as DeleteIcon, MoreVertRounded, PlayArrowRounded } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { openMediaDialog } from "../../reduxSlices/mediaPreviewSlice";
import { SocketContext } from "../../contextProvider/SocketProvider.jsx";
import { useDeleteMessage } from "../../hooks/chat/message.js";

// New inline component for rendering video media items.
const VideoThumbnail = ({ mediaItem, onMediaClick }) => {
  const videoRef = useRef(null);

  // When the play button is clicked, play the video without opening the modal.
  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  return (
    <Box sx={{ position: "relative", width: "100%" }} onClick={onMediaClick}>
      <video
        ref={videoRef}
        src={mediaItem.url}
        style={{
          width: "100%",
          maxHeight: "14rem",
          borderRadius: "8px",
          objectFit: "cover",
          cursor: "pointer",
          transition: "transform 0.3s ease-in-out",
        }}
        // Do not show default controls; we use our own play button.
        controls={false}
        poster={mediaItem.poster || ""}
      />
      <IconButton
        onClick={handlePlayClick}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          color: "white",
          padding: "4px",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          },
        }}
      >
        <PlayArrowRounded fontSize="small" />
      </IconButton>
      <Typography
        variant="caption"
        sx={{
          position: "absolute",
          bottom: 8,
          right: 8,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          color: "white",
          px: 1,
          py: 0.2,
          borderRadius: "4px",
          fontSize: "0.75rem",
        }}
      >
        {new Date(mediaItem.createdAt || Date.now()).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Typography>
    </Box>
  );
};

const Message = ({ message, chatId, recipient, userProfile, onView }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const dispatch = useDispatch();
  const { mutate: deleteMessage } = useDeleteMessage();
  const [deletingForMe, setDeletingForMe] = useState(false);
  const [deletingForEveryone, setDeletingForEveryone] = useState(false);
  const containerRef = useRef(null);

  const navigate = useNavigate();

  const isMyMessage = message?.sender?.toString() !== recipient._id?.toString();
  const hasOnlyOneImage = message?.media && message?.media.length === 1 && !message.text.trim();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  // Use IntersectionObserver to detect when this item is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // When at least 50% of the element is visible, call onView
            if (onView) {
              onView(message._id);
            }
            observerInstance.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [message._id, onView]);

  const handleDeleteMessage = (deleteForEveryone = false) => {
    if (deleteForEveryone) {
      setDeletingForEveryone(true);
    } else {
      setDeletingForMe(true);
    }

    deleteMessage(
      { messageId: message._id, deleteFor: deleteForEveryone ? "Everyone" : "Me", chatId, recipientId: recipient._id },
      {
        onSettled: () => {
          if (deleteForEveryone) {
            setDeletingForEveryone(false);
          } else {
            setDeletingForMe(false);
          }
          handleMenuClose();
        },
      }
    );
  };

  const onMediaClick = (index) => {
    dispatch(
      openMediaDialog({
        mediaSources: message.media,
        showDownload: true,
        selectedIndex: index,
      })
    );
  };

  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    // Wrap the entire message with motion.div
    <motion.div
      initial={{ opacity: 0, x: isMyMessage ? 50 : -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isMyMessage ? 50 : -50 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      ref={containerRef}
    >
      <Stack direction={isMyMessage ? "row-reverse" : "row"} spacing={0} alignItems="flex-start" mb={2.5}>
        <IconButton onClick={() => navigate(`/user-profile/${isMyMessage ? userProfile._id : recipient._id}`)}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              boxShadow: 2,
              border: "2px solid white",
              transform: "translateY(-0.5rem)",
            }}
            src={isMyMessage ? userProfile?.profileImage : recipient?.profileImage}
          />
        </IconButton>

        <Box
          sx={{
            position: "relative",
            borderRadius: hasOnlyOneImage ? "0" : "12px",
            boxShadow: hasOnlyOneImage ? "none" : 3,
            background: hasOnlyOneImage ? "none" : isMyMessage ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#f3f4f6",
            color: isMyMessage ? "white" : "#1f2937",
            p: hasOnlyOneImage ? 0 : 2,
            pb: hasOnlyOneImage ? 0 : 1.5,
            pr: hasOnlyOneImage ? 0 : "1.8rem",
            border: !isMyMessage && !hasOnlyOneImage ? "1px solid #e5e7eb" : "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            minWidth: "10rem",
            maxWidth: { md: "70%", sm: "80%", xs: "90%" },
          }}
        >
          {hasOnlyOneImage ? (
            <Box sx={{ position: "relative", width: "100%" }}>
              {/* Determine if the single media item is an image or video */}
              {message.media[0]?.type === "video" ? (
                <VideoThumbnail mediaItem={message.media[0]} onMediaClick={onMediaClick} />
              ) : (
                <Box
                  component="img"
                  src={message.media[0]?.url ? message.media[0].url : message.media[0]}
                  alt="message media"
                  sx={{
                    width: "100%",
                    maxHeight: "14rem",
                    objectFit: "cover",
                    cursor: "pointer",
                    transition: "transform 0.3s ease-in-out",
                    borderRadius: "12px",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                    display: "block",
                  }}
                  onClick={() => onMediaClick(0)}
                />
              )}

              <IconButton
                size="small"
                onClick={handleMenuOpen}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: { xs: ".4rem" },
                  backgroundColor: "rgba(5, 3, 3, 0.5)",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                  },
                }}
              >
                <MoreVertRounded fontSize="small" />
              </IconButton>
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  color: "white",
                  px: 1,
                  py: 0.2,
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                }}
              >
                {formattedTime}
              </Typography>
            </Box>
          ) : (
            <>
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 4,
                  color: isMyMessage ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.6)",
                }}
              >
                <MoreVertRounded fontSize="small" />
              </IconButton>

              {message.media && message.media.length > 0 && (
                <Box
                  sx={{
                    display: "grid",
                    gap: 1,
                    gridTemplateColumns: message.media.length === 1 ? "1fr" : "repeat(auto-fit, minmax(10rem, 1fr))",
                    overflowX: "auto",
                    whiteSpace: "nowrap",
                    p: 1,
                    borderRadius: "8px",
                    width: "100%",
                  }}
                >
                  {message.media.map((mediaItem, index) => {
                    // Handle both cases: media item is an object or a simple string.
                    const mediaUrl = mediaItem?.url || mediaItem;
                    const mediaType = mediaItem?.type || "image";

                    if (mediaType === "video") {
                      return <VideoThumbnail key={index} mediaItem={mediaItem} onMediaClick={onMediaClick} />;
                    } else {
                      return (
                        <Box
                          key={index}
                          component="img"
                          src={mediaUrl}
                          alt={`message media ${index}`}
                          sx={{
                            width: "100%",
                            maxHeight: "14rem",
                            borderRadius: "8px",
                            objectFit: "cover",
                            cursor: "pointer",
                            transition: "transform 0.3s ease-in-out",
                            "&:hover": {
                              transform: "scale(1.05)",
                            },
                          }}
                          onClick={() => onMediaClick(index)}
                        />
                      );
                    }
                  })}
                </Box>
              )}

              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                }}
              >
                {message.text}
              </Typography>
              <Stack alignItems={"flex-end"} width={"100%"} mt={1}>
                <Typography
                  variant="caption"
                  sx={{
                    right: 8,
                    color: isMyMessage ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.6)",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                  }}
                >
                  {formattedTime}
                </Typography>
              </Stack>
            </>
          )}

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => handleDeleteMessage(false)} disabled={deletingForMe || deletingForEveryone}>
              {deletingForMe ? <CircularProgress size={16} sx={{ mr: 1 }} /> : <DeleteIcon fontSize="small" sx={{ mr: 1 }} />}
              Delete for Me
            </MenuItem>
            {isMyMessage && (
              <MenuItem onClick={() => handleDeleteMessage(true)} disabled={deletingForEveryone || deletingForMe}>
                {deletingForEveryone ? <CircularProgress size={16} sx={{ mr: 1 }} /> : <BlockRounded fontSize="small" sx={{ mr: 1 }} />}
                Delete for Everyone
              </MenuItem>
            )}
          </Menu>
        </Box>
      </Stack>
    </motion.div>
  );
};

export default React.memo(Message);
