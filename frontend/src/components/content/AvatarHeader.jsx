import { Avatar, Box, IconButton, Stack, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export const AvatarHeader = ({ contentOwner, onClose }) => {
  const navigate = useNavigate();
  const isBelow600 = useMediaQuery("(max-width: 600px)");
  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        left: 0,
        backgroundColor: "#fff",
        zIndex: 10,
        transform: { xs: "translateX(-.6rem)", sm: { translateX: 0 } },
      }}
    >
      <Stack direction="row" alignItems="center">
        <AnimatePresence>
          {isBelow600 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <Tooltip title="Close">
                <IconButton onClick={onClose}>
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
        <Tooltip title="Visit Profile">
          <IconButton onClick={() => navigate(`/user-profile/${contentOwner._id}`)}>
            <Avatar
              src={contentOwner?.profileImage || ""}
              sx={{
                height: { sm: "2.8rem", xs: "2.6rem" },
                width: { sm: "2.8rem", xs: "2.6rem" },
                cursor: "pointer",
                boxShadow: 3,
              }}
            />
          </IconButton>
        </Tooltip>
        <Typography variant="body1" fontWeight="bold" color="#000000d1" sx={{ fontSize: { sm: "1rem", xs: ".9rem" } }}>
          {contentOwner?.firstName} {contentOwner?.lastName}
        </Typography>
      </Stack>
    </Box>
  );
};
