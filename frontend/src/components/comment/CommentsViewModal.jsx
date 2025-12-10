/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from "react";
import { Box, Dialog, DialogContent, IconButton, InputAdornment, Stack, TextField, Tooltip, Typography, List, ListItem, CircularProgress, Button, useMediaQuery } from "@mui/material";
import Lottie from "lottie-react";
import { chatSecondaryAnimation } from "../../animation";
import AddReactionIcon from "@mui/icons-material/AddReaction";
import EmojiPickerComponent from "../common/EmojiPickerComponent";
import CommentViewModalSkeleton from "../skeletons/CommentViewModalSkeleton";
import { AnimatePresence, motion } from "framer-motion";
import ContentHeaderAndMedia from "../content/ContentHeaderAndMedia";
import CommentItem from "./CommentItem";
import { useCreateNotification } from "../../hooks/notification/notification";
import { useCreateComment, useGetCommentsForContent } from "../../hooks/comment/comment";
import { Refresh as RefreshIcon, Check, ErrorOutline, Close as CloseIcon } from "@mui/icons-material";
import { sendIcon } from "../../assets";
import { AvatarHeader } from "../content/AvatarHeader";

// Pending (sending) comment component with constrained width and motion animation
const SendingComment = ({ comment, onRetry, onRemove }) => (
  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
    <Box
      sx={{
        maxWidth: "100%",
        width: "fit-content",
        minWidth: "50%",
        alignSelf: "flex-start",
        bgcolor: "background.paper",
        p: 2,
        borderRadius: 2,
        boxShadow: 3,
        display: "flex",
        alignItems: "center",
        gap: 1,
        mb: 1,
        wordBreak: "break-word",
      }}
    >
      <Typography variant="body2" sx={{ flex: 1 }}>
        {comment.text}
      </Typography>
      {comment.status === "sending" && <CircularProgress size={20} />}
      {comment.status === "sent" && <Check fontSize="small" color="success" />}
      {comment.status === "failed" && (
        <Stack direction="row" alignItems="center" gap={0.5}>
          <ErrorOutline fontSize="small" color="error" />
          <Tooltip title="Retry">
            <IconButton onClick={() => onRetry(comment)} size="small">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove">
            <IconButton onClick={() => onRemove(comment)} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )}
    </Box>
  </motion.div>
);

