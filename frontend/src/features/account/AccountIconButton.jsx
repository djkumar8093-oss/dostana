import React, { useState } from "react";
import { Avatar, Box, IconButton, Tooltip, useMediaQuery } from "@mui/material";
import AccountMenu from "./AccountMenu";
import { useUserProfile } from "../../hooks/userProfile/userProfile";

const AccountIconButton = () => {
  const [accountMenuAnchorEl, setAccountMenuAnchorEl] = useState(null);
  const isAccountMenuOpen = Boolean(accountMenuAnchorEl);
  const isBelow400 = useMediaQuery("(max-width:400px)");

  const { data: userProfile } = useUserProfile();
  const handleAccountMenuClick = (event) => {
    setAccountMenuAnchorEl(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchorEl(null);
  };

  // Determine Avatar source
  return (
    <>
      <Box>
        <Tooltip title="Account">
          <IconButton onClick={handleAccountMenuClick}>
            <Avatar
              sx={{
                cursor: "pointer",
                boxShadow: 3,
                height: isBelow400 ? "2rem" : { md: "2.8rem", xs: "2.3rem", sm: "2.3rem" },
                width: isBelow400 ? "2rem" : { md: "2.8rem", xs: "2.3rem", sm: "2.3rem" },
              }}
              src={userProfile?.profileImage || ""}
            />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Account Menu */}
      {isAccountMenuOpen && <AccountMenu anchorEl={accountMenuAnchorEl} open={isAccountMenuOpen} handleCloseMenu={handleAccountMenuClose} />}
    </>
  );
};

export default AccountIconButton;
