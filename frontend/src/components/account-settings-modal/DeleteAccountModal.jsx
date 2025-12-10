import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, Stack, TextField, Button, Box, IconButton, InputAdornment, useMediaQuery } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { showAlert } from "../../reduxSlices/alertSlice";
import { useDeleteAccount } from "../../hooks/auth/accountDeletion";

const DeleteAccountModal = ({ open, handleClose, onVerified }) => {
  const dispatch = useDispatch();
  const passwordRef = useRef(null);

  const isSmallScreen = useMediaQuery("(max-width:420px)");
  const isMobile = useMediaQuery("(max-width:600px)");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate: checkingAccountOwnership, isPending: confirmingAccountOwnership } = useDeleteAccount();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // This function updates the error state for a given field.
  const validateField = (field) => {
    let fieldError = "";
    if (field === "password" && !formData.password) {
      fieldError = "Password is required.";
    }
    if (field === "confirmPassword") {
      if (!formData.confirmPassword) {
        fieldError = "Confirm Password is required.";
      } else if (formData.confirmPassword !== formData.password) {
        fieldError = "Passwords do not match.";
      }
    }
    setErrors((prev) => ({
      ...prev,
      [field]: fieldError,
    }));
  };

  // Call this function on blur or on submit to update errors.
  const validateFields = () => {
    validateField("password");
    validateField("confirmPassword");
    return formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  };

  // This function only checks if the form data is valid without updating state.
  const isFormValid = () => {
    return formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  };

  const handleBlur = (e) => {
    validateField(e.target.name);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validateFields()) return;
    checkingAccountOwnership(formData, {
      onSuccess: () => {
        dispatch(showAlert({ message: "Password verified.", type: "success" }));
        onVerified(formData);
        setFormData({ password: "", confirmPassword: "" });
      },
      onMutate: () => {
        dispatch(showAlert({ message: "Verifying password...", type: "info", loading: true }));
      },
      onError: (err) => {
        console.error(err);
        let msg = "Something went wrong. Please try again.";
        if (err.response?.status === 401) {
          setErrors((prev) => ({
            ...prev,
            password: "Unauthorized. Please check your password.",
          }));
          passwordRef.current?.focus();
          msg = "Unauthorized. Please check your password.";
        }
        dispatch(showAlert({ message: msg, type: "error" }));
      },
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <Box>
        <DialogTitle textAlign="center" sx={{ fontWeight: "bold", fontFamily: "Poppins", fontSize: { sm: "1.3rem", xs: "1.1rem" } }}>
          Delete Account
        </DialogTitle>
        <DialogContent>
          <form onSubmit={onSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Password"
                variant="standard"
                fullWidth
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.password}
                helperText={errors.password}
                inputRef={passwordRef}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((prev) => !prev)} onMouseDown={(e) => e.preventDefault()}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Confirm Password"
                variant="standard"
                fullWidth
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword((prev) => !prev)} onMouseDown={(e) => e.preventDefault()}>
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
            <Stack flexDirection={isSmallScreen ? "column" : "row"} marginTop={isSmallScreen ? 4 : 3} gap={2}>
              <Button
                variant="outlined"
                onClick={() => {
                  handleClose();
                  setFormData({ password: "", confirmPassword: "" });
                }}
                fullWidth
                size={isMobile ? "small" : "medium"}
              >
                Cancel
              </Button>
              <Button type="submit" variant="contained" fullWidth sx={{ fontWeight: 600 }} disabled={!isFormValid() || confirmingAccountOwnership} size={isMobile ? "small" : "medium"}>
                verify password
              </Button>
            </Stack>
          </form>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default DeleteAccountModal;
