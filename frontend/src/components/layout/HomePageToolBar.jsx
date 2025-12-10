import { Avatar, IconButton, Skeleton, Stack, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import SearchPeople from "../common/PeopleSearch";
import PostCreator from "../post/PostCreationModal";
import { galleryIcon, thinkingIcon, tweetIcon } from "../../assets";
import { useUserProfile } from "../../hooks/userProfile/userProfile";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ThoughtCreationModal from "../post/ThoughtCreationModal";

const TOOLTIP_OFFSET = {
  popper: {
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, -14], // Ensure this is always a valid array of numbers
        },
      },
    ],
  },
};

const HomePageToolBar = ({ setFirstPostOpenModal, firstPostOpenModal }) => {
  const [openPostModal, setOpenPostModal] = useState(false);
  const [openThoughtModal, setOpenThoughtModal] = useState(false);
  // This state will be updated by PeopleSearch via onActiveChange
  const [searchActive, setSearchActive] = useState(false);
  const navigate = useNavigate();

  const { data: userProfile } = useUserProfile();
  const theme = useTheme();
  // Media query for screens smaller than 500px
  const isBelow500 = useMediaQuery("(max-width:500px)");
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (firstPostOpenModal) {
      setOpenPostModal(true);
    }
  }, [firstPostOpenModal]);

  const handleCloseThoughtModal = () => {
    setOpenThoughtModal(false);
  };

  const handleClosePostModal = () => {
    setOpenPostModal(false);
    setFirstPostOpenModal(false);
  };

  const truncateName = (name) => {
    return name.length > 20 && isSmallScreen ? `${name.slice(0, 16)}...` : name;
  };

  // Determine avatar visibility:
  // On screens below 500px, hide the avatar if the search is active.
  const avatarVisible = !(isBelow500 && searchActive);

  return (
    <Stack
      sx={{
        position: "sticky",
        top: 0,
        left: 0,
        pt: "1rem",
        zIndex: 100,
        alignItems: "center",
        width: "100%",
      }}
    >
      <Stack
        sx={{
          bgcolor: "#fff",
          boxShadow: 3,
          width: { md: "50rem", xs: "98%" },
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
          paddingX: { xs: ".3rem", md: "1rem" },
          paddingY: "0.8rem",
          gap: isSmallScreen ? 0 : 3,
        }}
      >
        {/* User Profile Section */}
        <Stack flexDirection="row" alignItems="center">
          {avatarVisible && (
            <motion.div
              initial={{ opacity: 1, x: 0 }}
              animate={{
                opacity: avatarVisible ? 1 : 0,
                x: avatarVisible ? 0 : -50,
                transition: { duration: 0.3 },
              }}
            >
              <Tooltip title="Visit Profile" slotProps={TOOLTIP_OFFSET}>
                <IconButton
                  sx={{ height: { xs: "2.8rem", sm: "3.2rem" }, width: { xs: "2.8rem", sm: "3.2rem" }, mr: isSmallScreen ? 3 : 0 }}
                  onClick={() => {
                    navigate("/profile");
                  }}
                >
                  <Avatar src={userProfile?.profileImage || ""} sx={{ boxShadow: 3 }} />
                </IconButton>
              </Tooltip>
            </motion.div>
          )}
          {!userProfile?.firstName ? (
            <Skeleton variant="text" width={100} height={24} />
          ) : (
            !isSmallScreen && (
              <Typography
                variant="body1"
                fontWeight="bold"
                color="#000000d1"
                sx={{
                  maxWidth: "10rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  wordWrap: "break-word",
                }}
              >
                {truncateName(`${userProfile?.firstName} ${userProfile?.lastName}`)}
              </Typography>
            )
          )}
        </Stack>

        {/* Action Buttons Section */}
        <Stack flexDirection="row" alignItems="center" gap={1} flex={1} justifyContent="flex-end">
          {/* Pass down onActiveChange callback to update searchActive */}
          <SearchPeople onActiveChange={setSearchActive} />
          <Tooltip title="Create Post" slotProps={TOOLTIP_OFFSET}>
            <IconButton sx={{ height: { xs: "2.8rem", sm: "3.2rem" }, width: { xs: "2.8rem", sm: "3.2rem" } }} onClick={() => setOpenPostModal(true)}>
              <Avatar src={galleryIcon} alt="Create Post" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Your Thought" slotProps={TOOLTIP_OFFSET}>
            <IconButton sx={{ height: { xs: "2.8rem", sm: "3.2rem" }, width: { xs: "2.8rem", sm: "3.2rem" } }} onClick={() => setOpenThoughtModal(true)}>
              <Avatar src={thinkingIcon} alt="Your Thought" />
            </IconButton>
          </Tooltip>
        </Stack>

        {openPostModal && <PostCreator open={openPostModal} handleClose={handleClosePostModal} />}
        {openThoughtModal && <ThoughtCreationModal open={openThoughtModal} handleClose={handleCloseThoughtModal} />}
      </Stack>
    </Stack>
  );
};

export default HomePageToolBar;
