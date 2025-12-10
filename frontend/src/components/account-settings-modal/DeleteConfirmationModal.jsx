/* eslint-disable react/prop-types */
import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, Stack, Button, Box, Typography, useMediaQuery } from "@mui/material";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showAlert } from "../../reduxSlices/alertSlice";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteAccount } from "../../hooks/auth/accountDeletion";

const DeleteConfirmationModal = ({ open, handleClose, formData }) => {
  const queryClient = useQueryClient();
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const recaptchaRef = useRef(null); // Ref for the ReCAPTCHA
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isSmallScreen = useMediaQuery("(max-width:420px)");
  const isMobile = useMediaQuery("(max-width:600px)");

  const { mutate: deleteAccount, isPending: isDeletingAccount } = useDeleteAccount();

  const handleCaptchaChange = (value) => {
    setIsCaptchaVerified(!!value);
  };

  const resetCaptcha = () => {
    setIsCaptchaVerified(false); // Reset local state
    if (recaptchaRef.current) {
      recaptchaRef.current.reset(); // Reset the reCAPTCHA
    }
  };

  const onDeleteAccount = () => {
    deleteAccount(
      { ...formData, isAccountDelete: true, recaptchaToken: import.meta.env.VITE_RECAPTCHA_TOKEN },
      {
        onSuccess: () => {
          dispatch(showAlert({ message: "Account deleted successfully!", type: "success", loading: false }));
          navigate("/login"); // Navigate to login on success
          queryClient.removeQueries();
        },
        onMutate: () => {
          dispatch(showAlert({ message: "Deleting account...", type: "info", loading: true }));
        },
        onError: (error) => {
          console.error(error);
          const errorMessage = error.response?.data?.message || "Failed to delete account. Please try again.";
          dispatch(showAlert({ message: errorMessage, type: "error", loading: false }));
          resetCaptcha(); // Reset the reCAPTCHA on error
        },
        onSettled: () => {
          setIsCaptchaVerified(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <Box>
        <DialogTitle textAlign="center" sx={{ fontWeight: "bold", fontSize: { sm: "1.3rem", xs: "1.1rem" } }}>
          Delete Account
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete your account? This action cannot be undone, and your profile will be permanently deleted.
          </Typography>

          {/* Google reCAPTCHA */}
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_RECAPTCHA_TOKEN} // Replace with your actual reCAPTCHA site key
            onChange={handleCaptchaChange}
            ref={recaptchaRef} // Assigning ref to access reset method
          />

          {/* Buttons */}
          <Stack flexDirection={isSmallScreen ? "column" : "row"} marginTop={isSmallScreen ? 4 : 3} gap={2}>
            <Button variant="outlined" onClick={handleClose} fullWidth size={isMobile ? "small" : "medium"}>
              Cancel
            </Button>
            <Button
              variant="contained"
              fullWidth
              color="warning"
              disabled={!isCaptchaVerified || isDeletingAccount}
              onClick={onDeleteAccount}
              sx={{ fontWeight: 600 }}
              size={isMobile ? "small" : "medium"}
            >
              Delete Account
            </Button>
          </Stack>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default DeleteConfirmationModal;
