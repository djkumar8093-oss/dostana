import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Dialog, DialogTitle, Stack, Box, Button, IconButton, Avatar, Badge, Tooltip, Divider, TextField, Skeleton, Select, MenuItem, FormControl, InputLabel, useMediaQuery } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloudUpload from "@mui/icons-material/CloudUpload";
import styled from "styled-components";
import { showAlert } from "../../reduxSlices/alertSlice";
import { useDispatch } from "react-redux";
import { useUserProfile } from "../../hooks/userProfile/userProfile";
import { useUpdateProfile } from "../../hooks/userProfile/userProfileUpdation";
import { openMediaDialog } from "../../reduxSlices/mediaPreviewSlice";

// A styled input to hide the default file input
const HiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1,
});

// Helper to format a date to yyyy-MM-dd format
const formatDate = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    console.error(`Invalid date: ${date}`);
    return "";
  }
  return d.toISOString().split("T")[0];
};

const dialogTitleStyle = {
  padding: 0,
  fontWeight: "bold",
  fontSize: { md: "1.2rem", xs: "1rem" },
};

const ProfileUpdationModal = ({ open, handleClose }) => {
  const dispatch = useDispatch();

  const isSmallScreen = useMediaQuery("(max-width:480px)");

  // Refs for form fields and file inputs
  const profileImageRef = useRef(null);
  const coverImageRef = useRef(null);
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const mobileNumberRef = useRef(null);
  const aboutMeRef = useRef(null);
  const genderRef = useRef(null);
  const dobRef = useRef(null);

  const isBelow600 = useMediaQuery("(max-width:600px)");

  // Assume useUserProfile returns { data, ... }.
  const { data: userProfile } = useUserProfile();
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();

  // Local states for file uploads and preview URLs
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  // Form data and error states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    aboutMe: "",
    gender: "other",
    dob: "",
  });
  const [errors, setErrors] = useState({});

  // When userProfile data is available, update the form.
  useEffect(() => {
    if (userProfile) {
      const { firstName, lastName, mobileNumber, about, profileImage, coverImage, gender, dob } = userProfile;
      setFormData({
        firstName: firstName || "",
        lastName: lastName || "",
        mobileNumber: mobileNumber || "",
        aboutMe: about || "",
        gender: gender || "other",
        dob: formatDate(dob || ""),
        profileImage: profileImage || null,
        coverImage: coverImage || null,
      });
    }
  }, [userProfile]);

  // Compute preview URL for profile image file when it changes.
  useEffect(() => {
    if (profileImageFile) {
      const url = URL.createObjectURL(profileImageFile);
      setProfilePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setProfilePreview(null);
    }
  }, [profileImageFile]);

  // Compute preview URL for cover image file when it changes.
  useEffect(() => {
    if (coverImageFile) {
      const url = URL.createObjectURL(coverImageFile);
      setCoverPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setCoverPreview(null);
    }
  }, [coverImageFile]);

  // File change handlers for profile and cover images
  const handleProfileImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) setProfileImageFile(file);
  }, []);

  const handleCoverImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) setCoverImageFile(file);
  }, []);

  // Generic change handler for form fields
  const handleChange = useCallback(
    (field) => (e) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    },
    []
  );

  // Remove image handler (for both profile and cover)
  const handleImageRemove = (type) => {
    const newFormData = new FormData();
    newFormData.append(type, true);

    updateProfile(newFormData);
  };

  const handleImagePreview = (url) => {
    if (!url) return;
    dispatch(openMediaDialog({ mediaSources: [{ url, type: "image" }], showDownload: true }));
  };

  // Field validation on blur
  const handleBlur = useCallback(
    (field, ref) => {
      const newErrors = { ...errors };
      switch (field) {
        case "firstName":
          if (!formData.firstName || !/^[A-Za-z\s]+$/.test(formData.firstName.trim()) || formData.firstName.trim().length < 3 || formData.firstName.trim().length > 15) {
            newErrors.firstName = "First Name must be 3-15 characters long and contain only letters and spaces";
            ref.current && ref.current.focus();
          } else {
            delete newErrors.firstName;
          }
          break;
        case "lastName":
          if (!formData.lastName || !/^[A-Za-z\s]+$/.test(formData.lastName.trim()) || formData.lastName.trim().length < 3 || formData.lastName.trim().length > 15) {
            newErrors.lastName = "Last Name must be 3-15 characters long and contain only letters and spaces";
            ref.current && ref.current.focus();
          } else {
            delete newErrors.lastName;
          }
          break;
        case "mobileNumber":
          if (formData.mobileNumber && !/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
            newErrors.mobileNumber = "Mobile number is not valid";
            ref.current && ref.current.focus();
          } else {
            delete newErrors.mobileNumber;
          }
          break;
        case "aboutMe":
          if (formData.aboutMe.length > 200) {
            newErrors.aboutMe = "About Me must not exceed 200 characters";
            ref.current && ref.current.focus();
          } else {
            delete newErrors.aboutMe;
          }
          break;
        case "gender":
          if (!formData.gender) {
            newErrors.gender = "Gender is required";
            ref.current && ref.current.focus();
          } else {
            delete newErrors.gender;
          }
          break;
        case "dob":
          if (!formData.dob) {
            newErrors.dob = "Date of birth is required";
            ref.current && ref.current.focus();
          } else {
            delete newErrors.dob;
          }
          break;
        default:
          break;
      }
      setErrors(newErrors);
    },
    [errors, formData]
  );

  // New logic: Determine if the form values are different from the database values
  const isFormChanged = useMemo(() => {
    if (!userProfile) return false;
    return (
      formData.firstName.trim() !== (userProfile.firstName || "").trim() ||
      formData.lastName.trim() !== (userProfile.lastName || "").trim() ||
      formData.mobileNumber.trim() !== (userProfile.mobileNumber || "").trim() ||
      formData.aboutMe.trim() !== (userProfile.about || "").trim() ||
      formData.gender !== userProfile.gender ||
      formData.dob !== formatDate(userProfile.dob) ||
      profileImageFile !== null ||
      coverImageFile !== null
    );
  }, [formData, userProfile, profileImageFile, coverImageFile]);

  // Validate all form fields before submission.
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.firstName || !/^[A-Za-z\s]+$/.test(formData.firstName.trim()) || formData.firstName.trim().length < 3 || formData.firstName.trim().length > 15) {
      newErrors.firstName = "First Name must be 3-15 characters long and contain only letters and spaces";
      firstNameRef.current && firstNameRef.current.focus();
    }

    if (!formData.lastName || !/^[A-Za-z\s]+$/.test(formData.lastName.trim()) || formData.lastName.trim().length < 3 || formData.lastName.trim().length > 15) {
      newErrors.lastName = "Last Name must be 3-15 characters long and contain only letters and spaces";
      lastNameRef.current && lastNameRef.current.focus();
    }

    if (formData.mobileNumber && !/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Mobile number is not valid";
      mobileNumberRef.current && mobileNumberRef.current.focus();
    }

    if (formData.aboutMe.length > 200) {
      newErrors.aboutMe = "About Me must not exceed 200 characters";
      aboutMeRef.current && aboutMeRef.current.focus();
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
      genderRef.current && genderRef.current.focus();
    }

    if (!formData.dob || new Date(formData.dob) > new Date() || new Date(formData.dob) < new Date("1930-01-01")) {
      newErrors.dob = !formData.dob ? "Date of birth is required" : "Date of birth is not valid";
      dobRef.current && dobRef.current.focus();
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Form submit handler
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (validateForm()) {
        dispatch(
          showAlert({
            message: "Updating profile...",
            type: "info",
            loading: true,
          })
        );

        const newFormData = new FormData();
        newFormData.append("firstName", formData.firstName);
        newFormData.append("lastName", formData.lastName);
        newFormData.append("mobileNumber", formData.mobileNumber);
        newFormData.append("about", formData.aboutMe);
        newFormData.append("gender", formData.gender);
        newFormData.append("dob", formData.dob);

        // Append file(s) if available
        if (profileImageFile) {
          newFormData.append("profileImage", profileImageFile);
        }
        if (coverImageFile) {
          newFormData.append("coverImage", coverImageFile);
        }

        console.log("FormData prepared for upload");
        updateProfile(newFormData);
      }
    },
    [formData, profileImageFile, coverImageFile, validateForm, dispatch, updateProfile]
  );

  return (
    <Dialog open={open} maxWidth="sm" fullWidth PaperProps={{ sx: { maxHeight: "75vh", overflow: "hidden" } }} onClose={handleClose} fullScreen={isBelow600}>
      <Box sx={{ overflowY: "auto", width: "100%" }}>
        <form onSubmit={handleSubmit}>
          {/* Profile Image Section */}
          <Stack paddingY={2} paddingX={3} gap={1}>
            <Stack justifyContent="space-between" direction="row" alignItems={"center"}>
              <DialogTitle sx={dialogTitleStyle} fontFamily="Roboto">
                Profile Picture
              </DialogTitle>
              <Button
                variant="text"
                sx={{ fontWeight: 600, color: "grey" }}
                onClick={() => handleImageRemove("removeProfileImage")}
                disabled={!userProfile?.profileImage || isUpdatingProfile}
                size="small"
              >
                Remove
              </Button>
            </Stack>
            <Stack alignItems="center">
              <Tooltip title={(userProfile?.profileImage || profilePreview) && "View Profile Picture"} onClick={() => handleImagePreview(profilePreview || userProfile?.profileImage)}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  badgeContent={
                    <Tooltip title="Upload">
                      <IconButton
                        sx={{
                          width: "2.2rem",
                          height: "2.2rem",
                          bgcolor: "#fff",
                          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.2)",
                          "&:hover": { bgcolor: "#fff" },
                        }}
                        onClick={() => {
                          profileImageRef.current && profileImageRef.current.click();
                        }}
                      >
                        <AddIcon />
                        <HiddenInput type="file" ref={profileImageRef} onChange={handleProfileImageChange} accept="image/*" />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <Avatar
                    alt="Profile Picture"
                    src={profilePreview || userProfile?.profileImage}
                    sx={{
                      width: "10rem",
                      height: "10rem",
                      cursor: "pointer",
                    }}
                  />
                </Badge>
              </Tooltip>
            </Stack>
          </Stack>
          <Divider />
          {/* Cover Image Section */}
          <Stack padding={2} paddingX={3} gap={1}>
            <Stack justifyContent="space-between" direction="row" alignItems={"center"}>
              <DialogTitle sx={dialogTitleStyle} fontFamily="Roboto">
                Cover Photo
              </DialogTitle>
              <Button variant="text" sx={{ fontWeight: 600, color: "grey" }} onClick={() => handleImageRemove("removeCoverImage")} disabled={!userProfile?.coverImage || isUpdatingProfile}>
                Remove
              </Button>
            </Stack>
            <Stack position="relative" alignItems="center" justifyContent="center">
              {coverPreview || userProfile?.coverImage ? (
                <Tooltip title={coverPreview || (userProfile?.coverImage && "View Cover Image")} onClick={() => handleImagePreview(coverPreview || userProfile?.coverImage)}>
                  <img
                    src={coverPreview || userProfile?.coverImage}
                    alt="Cover Preview"
                    style={{
                      width: "100%",
                      height: "14rem",
                      objectFit: "cover",
                    }}
                  />
                </Tooltip>
              ) : (
                <Skeleton variant="rounded" width="100%" height="14rem" animation="wave" />
              )}
              <Tooltip title="Upload">
                <IconButton
                  sx={{
                    position: "absolute",
                    bottom: ".6rem",
                    right: ".6rem",
                    fontSize: ".8rem",
                    fontWeight: 600,
                    backgroundColor: "white",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                    },
                    borderRadius: "50%",
                  }}
                  onClick={() => coverImageRef.current && coverImageRef.current.click()}
                >
                  <CloudUpload />
                  <HiddenInput type="file" ref={coverImageRef} onChange={handleCoverImageChange} accept="image/*" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
          <Divider />
          {/* Name Section */}
          <Stack padding={2} paddingX={3}>
            <Stack gap={2}>
              <TextField
                label="First Name"
                variant="standard"
                value={formData.firstName}
                onChange={handleChange("firstName")}
                onBlur={() => handleBlur("firstName", firstNameRef)}
                error={!!errors.firstName}
                helperText={errors.firstName}
                inputRef={firstNameRef}
              />
              <TextField
                label="Last Name"
                variant="standard"
                value={formData.lastName}
                onChange={handleChange("lastName")}
                onBlur={() => handleBlur("lastName", lastNameRef)}
                error={!!errors.lastName}
                helperText={errors.lastName}
                inputRef={lastNameRef}
              />
            </Stack>
          </Stack>
          <Divider />
          {/* Mobile Number Section */}
          <Stack padding={2} paddingX={3}>
            <TextField
              label="Mobile Number"
              variant="standard"
              value={formData.mobileNumber}
              onChange={handleChange("mobileNumber")}
              onBlur={() => handleBlur("mobileNumber", mobileNumberRef)}
              error={!!errors.mobileNumber}
              helperText={errors.mobileNumber}
              inputRef={mobileNumberRef}
            />
          </Stack>
          <Divider />
          {/* Gender Section */}
          <Stack padding={2} paddingX={3}>
            <FormControl fullWidth variant="standard">
              <InputLabel>Gender</InputLabel>
              <Select label="Gender" value={formData.gender} onChange={handleChange("gender")} onBlur={() => handleBlur("gender", genderRef)} error={!!errors.gender} inputRef={genderRef}>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Divider />
          {/* Date of Birth Section */}
          <Stack padding={2} paddingX={3}>
            <TextField
              type="date"
              variant="standard"
              label="Date of Birth"
              value={formData.dob}
              onChange={handleChange("dob")}
              onBlur={() => handleBlur("dob", dobRef)}
              error={!!errors.dob}
              helperText={errors.dob}
              inputRef={dobRef}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Stack>
          <Stack direction={isSmallScreen ? "column" : "row"} padding={3} gap={2}>
            <Button variant="outlined" fullWidth onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="contained" type="submit" fullWidth sx={{ fontWeight: 600 }} disabled={isUpdatingProfile || !isFormChanged}>
              Update profile
            </Button>
          </Stack>
        </form>
      </Box>
    </Dialog>
  );
};

export default ProfileUpdationModal;
