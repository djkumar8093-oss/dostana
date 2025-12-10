import { useState /* useEffect */ } from "react";
import { Box, Dialog, DialogContent, Stack } from "@mui/material";
import ProfileImageStep from "./ProfileImageStep";
import ProfileDetailsStep from "./ProfileDetailsStep";
import ProfileAdditionalDetailsStep from "./ProfileAdditionalDetailsStep";
import secondaryCompanyLogo from "../../assets/secondaryCompanyLogo.png";

const ProfileSetupForm = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const [currentStep, setCurrentStep] = useState(0);

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <ProfileImageStep updateCoverImage={setCoverImage} updateProfileImage={setProfileImage} coverImage={coverImage} profileImage={profileImage} setCurrentStep={setCurrentStep} />;
      case 1:
        return <ProfileDetailsStep setCurrentStep={setCurrentStep} />;
      case 2:
        return <ProfileAdditionalDetailsStep coverImage={coverImage} profileImage={profileImage} setCurrentStep={setCurrentStep} />;
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={true}
      fullWidth
      maxWidth="sm"
      sx={{
        "& .MuiDialog-paper": {
          maxHeight: "70vh",
          borderRadius: "1rem",
        },
      }}
    >
      <DialogContent dividers sx={{ px: { md: "1rem", sm: ".6rem", xs: ".3rem" } }}>
        {/* Logo */}
        <Stack alignItems="center">
          <Box component="img" src={secondaryCompanyLogo} alt="Logo" sx={{ width: { md: "12rem", sm: "10rem", xs: "8rem" } }} />
        </Stack>
        {renderStepContent(currentStep)}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSetupForm;
