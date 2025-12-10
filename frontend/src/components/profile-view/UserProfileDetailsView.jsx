import React, { useEffect, useState } from "react";
import { Button, Card, Divider, Stack, TextField, Typography, Box, Chip, Tooltip, useMediaQuery } from "@mui/material";
import Lottie from "lottie-react";
import { avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8, hobbiesAnimation } from "../../animation";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  SportsSoccer as SportsSoccerIcon,
  MusicNote as MusicNoteIcon,
  Book as BookIcon,
  TravelExplore as TravelExploreIcon,
  Code as CodeIcon,
  FitnessCenter as FitnessCenterIcon,
  NaturePeople as NaturePeopleIcon,
  Brush as BrushIcon,
  CameraAlt as CameraAltIcon,
  Create as CreateIcon,
  SportsEsports as SportsEsportsIcon,
  RestaurantMenu as RestaurantMenuIcon,
  SelfImprovement as SelfImprovementIcon,
  EmojiPeople as EmojiPeopleIcon,
  Handyman as HandymanIcon,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useGetUserProfileById, useUserProfile } from "../../hooks/userProfile/userProfile";
import { useUpdateProfile } from "../../hooks/userProfile/userProfileUpdation";
import UserProfileDetailsViewSkeleton from "../skeletons/UserProfileDetailsViewSkeleton";
import AvatarChoice from "../utils/AvatarChoice"; // Assuming this is a separate component

const AVATARS = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8];

const HOBBIES = [
  { label: "Sports", icon: <SportsSoccerIcon /> },
  { label: "Music", icon: <MusicNoteIcon /> },
  { label: "Reading", icon: <BookIcon /> },
  { label: "Traveling", icon: <TravelExploreIcon /> },
  { label: "Coding", icon: <CodeIcon /> },
  { label: "Fitness", icon: <FitnessCenterIcon /> },
  { label: "Gardening", icon: <NaturePeopleIcon /> },
  { label: "Painting", icon: <BrushIcon /> },
  { label: "Photography", icon: <CameraAltIcon /> },
  { label: "Writing", icon: <CreateIcon /> },
  { label: "Gaming", icon: <SportsEsportsIcon /> },
  { label: "Cooking", icon: <RestaurantMenuIcon /> },
  { label: "Meditation", icon: <SelfImprovementIcon /> },
  { label: "Dancing", icon: <EmojiPeopleIcon /> },
  { label: "Crafting", icon: <HandymanIcon /> },
];

