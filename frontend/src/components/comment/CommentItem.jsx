/* eslint-disable react/prop-types */
import { Avatar, Box, IconButton, Stack, Typography, Paper, MenuItem, Menu, Tooltip, CircularProgress } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RefreshIcon from "@mui/icons-material/Refresh";
import { formatDate } from "../../utilsFunction/dateFn";
import { useState } from "react";
import { motion } from "framer-motion";
import { useUserProfile } from "../../hooks/userProfile/userProfile";
import { useDeleteComment } from "../../hooks/comment/comment";

const CommentItem = ({ comment, contentOwner, isFetchingComment }) => {
  const { comment: commentText, createdAt = new Date(), _id: commentId, user: commentOwner, content: contentId } = comment || {};

  const { data: userProfile } = useUserProfile();
  const { mutate: deleteComment, isPending: isDeletingComment } = useDeleteComment();

  const selfComment = commentOwner?._id === userProfile?._id;
  const isSelfContent = userProfile?._id === contentOwner?._id;

  const { firstName, lastName, profileImage } = commentOwner || {};

  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteError, setDeleteError] = useState(false);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    // Reset any previous error state when opening the menu.
    setDeleteError(false);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    // Prevent closing while a deletion is in progress.
    if (!isDeletingComment) {
      setAnchorEl(null);
      setDeleteError(false);
    }
  };

  const handleDelete = () => {
    if (isDeletingComment || isFetchingComment) return;
    // Clear any previous error state.
    setDeleteError(false);
    deleteComment(
      { commentId, contentId, targetUserId: commentOwner._id },
      {
        onSuccess: () => {
          // On success, close the menu.
          setAnchorEl(null);
        },
        onError: () => {
          // On error, display an error message; the menu remains open.
          setDeleteError(true);
        },
      }
    );
  };

  const showDeleteBtn = isSelfContent || selfComment;

  return (
    <Stack sx={{ minWidth: { md: "18rem", sm: "15rem", xs: "60%" }, maxWidth: { md: "70%", sm: "80%", xs: "90%" } }}>
      <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ opacity: 0, x: "-100%" }} transition={{ duration: 0.3 }} style={{ height: "100%" }}>
        <Box display="flex" alignItems="flex-start" mb={2} width="100%">
          <Tooltip title="Visit Profile">
            <Avatar src={profileImage} sx={{ boxShadow: 3, cursor: "pointer" }} />
          </Tooltip>
          <Box ml={2} flex={1}>
            <Paper
              elevation={3}
              sx={{
                borderRadius: "15px",
                position: "relative",
                p: ".4rem",
              }}
            >
              <Stack flexDirection="row" justifyContent="space-between" alignItems="center" pl={1.5} width="100%">
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: "bold", mr: 5 }}>
                  {firstName} {lastName}
                </Typography>
                {showDeleteBtn && (
                  <>
                    <Tooltip title={"Options"}>
                      <IconButton onMouseEnter={handleMenuOpen} onClick={handleMenuOpen} sx={{ position: "absolute", right: ".2rem", top: ".2rem" }}>
                        <MoreVertIcon sx={{ color: "#0000008d", width: "1.4rem", height: "1.4rem" }} />
                      </IconButton>
                    </Tooltip>
                    <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
                      {isDeletingComment ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} color="error" sx={{ mr: 1 }} />
                          Deleting...
                        </MenuItem>
                      ) : deleteError ? (
                        <MenuItem>
                          <Typography variant="inherit" color="error" sx={{ mr: 1 }}>
                            Failed to delete
                          </Typography>
                          <IconButton onClick={handleDelete} size="small">
                            <RefreshIcon fontSize="small" />
                          </IconButton>
                        </MenuItem>
                      ) : (
                        <MenuItem onClick={handleDelete}>Delete</MenuItem>
                      )}
                    </Menu>
                  </>
                )}
              </Stack>
              <Stack p={1.5} pt={1}>
                <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
                  {commentText}
                </Typography>
                <Typography variant="caption" color="text.secondary" alignSelf="flex-end">
                  {formatDate(createdAt)}
                </Typography>
              </Stack>
            </Paper>
          </Box>
        </Box>
      </motion.div>
    </Stack>
  );
};

export default CommentItem;
