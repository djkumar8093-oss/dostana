import React, { useState, useRef } from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, InputAdornment, IconButton, Stack, TextField, useMediaQuery } from "@mui/material";
import KeyIcon from "@mui/icons-material/Key";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useChangePassword } from "../../hooks/auth/password";

const ChangePasswordModal = ({ open, handleClose }) => {
  const oldPasswordRef = useRef(); // Ref for the oldPassword field

  const isSmallScreen = useMediaQuery("(max-width:420px)");
  const isMobile = useMediaQuery("(max-width:600px)");

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({ oldPassword: false, newPassword: false });

  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error on key stroke for the current field
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleTogglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validate = () => {
    let formErrors = {};
    if (!formData.oldPassword) formErrors.oldPassword = "Old password is required.";
    if (!formData.newPassword) formErrors.newPassword = "New password is required.";
    if (formData.newPassword && formData.newPassword.length < 8) formErrors.newPassword = "Password must be at least 8 characters.";
    if (formData.newPassword && !/[a-zA-Z]/.test(formData.newPassword)) formErrors.newPassword = "Password must include both letters and numbers.";
    if (formData.newPassword && !/\d/.test(formData.newPassword)) formErrors.newPassword = "Password must include both letters and numbers.";

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Call the actual API via the mutation
    changePassword(formData, {
      onSuccess: () => {
        setFormData({ oldPassword: "", newPassword: "" }); // Reset form fields
        handleClose(); // Close the dialog
      },
      onError: (error) => {
        if (error.response?.status === 401) {
          setErrors({ oldPassword: "Incorrect password." });
          oldPasswordRef.current?.focus(); // Focus the old password field
        }
      },
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <Box>
        <DialogTitle sx={{ fontWeight: "bold", fontFamily: "Poppins", fontSize: { sm: "1.3rem", xs: "1rem" } }} textAlign={"center"}>
          Change Password
        </DialogTitle>
        <DialogContent>
          <form onSubmit={onSubmit}>
            <Stack spacing={2}>
              {/* Old Password Field */}
              <TextField
                label="Old Password"
                variant="standard"
                fullWidth
                type={showPasswords.oldPassword ? "text" : "password"}
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                onBlur={() => setErrors((prev) => ({ ...prev, oldPassword: "" }))}
                error={!!errors.oldPassword}
                helperText={errors.oldPassword}
                inputRef={oldPasswordRef} // Assign ref
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => handleTogglePasswordVisibility("oldPassword")} edge="end">
                          {showPasswords.oldPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* New Password Field */}
              <TextField
                label="New Password"
                variant="standard"
                fullWidth
                type={showPasswords.newPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                error={!!errors.newPassword}
                helperText={errors.newPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => handleTogglePasswordVisibility("newPassword")} edge="end">
                        {showPasswords.newPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            {/* Buttons */}
            <Stack flexDirection={isSmallScreen ? "column" : "row"} marginTop={isSmallScreen ? 4 : 3} gap={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setFormData({ oldPassword: "", newPassword: "" });
                  setErrors({});
                  handleClose();
                }}
                size={isMobile ? "small" : "medium"}
              >
                Cancel
              </Button>
              <Button type="submit" variant="contained" fullWidth sx={{ fontWeight: "bold" }} disabled={isChangingPassword} size={isMobile ? "small" : "medium"}>
                Change Password
              </Button>
            </Stack>
          </form>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default ChangePasswordModal;
