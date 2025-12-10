/* eslint-disable react/prop-types */
import React from "react";
import { motion } from "framer-motion";
import { Box, IconButton, Stack, Tooltip, Typography, CircularProgress } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Check, ErrorOutline } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";

const SendingMessages = ({ message, onRetry, onRemove }) => {
  return (
    <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} transition={{ duration: 0.3 }}>
      <Box
        sx={{
          bgcolor: "background.paper",
          p: 1.5,
          borderRadius: 2,
          boxShadow: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          width: "fit-content", // Allow dynamic width based on content
          maxWidth: "100%", // Prevent exceeding 70% of the container
          minWidth: "30%", // Ensure it doesn't shrink too much
          mb: 1,
        }}
      >
        {message?.mediaPreviews?.length > 0 && <img src={message.mediaPreviews[0]} alt="Media preview" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />}
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            wordBreak: "break-word",
            overflowWrap: "break-word",
            whiteSpace: "pre-wrap", // Ensures long text breaks properly
          }}
        >
          {message?.text || (message?.mediaPreviews?.length ? "Sending files..." : "Sending...")}
        </Typography>

        {message?.status === "sending" && <CircularProgress size={20} />}
        {message?.status === "sent" && <Check fontSize="small" color="success" />}
        {message?.status === "failed" && (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <ErrorOutline fontSize="small" color="error" />
            <Tooltip title="Retry">
              <IconButton onClick={() => onRetry(message)} size="small">
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remove">
              <IconButton onClick={() => onRemove(message)} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Box>
    </motion.div>
  );
};

export default SendingMessages;
