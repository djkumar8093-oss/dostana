// ContentStack.jsx
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, IconButton, Typography, Alert, Stack } from "@mui/material";
import Lottie from "lottie-react";
import ReplayIcon from "@mui/icons-material/Replay";
import CloseIcon from "@mui/icons-material/Close";
import { alertError, alertSpinner, alertSuccess } from "../../animation";
import useContentStack from "../../contextProvider/useContentStack";

const Content = ({ content }) => {
  const { id, files = [], text, status, retryAction } = content;
  const { removeContent, updateContent } = useContentStack();

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        removeContent(id);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, id, removeContent]);

  const handleRetry = () => {
    if (retryAction) {
      retryAction();
      updateContent(id, { status: "loading" });
    }
  };

  const handleRemove = () => {
    removeContent(id);
  };

  const renderIcon = () => {
    if (status === "loading") {
      return <Lottie animationData={alertSpinner} style={{ height: "1.8rem", width: "1.8rem" }} autoplay loop />;
    }
    if (status === "error") {
      return <Lottie animationData={alertError} style={{ height: "1.8rem", width: "1.8rem" }} autoplay loop={false} />;
    }
    if (status === "success") {
      return <Lottie animationData={alertSuccess} style={{ height: "1.8rem", width: "1.8rem" }} autoplay loop={false} />;
    }
    return null;
  };

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} layout>
      <Alert
        severity={status === "error" ? "error" : status === "success" ? "success" : "info"}
        sx={{
          display: "flex",
          alignItems: "center",
          minWidth: "20rem",
          maxWidth: "100%",
        }}
        icon={renderIcon()}
        action={
          status !== "loading" && (
            <>
              {status === "error" && (
                <IconButton size="small" aria-label="retry" color="inherit" onClick={handleRetry}>
                  <ReplayIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton size="small" aria-label="close" color="inherit" onClick={handleRemove}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </>
          )
        }
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          {/* Render file previews */}
          <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
            {files.map((fileObj, index) => {
              const { type, previewURL } = fileObj;
              return (
                <Box key={index} sx={{ width: 60, height: 60 }}>
                  {type === "image" ? (
                    <Box
                      component="img"
                      src={previewURL}
                      alt={`preview-${index}`}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                  ) : (
                    <Box
                      component="video"
                      src={previewURL}
                      alt={`video-cover-${index}`}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                      controls={false}
                      autoPlay={false}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
          <Typography sx={{ fontWeight: 400 }}>{text}</Typography>
        </Stack>
      </Alert>
    </motion.div>
  );
};

const ContentStack = () => {
  const { contentList } = useContentStack();

  return (
    <Box
      sx={{
        position: "fixed",
        maxHeight: "40vh",
        overflowX: "hidden",
        overflowY: "auto",
        zIndex: 9999,
        maxWidth: "80%",
        bottom: "1rem",
        right: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: ".8rem",
      }}
    >
      <AnimatePresence>
        {contentList.map((content) => (
          <Content key={content.id} content={content} />
        ))}
      </AnimatePresence>
    </Box>
  );
};

export default ContentStack;
