/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { Avatar, Divider, Menu, MenuItem, Typography, Box, CircularProgress, useMediaQuery } from "@mui/material";
import { Logout, Settings, Security } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyIcon from "@mui/icons-material/Key";
import ProfileUpdationModal from "../../components/profile-update/ProfileUpdationModal";
import ChangePasswordModal from "../../components/account-settings-modal/ChangePasswordModal";
// Use the refactored DeleteAccountModal that now accepts an onVerified prop.
import DeleteAccountModal from "../../components/account-settings-modal/DeleteAccountModal";
import DeleteConfirmationModal from "../../components/account-settings-modal/DeleteConfirmationModal";
import { useLogout } from "../../hooks/auth/logout";
import { useUserProfile } from "../../hooks/userProfile/userProfile";

// Styling constants
const MENU_ITEM_PADDING = { paddingTop: "0.7rem", paddingBottom: "0.7rem" };

const AccountMenu = ({ anchorEl, open, handleCloseMenu }) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  // Optionally store verified form data if needed by the confirmation modal.
  const [verifiedFormData, setVerifiedFormData] = useState(null);

  const isMobileScreen = useMediaQuery("(max-width:600px)");

  const { mutate: logoutUser, isPending: isLoggingOut } = useLogout();
  const { data: userProfile } = useUserProfile();

  const closeProfileForm = () => setIsProfileFormOpen(false);
  const closeChangePassword = () => setIsChangePasswordOpen(false);
  const closeDeleteAccount = () => setIsDeleteAccountOpen(false);
  const closeConfirmationModal = () => setIsConfirmationModalOpen(false);
  const closeMenu = () => {
    setIsSubmenuOpen(false);
    handleCloseMenu();
  };

  const handleLogout = () => logoutUser();

  // When password verification is successful, this callback is triggered.
  const handleDeleteAccountVerified = (formData) => {
    setVerifiedFormData(formData);
    setIsDeleteAccountOpen(false);
    setIsConfirmationModalOpen(true);
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={closeMenu}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              minWidth: "16rem",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              overflow: "visible",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* Update Profile */}
        <MenuItem sx={MENU_ITEM_PADDING} onClick={() => setIsProfileFormOpen(true)}>
          <Avatar sx={{ mr: 1, boxShadow: 3 }} src={userProfile?.profileImage || ""} />
          <Typography variant="body2" fontWeight="bold">
            Update Profile
          </Typography>
        </MenuItem>
        <Divider />

        {/* Privacy Settings with Submenu */}
        <MenuItem sx={{ ...MENU_ITEM_PADDING, alignItems: "center" }} onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}>
          <Settings fontSize="small" sx={{ mr: 1 }} />
          Privacy Settings
          <Box sx={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
            <motion.div animate={{ rotate: isSubmenuOpen ? 90 : 0 }} transition={{ duration: 0.1, ease: "easeInOut" }} style={{ display: "flex", alignItems: "center" }}>
              <KeyboardArrowRightIcon fontSize="small" />
            </motion.div>
          </Box>
        </MenuItem>

        <AnimatePresence>
          {isSubmenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.1 }}>
              <MenuItem sx={{ ...MENU_ITEM_PADDING, paddingLeft: "1.6rem" }} onClick={() => (userProfile?.isGoogleAccount ? setIsConfirmationModalOpen(true) : setIsDeleteAccountOpen(true))}>
                <Security fontSize="small" sx={{ mr: 1 }} />
                Delete Account
              </MenuItem>
              {!userProfile?.isGoogleAccount && (
                <MenuItem sx={{ ...MENU_ITEM_PADDING, paddingLeft: "1.6rem" }} onClick={() => setIsChangePasswordOpen(true)}>
                  <KeyIcon fontSize="small" sx={{ mr: 1, rotate: "90deg" }} />
                  Change Password
                </MenuItem>
              )}
              <Divider />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout */}
        <MenuItem sx={MENU_ITEM_PADDING} onClick={handleLogout}>
          {isLoggingOut ? <CircularProgress size={16} sx={{ mr: 1 }} /> : <Logout fontSize="small" sx={{ mr: 1 }} />}
          Logout
        </MenuItem>
      </Menu>

      {/* Modals */}
      {isProfileFormOpen && <ProfileUpdationModal open={isProfileFormOpen} handleClose={closeProfileForm} />}
      {isChangePasswordOpen && <ChangePasswordModal open={isChangePasswordOpen} handleClose={closeChangePassword} />}
      {isDeleteAccountOpen && <DeleteAccountModal open={isDeleteAccountOpen} handleClose={closeDeleteAccount} onVerified={handleDeleteAccountVerified} />}
      {isConfirmationModalOpen && <DeleteConfirmationModal open={isConfirmationModalOpen} handleClose={closeConfirmationModal} formData={verifiedFormData} />}
    </>
  );
};

export default AccountMenu;
