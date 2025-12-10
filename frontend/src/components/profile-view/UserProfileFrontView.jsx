/* eslint-disable react/prop-types */
import { useContext, useState } from "react";
import { Avatar, Box, Button, Skeleton, Stack, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported"; // New icon for placeholder
import { useDispatch } from "react-redux";
import { openMediaDialog } from "../../reduxSlices/mediaPreviewSlice";
import { useParams, useNavigate } from "react-router-dom";

// Import friend-related icons and hooks
import { CheckCircle as CheckCircleIcon, PersonRemove as PersonRemoveIcon, PersonAdd as PersonAddIcon, CancelOutlined, Message as MessageIcon } from "@mui/icons-material";

import { SocketContext } from "../../contextProvider/SocketProvider";
import { useGetRelationshipById, useRemoveFriend } from "../../hooks/friends/friends";
import { useAcceptFriendRequest, useDeclineFriendRequest } from "../../hooks/friends/friendRequests";
import { useSendFriendRequest, useCancelFriendRequest } from "../../hooks/friends/suggestedUsers";
import { useUpdateProfile } from "../../hooks/userProfile/userProfileUpdation";

const UserProfileFrontView = ({ userProfile }) => {
  const socket = useContext(SocketContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId: routeUserId } = useParams(); // This is the profile being viewed.

  // If no userId is provided in URL params, then this is your own profile.
  const isSelf = !routeUserId;

  const { firstName = "", lastName = "", about = "", profileImage = "", coverImage = "" } = userProfile || {};

  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState("");

  const theme = useTheme();
  const isBelowSm = useMediaQuery(theme.breakpoints.down("sm"));
  const isBelow380 = useMediaQuery("(max-width:380px)");
  const buttonSize = isBelowSm ? "small" : "medium";
  const skeletonWidth = isBelowSm ? 100 : 120;
  const skeletonHeight = isBelowSm ? 32 : 36;

  // Relationship hooks for friend actions
  const { mutate: sendFriendRequest, isPending: isSendingFriendRequest } = useSendFriendRequest(socket);
  const { mutate: cancelFriendRequest, isPending: isCancelingFriend } = useCancelFriendRequest(socket);
  const { mutate: acceptFriendRequest, isPending: isAcceptingFriend } = useAcceptFriendRequest(socket);
  const { mutate: declineFriendRequest, isPending: isDecliningFriend } = useDeclineFriendRequest(socket);
  const { mutate: removeFriend, isPending: isRemovingFriend } = useRemoveFriend(socket);

  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  // Relationship status
  const { data: relationshipData, isLoading: isRelationshipLoading } = useGetRelationshipById(routeUserId);

  // Handlers for friend actions
  const handleSendRequest = () => sendFriendRequest(routeUserId);
  const handleCancelRequest = () => cancelFriendRequest(routeUserId);
  const handleAcceptRequest = () => acceptFriendRequest(routeUserId);
  const handleDeclineRequest = () => declineFriendRequest(routeUserId);
  const handleRemove = () => removeFriend(routeUserId);

  const handleImageView = (img) => {
    if (!img) return;
    dispatch(
      openMediaDialog({
        showDownload: true,
        mediaSources: [{ url: img, type: "image" }],
      })
    );
  };

  const handleCoverImageUpdate = async () => {
    if (!coverImageFile) return;
    const formData = new FormData();
    formData.append("coverImage", coverImageFile);
    console.log(coverImageFile);
    updateProfile(formData);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCoverImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setCoverImagePreview(previewUrl);
    }
  };

  // Render friend action buttons if viewing another user’s profile
  const renderFriendActions = () => {
    if (isRelationshipLoading) {
      return (
        <Stack direction={isBelow380 ? "column" : "row"} spacing={1}>
          <Skeleton variant="rectangular" width={skeletonWidth} height={skeletonHeight} />
          <Skeleton variant="rectangular" width={skeletonWidth} height={skeletonHeight} />
        </Stack>
      );
    }

    switch (relationshipData?.relationship) {
      case "friends":
        return (
          <Stack direction="row" spacing={1} width={isBelow380 ? "100%" : "auto"}>
            <Button
              variant="outlined"
              size={buttonSize}
              startIcon={<PersonRemoveIcon />}
              onClick={handleRemove}
              loading={isRemovingFriend}
              loadingPosition="start"
              fullWidth={isBelow380}
              sx={{
                fontWeight: "bold",
                textTransform: "none",
                minWidth: { sm: "10rem", xs: "8rem" },
              }}
            >
              Remove
            </Button>
            <Button
              variant="outlined"
              size={buttonSize}
              startIcon={<MessageIcon />}
              onClick={() => navigate(`/chats/${routeUserId}`)}
              fullWidth={isBelow380}
              sx={{
                fontWeight: "bold",
                minWidth: "10rem",
                textTransform: "none",
                paddingX: "2.4rem",
                fontSize: buttonSize === "small" ? ".7rem" : ".8rem",
                mt: "1rem",
              }}
            >
              Message
            </Button>
          </Stack>
        );

      case "pending_sent":
        return (
          <Tooltip title="Cancel Request">
            <Button
              variant="outlined"
              size={buttonSize}
              startIcon={<CancelOutlined />}
              onClick={handleCancelRequest}
              loading={isCancelingFriend}
              loadingPosition="start"
              sx={{
                fontWeight: "bold",
                minWidth: "10rem",
                textTransform: "none",
              }}
            >
              Request Sent
            </Button>
          </Tooltip>
        );

      case "pending_received":
        return (
          <Stack direction="row" spacing={1} width={isBelow380 ? "100%" : "auto"}>
            <Button
              variant="contained"
              size={buttonSize}
              startIcon={<CheckCircleIcon />}
              onClick={handleAcceptRequest}
              loading={isAcceptingFriend}
              fullWidth={isBelow380}
              loadingPosition="start"
              sx={{
                fontWeight: "bold",
                minWidth: "10rem",
                textTransform: "none",
              }}
            >
              Accept
            </Button>
            <Button
              variant="outlined"
              size={buttonSize}
              startIcon={<CancelOutlined />}
              onClick={handleDeclineRequest}
              loading={isDecliningFriend}
              loadingPosition="start"
              fullWidth={isBelow380}
              sx={{
                fontWeight: "bold",
                minWidth: "10rem",
                textTransform: "none",
              }}
            >
              Decline
            </Button>
          </Stack>
        );

      default:
        return (
          <Button
            variant="contained"
            size={buttonSize}
            startIcon={<PersonAddIcon />}
            onClick={handleSendRequest}
            loading={isSendingFriendRequest}
            loadingPosition="start"
            sx={{
              fontWeight: "bold",
              minWidth: "10rem",
              textTransform: "none",
            }}
          >
            Add Friend
          </Button>
        );
    }
  };

  return (
    <Stack width={"100%"}>
      <Stack
        sx={{
          width: "100%",
          height: { md: "30rem", sm: "22rem", xs: "18rem" },
          mt: "1rem",
          position: "relative",
          borderRadius: "1rem",
          bgcolor: "#000",
        }}
      >
        {coverImage || coverImagePreview ? (
          <Tooltip title="View Cover Pic">
            <Box
              component={"img"}
              src={coverImagePreview || coverImage}
              sx={{
                objectFit: "cover",
                height: "100%",
                width: "100%",
                borderRadius: "1rem",
              }}
              onClick={() => handleImageView(coverImagePreview || coverImage)}
            />
          </Tooltip>
        ) : (
          <Stack
            sx={{
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ImageNotSupportedIcon sx={{ fontSize: "4rem", color: "white", mb: 1 }} />
            <Typography
              variant="h5"
              sx={{
                color: "white",
                fontWeight: "bold",
                fontSize: { md: "1.5rem", sm: "1.2rem", xs: "1rem" },
              }}
            >
              No Cover Image
            </Typography>
          </Stack>
        )}
        {isSelf && (
          <Stack
            sx={{
              position: "absolute",
              bottom: "1rem",
              right: "1rem",
            }}
            flexDirection="row"
            gap={1}
          >
            <input type="file" accept="image/*" id="cover-image-input" style={{ display: "none" }} onChange={handleImageChange} />
            <label htmlFor="cover-image-input">
              <Button
                variant="contained"
                color={coverImage || coverImagePreview ? "primary" : "secondary"}
                component="span"
                sx={{
                  fontWeight: "bold",
                  px: { sm: "1rem", xs: "0.6rem" },
                  fontSize: { sm: ".8rem", xs: ".7rem", md: ".9rem" },
                }}
              >
                {coverImage || coverImagePreview ? "Update Cover Image" : "Add Cover Image"}
              </Button>
            </label>
            {/* Show the upload button if a new file is selected */}
            {coverImageFile && (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleCoverImageUpdate}
                sx={{
                  fontWeight: "bold",
                  px: { sm: "1rem", xs: "0.4rem" },
                  fontSize: { sm: ".8rem", xs: ".7rem", md: ".9rem" },
                  "&.Mui-disabled": {
                    backgroundColor: "#555 !important",
                    color: "#fff !important",
                    opacity: 1,
                  },
                  "&.MuiLoadingButton-loading": {
                    backgroundColor: (theme) => theme.palette.secondary.main,
                  },
                }}
                startIcon={<CloudUploadIcon />}
                disabled={isUpdating || !coverImageFile}
              >
                Upload
              </Button>
            )}
          </Stack>
        )}
        <Stack
          sx={{
            position: "absolute",
            bgcolor: "#ffffffe1",
            top: "1rem",
            left: { xs: ".4rem", sm: "1rem", md: "2rem" },
            p: { xs: ".7rem", sm: "1rem", md: "1.2rem" },
            borderRadius: ".8rem",
            boxShadow: 1,
          }}
          flexDirection={"row"}
          alignItems={"center"}
          gap={".6rem"}
        >
          <Tooltip title="View Profile Pic" placement="top">
            <Avatar
              src={profileImage}
              sx={{
                width: { xs: "3rem", sm: "4rem", md: "5rem" },
                height: { xs: "3rem", sm: "4rem", md: "5rem" },
                cursor: "pointer",
                boxShadow: 3,
              }}
              onClick={() => handleImageView(profileImage)}
            />
          </Tooltip>
          <Typography variant="body1" sx={{ fontWeight: "bold", wordBreak: "break-word", overflowWrap: "break-word", fontSize: { xs: ".8rem", sm: ".9rem", md: "1rem" } }}>
            {`${firstName} ${lastName}`}
          </Typography>
        </Stack>
      </Stack>
      <Stack alignItems={"center"} justifyContent={"center"} m="2rem">
        <Tooltip title="About Me">
          <Typography variant="body2" fontWeight={"bold"} sx={{ textAlign: "start", wordBreak: "break-word", overflowWrap: "break-word" }}>
            {about || "Hey there, I am Dostana a social media app!"}
          </Typography>
        </Tooltip>
      </Stack>
      {/* Friend action buttons: Only display if viewing another user’s profile */}
      {!isSelf && (
        <Stack spacing={2} mb={2} alignItems={"flex-end"} px=".4rem">
          {renderFriendActions()}
        </Stack>
      )}
    </Stack>
  );
};

export default UserProfileFrontView;
