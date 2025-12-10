import { useEffect, useRef } from "react";
import { ArrowRightAlt, CloudUpload } from "@mui/icons-material";
import { Avatar, Badge, Button, DialogTitle, DialogContent, DialogActions, Divider, IconButton, Skeleton, Stack, Tooltip, Typography, Box, useMediaQuery } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import styled from "styled-components";
import { useUserProfile } from "../../hooks/userProfile/userProfile";

const HiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1,
});

// eslint-disable-next-line react/prop-types
const ProfileImageStep = ({ coverImage, profileImage, updateCoverImage, updateProfileImage, setCurrentStep }) => {
  const profileImageRef = useRef(null);
  const coverImageRef = useRef(null);
  const { data: userProfile } = useUserProfile();

  const isBelow380 = useMediaQuery("(max-width:380px)");

  const handleFileChange = (setter) => (e) => {
    const file = e.target.files[0];
    if (file) setter(file);
  };

  const handleNext = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const getPreviewUrl = (file, fallback) => (file ? URL.createObjectURL(file) : fallback);

  useEffect(() => {
    return () => {
      if (profileImage) URL.revokeObjectURL(profileImage);
      if (coverImage) URL.revokeObjectURL(coverImage);
    };
  }, [profileImage, coverImage]);

  return (
    <>
      <DialogContent sx={{ px: { md: "1rem", sm: ".6rem", xs: ".2rem" } }}>
        <Stack gap={2}>
          {/* Profile Picture Section */}
          <Stack spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", fontSize: { md: "1.2rem", sm: "1rem", xs: ".9rem" } }}>
              Profile Picture
            </Typography>
            <Stack alignItems="center">
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <IconButton
                    sx={{
                      width: "2.2rem",
                      height: "2.2rem",
                      bgcolor: "#fff",
                      boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.2)",
                      "&:hover": { bgcolor: "#fff" },
                    }}
                    onClick={() => profileImageRef.current.click()}
                  >
                    <AddIcon />
                    <HiddenInput type="file" ref={profileImageRef} onChange={handleFileChange(updateProfileImage)} accept="image/*" />
                  </IconButton>
                }
              >
                <Avatar src={getPreviewUrl(profileImage, userProfile?.profileImage)} sx={{ width: { md: "12rem", sm: "10rem", xs: "8rem" }, height: { md: "12rem", sm: "10rem", xs: "8rem" } }} />
              </Badge>
            </Stack>
          </Stack>

          <Divider sx={{ py: ".2rem" }} />

          {/* Cover Picture Section */}
          <Stack spacing={1} py={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", fontSize: { md: "1.2rem", sm: "1rem", xs: ".9rem" } }}>
              Cover Picture
            </Typography>
            <Stack alignItems="center">
              <Stack position="relative" width={"90%"}>
                {getPreviewUrl(coverImage, null) ? (
                  <Box component={"img"} src={getPreviewUrl(coverImage, null)} alt="Cover Preview" sx={{ width: "100%", height: { md: "14rem", sm: "12rem", xs: "8rem" }, objectFit: "cover" }} />
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
                    }}
                    onClick={() => coverImageRef.current.click()}
                  >
                    <CloudUpload />
                    <HiddenInput type="file" ref={coverImageRef} onChange={handleFileChange(updateCoverImage)} accept="image/*" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ justifyContent: "space-between", py: "1rem", flexDirection: isBelow380 ? "column" : "row", gap: isBelow380 ? ".4rem" : "0" }}>
        <Button variant="outlined" onClick={() => setCurrentStep((prevStep) => prevStep + 1)} sx={{ fontWeight: 600 }} fullWidth={isBelow380}>
          Skip for Now
        </Button>
        <Button variant="contained" endIcon={<ArrowRightAlt />} onClick={handleNext} sx={{ fontWeight: 600, transform: `translateX(${isBelow380 ? "-.2rem" : "0"})` }} fullWidth={isBelow380}>
          Next
        </Button>
      </DialogActions>
    </>
  );
};

export default ProfileImageStep;
