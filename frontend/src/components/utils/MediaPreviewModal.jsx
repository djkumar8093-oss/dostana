import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Dialog, IconButton, Stack, Tooltip, useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import { saveAs } from "file-saver";
import { motion } from "framer-motion";
import { closeMediaDialog } from "../../reduxSlices/mediaPreviewSlice";

const MediaPreviewModal = () => {
  const dispatch = useDispatch();
  const { isOpen, mediaSources, showDownload, selectedIndex } = useSelector((state) => state.media);
  const isXs = useMediaQuery("(max-width:600px)");

  // Handle file download for the currently selected media.
  const handleDownload = async () => {
    const currentMedia = mediaSources[selectedIndex];
    const fileName = currentMedia.url.split("/").pop() || "downloaded_file";
    try {
      await saveAs(currentMedia.url, fileName);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const currentMedia = mediaSources[selectedIndex];

  return (
    <Dialog
      open={isOpen}
      onClose={() => dispatch(closeMediaDialog())}
      maxWidth="md"
      fullWidth
      slotProps={{
        backdrop: { style: { backdropFilter: "blur(4px)", backgroundColor: "rgba(0, 0, 0, 0.4)" } },
      }}
      PaperProps={{ style: { backgroundColor: "rgba(255, 255, 255, 0.8)" } }}
      sx={{ zIndex: 1600 }}
    >
      <Stack sx={{ width: "100%", height: "60vh", position: "relative", overflow: "hidden" }}>
        {/* Close Button */}
        <IconButton onClick={() => dispatch(closeMediaDialog())} sx={iconButtonStyles.topRight(isXs)}>
          <CloseIcon sx={iconIconStyles(isXs)} />
        </IconButton>

        {/* Download Button */}
        {showDownload && (
          <IconButton onClick={handleDownload} sx={iconButtonStyles.topLeft(isXs)}>
            <DownloadForOfflineIcon sx={iconIconStyles(isXs)} />
          </IconButton>
        )}

        {/* Media Preview */}
        {currentMedia?.type === "image" ? <Box component="img" src={currentMedia?.url} alt="Preview" sx={mediaStyles} /> : <Box component="video" src={currentMedia?.url} controls sx={mediaStyles} />}
      </Stack>
    </Dialog>
  );
};

const iconButtonStyles = {
  topRight: (isXs) => ({
    position: "absolute",
    top: "0.5rem",
    right: "0.5rem",
    zIndex: 2000,
    bgcolor: "#00000078",
    "&:hover": { bgcolor: "#000000" },
  }),
  topLeft: (isXs) => ({
    position: "absolute",
    top: "0.5rem",
    left: "0.5rem",
    zIndex: 2000,
    bgcolor: "#00000078",
    "&:hover": { bgcolor: "#000000" },
  }),
};

const iconIconStyles = (isXs) => ({ width: isXs ? "1.5rem" : "2rem", height: isXs ? "1.5rem" : "2rem", color: "#fff" });
const mediaStyles = { width: "100%", height: "100%", objectFit: "contain" };

export default MediaPreviewModal;