const UserProfileDetailsView = () => {
  const { userId } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(avatar1);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const isBelow480 = useMediaQuery("(max-width:480px)");

  const { data: userProfile, isLoading: isProfileFetching } = useGetUserProfileById(userId);
  const { data: selfProfile, isLoading: isSelfProfileFetching } = useUserProfile();
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();

  const isSelf = !userId;
  const profile = isSelf ? selfProfile : userProfile;

  useEffect(() => {
    if (profile) {
      const { firstName = "", lastName = "", email = "", mobileNumber = "", location = "", dob = "", hobbies = [], avatar } = profile;
      const initialDetails = {
        profileName: `${firstName} ${lastName}`.trim(),
        email,
        mobile: mobileNumber,
        location,
        dob: dob ? new Date(dob).toISOString().split("T")[0] : "",
        hobbies,
      };

      setFormValues(initialDetails);

      const avatarIndex = AVATARS.findIndex((_, index) => `avatar${index + 1}` === avatar);
      setSelectedAvatar(AVATARS[avatarIndex] || avatar1);
    }
  }, [profile]);

  const validateForm = () => {
    const newErrors = {};
    if (formValues.mobile && !/^\d{10}$/.test(formValues.mobile)) newErrors.mobile = "Mobile number must be a valid 10-digit number.";
    const age = Math.floor((new Date() - new Date(formValues.dob)) / (365.25 * 24 * 60 * 60 * 1000));
    if (formValues.dob && (isNaN(age) || age < 16)) newErrors.dob = "You must be at least 16 years old.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      if (validateForm()) {
        const { profileName, mobile, location, dob, hobbies } = formValues;
        updateProfile({
          firstName: profileName.split(" ")[0],
          lastName: profileName.split(" ").slice(1).join(" "),
          mobileNum: mobile,
          location,
          dob,
          hobbies,
          avatar: `avatar${AVATARS.indexOf(selectedAvatar) + 1}`,
        });
        setIsEditMode(false);
      }
    } else {
      setIsEditMode(true);
    }
  };

  const handleInputChange = ({ target: { name, value } }) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleHobbyToggle = (hobby) => {
    setFormValues((prev) => ({
      ...prev,
      hobbies: prev.hobbies?.includes(hobby) ? prev.hobbies?.filter((h) => h !== hobby) : [...prev.hobbies, hobby],
    }));
  };

  const handleReset = () => {
    if (profile) {
      setFormValues({
        profileName: `${profile.firstName} ${profile.lastName}`.trim(),
        email: profile.email,
        mobile: profile.mobileNumber,
        location: profile.location,
        dob: profile.dob ? new Date(profile.dob).toISOString().split("T")[0] : "",
        hobbies: profile.hobbies,
      });
      setErrors({});
      setIsEditMode(false);
    }
  };

  const handleAvatarSelect = (avatarName) => {
    const selected = AVATARS.find((_, index) => `avatar${index + 1}` === avatarName);
    if (selected) setSelectedAvatar(selected);
  };

  if (isProfileFetching || (isSelf && isSelfProfileFetching)) {
    return <UserProfileDetailsViewSkeleton />;
  }

  return (
    <Stack mt="1rem" alignItems="center" spacing={4}>
      <Card sx={{ width: "90%", padding: 4, boxShadow: 3, borderRadius: "1rem" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              maxWidth: { md: "20rem" },
              flexDirection: "column",
            }}
          >
            <Stack sx={{ width: { md: "80%", xs: "50%" }, height: { md: "80%", xs: "50%" } }}>
              <Lottie animationData={selectedAvatar} style={{ height: "100%", width: "100%" }} />
            </Stack>
            {isSelf && isEditMode && (
              <Tooltip title="Change Avatar">
                <Button variant="contained" color="secondary" sx={{ fontWeight: "bold" }} onClick={() => setIsAvatarDialogOpen(true)} size="small">
                  Choose Avatar
                </Button>
              </Tooltip>
            )}
          </Box>
          <Stack flex={1} spacing={isBelow480 ? 1 : 3}>
            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { md: "1.5rem", xs: "1.2rem" } }}>
              Personal Details
            </Typography>
            <Divider />

            <Stack spacing={2}>
              <TextField
                label="Profile Name"
                variant="standard"
                fullWidth
                name="profileName"
                value={formValues.profileName || ""}
                InputProps={{ readOnly: true }}
                InputLabelProps={{ shrink: true }}
                placeholder="Not available"
              />
              <TextField
                label="Mobile Number"
                variant="standard"
                fullWidth
                name="mobile"
                type="number"
                value={formValues.mobile || ""}
                onChange={handleInputChange}
                error={!!errors.mobile}
                helperText={errors.mobile}
                InputLabelProps={{ shrink: true }}
                placeholder="Not available"
                InputProps={{ readOnly: !isEditMode }}
              />
              <TextField
                label="Location"
                variant="standard"
                fullWidth
                name="location"
                value={formValues.location || ""}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                placeholder="Not available"
                InputProps={{ readOnly: !isEditMode }}
              />
              <TextField
                label="Date of Birth"
                variant="standard"
                fullWidth
                name="dob"
                type="date"
                value={formValues.dob || ""}
                onChange={handleInputChange}
                error={!!errors.dob}
                helperText={errors.dob}
                InputLabelProps={{ shrink: true }}
                placeholder="Not available"
                InputProps={{ readOnly: !isEditMode }}
              />
            </Stack>

            {isSelf && (
              <Stack direction="row" justifyContent="flex-end" spacing={2}>
                <Button variant="contained" color="secondary" onClick={handleReset} disabled={!isEditMode}>
                  Reset
                </Button>
                <Button variant="contained" color={isEditMode ? "success" : "primary"} startIcon={isEditMode ? <SaveIcon /> : <EditIcon />} onClick={handleEditToggle} disabled={isUpdatingProfile}>
                  {isEditMode ? "Save" : "Edit"}
                </Button>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Card>
      <Card sx={{ width: "90%", padding: 4, boxShadow: 3, borderRadius: "1rem" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems="center">
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              maxWidth: "20rem",
            }}
          >
            <Lottie animationData={hobbiesAnimation} style={{ height: "80%", width: "80%" }} />
          </Box>
          <Stack flex={1} spacing={3}>
            <Typography variant="h6" fontWeight="bold">
              Hobbies
            </Typography>
            <Divider />
            <Stack direction="row" spacing={1} flexWrap="wrap" gap="1rem">
              {HOBBIES.map(({ label, icon }) => (
                <Chip
                  key={label}
                  icon={icon}
                  label={label}
                  color={formValues.hobbies?.includes(label) ? "primary" : "default"}
                  onClick={() => isEditMode && handleHobbyToggle(label)}
                  sx={{
                    cursor: isEditMode ? "pointer" : "default",
                    margin: "0.5rem",
                  }}
                />
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Card>
      <AvatarChoice open={isAvatarDialogOpen} onClose={() => setIsAvatarDialogOpen(false)} onSelect={handleAvatarSelect} />
    </Stack>
  );
};

export default UserProfileDetailsView;
