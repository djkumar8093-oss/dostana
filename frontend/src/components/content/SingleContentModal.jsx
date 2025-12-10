/* eslint-disable react/prop-types */
import React from "react";
import { Dialog, Typography, useMediaQuery } from "@mui/material";
import Lottie from "lottie-react";
import { useGetContentById } from "../../hooks/content/content";
import ContentCardSkeleton from "../skeletons/ContentCardSkeleton";
import ContentCard from "./ContentCard";
import { useUserProfile } from "../../hooks/userProfile/userProfile";
import { noPostFoundAnimation } from "../../animation";

const SingleContentModal = ({ contentId, open, handleClose }) => {
  const { data: content, isLoading: isFetchingContent, error } = useGetContentById({ contentId });
  const { data: userProfile } = useUserProfile();
  const isBelow600 = useMediaQuery("(max-width:600px)");

  // If there's an error, check for 404 vs. other errors.
  if (error) {
    return (
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { overflowX: "hidden" } } }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "60vh", justifyContent: "center" }}>
          <Lottie animationData={noPostFoundAnimation} style={{ width: { xs: "90%", sm: 300 }, height: 300 }} />
          <Typography variant="body2" sx={{ fontWeight: "bold", transform: "translateY(-2rem)" }}>
            Post Not Found
          </Typography>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { overflow: "visible" } } }}>
      {isFetchingContent ? <ContentCardSkeleton /> : content && <ContentCard content={content} userProfile={userProfile} handleClose={handleClose} />}
    </Dialog>
  );
};

export default SingleContentModal;