const CommentsViewModal = ({ onClose, content }) => {
  const { _id: contentId, user: contentOwner, mediaUrl = [] } = content || {};
  const isBelow600 = useMediaQuery("(max-width: 600px)");

  // State for emoji picker, input text, and pending (sending) comments
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [comment, setComment] = useState("");
  const [pendingComments, setPendingComments] = useState([]);

  const { mutate: createComment, isLoading: isCreatingComment } = useCreateComment({ type: content.type });
  const { data, isError, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetCommentsForContent({ contentId, limit: 10 });
  const { mutate: createNotification } = useCreateNotification();

  // Ref for the scrollable container wrapping content card and comments list
  const scrollContainerRef = useRef(null);

  const handleCloseEmojiPicker = () => {
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiObject) => {
    setComment((prev) => prev + emojiObject.emoji);
  };

  // When a new pending comment is added, scroll the container to the top
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [pendingComments]);

  // When sending a comment, add it as a pending comment and then call the API
  const handleAddComment = () => {
    if (comment.trim()) {
      const clientId = Date.now().toString();
      const newPendingComment = {
        clientId,
        text: comment,
        status: "sending",
        createdAt: new Date(),
      };
      setPendingComments((prev) => [...prev, newPendingComment]);

      createComment(
        { comment, contentId, targetUserId: contentOwner._id },
        {
          onSuccess: () => {
            // Mark the pending comment as sent
            setPendingComments((prev) => prev.map((pc) => (pc.clientId === clientId ? { ...pc, status: "sent" } : pc)));
            // Remove the pending comment after a short delay
            setTimeout(() => {
              setPendingComments((prev) => prev.filter((pc) => pc.clientId !== clientId));
            }, 2000);
          },
          onError: () => {
            // Mark the pending comment as failed
            setPendingComments((prev) => prev.map((pc) => (pc.clientId === clientId ? { ...pc, status: "failed" } : pc)));
          },
        }
      );
      setComment("");
    }
  };

  // Allow retrying a failed comment
  const handleRetryComment = (pendingComment) => {
    const newClientId = Date.now().toString();
    setPendingComments((prev) => prev.filter((pc) => pc.clientId !== pendingComment.clientId).concat({ ...pendingComment, clientId: newClientId, status: "sending" }));
    createComment(
      { comment: pendingComment.text, contentId },
      {
        onSuccess: () => {
          setPendingComments((prev) => prev.map((pc) => (pc.clientId === newClientId ? { ...pc, status: "sent" } : pc)));
          setTimeout(() => {
            setPendingComments((prev) => prev.filter((pc) => pc.clientId !== newClientId));
          }, 2000);
          createNotification({
            type: "content-comment",
            referenceId: contentId,
            action: "Commented on your post!",
            user: contentOwner._id,
          });
        },
        onError: () => {
          setPendingComments((prev) => prev.map((pc) => (pc.clientId === newClientId ? { ...pc, status: "failed" } : pc)));
        },
      }
    );
  };

  // Allow removal of a pending comment if desired
  const handleRemovePendingComment = (pendingComment) => {
    setPendingComments((prev) => prev.filter((pc) => pc.clientId !== pendingComment.clientId));
  };

  // Flatten pages from the infinite query into a single array of loaded comments
  const loadedComments = data ? data.pages.flatMap((page) => page.comments) : [];

  // Update the sticky header section

  return (
    <Dialog open={true} maxWidth="sm" fullWidth onClose={onClose} fullScreen={isBelow600}>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          p: 2,
          maxHeight: isBelow600 ? "100vh" : "70vh",
        }}
      >
        <AvatarHeader contentOwner={contentOwner} onClose={onClose} />
        {/* Scrollable container for content card and comments */}
        <Stack sx={{ flex: 1, overflowY: "auto", mb: 2 }}>
          {/* Content card - maintains its full (provided) size */}
          <Box sx={{ mb: 2 }}>
            <ContentHeaderAndMedia content={content} mode="comment" onClose={onClose} />
          </Box>
          <Typography variant="body1" sx={{ mb: 1, fontWeight: "bold", fontSize: { sm: "1.2rem", xs: ".9rem" } }}>
            Comments
          </Typography>
          {/* This Box is referenced to scroll to the top when a new comment is added */}
          <Box ref={scrollContainerRef}>
            {/* Pending comments as a sticky header inside the scrollable area */}
            <Box
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 2,
                backgroundColor: "inherit",
                pt: 1,
                pl: 1,
                maxHeight: isBelow600 ? "40vh" : "60vh",
                overflowY: "auto",
                width: "80%",
              }}
            >
              <AnimatePresence initial={false}>
                {pendingComments.map((pendingComment) => (
                  <SendingComment key={pendingComment.clientId} comment={pendingComment} onRetry={handleRetryComment} onRemove={handleRemovePendingComment} />
                ))}
              </AnimatePresence>
            </Box>
            {/* Loaded comments */}
            {isLoading ? (
              <CommentViewModalSkeleton />
            ) : isError ? (
              <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
                <Stack sx={{ height: { sm: "12rem", xs: "8rem" }, width: { sm: "12rem", xs: "8rem" } }}>
                  <Lottie animationData={chatSecondaryAnimation} loop={false} style={{ height: "100%", width: "100%" }} />
                </Stack>
                <Typography variant="body1" fontWeight="bold" color="#000000d1" sx={{ fontSize: { sm: ".9rem", xs: ".7rem" } }}>
                  Failed to load comments.
                </Typography>
              </Stack>
            ) : (
              <>
                {loadedComments.length === 0 ? (
                  <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }} flex={1}>
                    <Stack sx={{ height: { sm: "12rem", xs: "8rem" }, width: { sm: "12rem", xs: "8rem" } }}>
                      <Lottie animationData={chatSecondaryAnimation} loop={true} style={{ height: "100%", width: "100%" }} />
                    </Stack>
                    <Typography variant="body1" fontWeight="bold" color="#000000d1" sx={{ fontSize: { sm: ".9rem", xs: ".7rem" } }}>
                      No comments yet
                    </Typography>
                  </Stack>
                ) : (
                  <List sx={{ p: 0 }}>
                    <AnimatePresence>
                      {loadedComments.map((commentItem) => (
                        <ListItem key={commentItem._id} sx={{ p: 0 }}>
                          <CommentItem comment={commentItem} contentOwner={contentOwner} />
                        </ListItem>
                      ))}
                    </AnimatePresence>
                  </List>
                )}
                {hasNextPage && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                      {isFetchingNextPage ? <CircularProgress size={20} /> : "Load More"}
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Stack>
        {/* Fixed input area */}
        <Box>
          <Box
            sx={{
              width: "100%",
              py: ".6rem",
              px: "1rem",
              border: "1px solid #ccc",
              borderRadius: "1.5rem",
              bgcolor: "#f9f9f9",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              mb: 1,
            }}
          >
            <TextField
              variant="standard"
              placeholder="Add a comment"
              color="secondary"
              multiline
              fullWidth
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              InputProps={{
                disableUnderline: true,
                endAdornment: (
                  <InputAdornment position="end" sx={{ display: "flex", alignSelf: "flex-end" }}>
                    <Tooltip title="Emoji">
                      <IconButton onClick={() => setShowEmojiPicker((prev) => !prev)}>
                        <AddReactionIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Send">
                      <IconButton onClick={handleAddComment} disabled={isCreatingComment}>
                        {isCreatingComment ? <CircularProgress size={20} sx={{ color: "inherit" }} /> : <Box component="img" src={sendIcon} sx={{ height: "2rem", width: "2rem" }} />}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              sx={{
                borderRadius: "1.5rem",
                px: "1rem",
                py: "0.5rem",
                bgcolor: "white",
                boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                maxHeight: "10rem",
                overflow: "auto",
              }}
            />
          </Box>
          {showEmojiPicker && <EmojiPickerComponent show={showEmojiPicker} onClose={handleCloseEmojiPicker} onEmojiClick={handleEmojiClick} />}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CommentsViewModal;
