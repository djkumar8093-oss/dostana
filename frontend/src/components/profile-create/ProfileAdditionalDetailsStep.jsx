import { useCallback, useRef, useState } from "react";
import { KeyboardArrowLeft } from "@mui/icons-material";
import { Button, DialogContent, DialogActions, MenuItem, Select, Stack, TextField, Typography, useMediaQuery } from "@mui/material";
import { useProfileCreation } from "../../hooks/userProfile/userProfileCreation";
import { useUserProfile } from "../../hooks/userProfile/userProfile";

// eslint-disable-next-line react/prop-types
const ProfileAdditionalDetailsStep = ({ coverImage, profileImage, setCurrentStep }) => {
  const { mutate: createProfile, isPending: isCreatingProfile } = useProfileCreation();
  const isBelow420 = useMediaQuery("(max-width: 420px)");

  const { data: userProfile } = useUserProfile();

  const [formValues, setFormValues] = useState({
    gender: userProfile.gender || "male",
    dob: userProfile.dob || "",
    aboutMe: userProfile.aboutMe || "",
  });

  const [formErrors, setFormErrors] = useState({});

  const dateOfBirthRef = useRef(null);
  const aboutMeRef = useRef(null);

  const validateDateOfBirth = useCallback((value) => {
    if (!value) return "Date of birth is required";
    const date = new Date(value);
    if (date > new Date() || date < new Date("1930-01-01")) return "Invalid date of birth";
    if (new Date().getFullYear() - date.getFullYear() < 16) return "Age must be above 16";
    return "";
  }, []);

  const validateAboutMe = useCallback((value) => (value.length > 200 ? "Maximum 200 characters allowed" : ""), []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleInputBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormErrors((prev) => ({
        ...prev,
        [name]: name === "dob" ? validateDateOfBirth(value) : name === "aboutMe" ? validateAboutMe(value) : "",
      }));
    },
    [validateDateOfBirth, validateAboutMe]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {
      dob: validateDateOfBirth(formValues.dob),
      aboutMe: validateAboutMe(formValues.aboutMe),
    };
    setFormErrors(errors);

    if (errors.dob) {
      dateOfBirthRef.current.focus();
      return;
    }
    if (errors.aboutMe) {
      aboutMeRef.current.focus();
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", profileImage || "");
    formData.append("coverImage", coverImage || "");
    formData.append("gender", formValues.gender);
    formData.append("dob", formValues.dob);
    formData.append("aboutMe", formValues.aboutMe);
    formData.append("firstName", userProfile.firstName);
    formData.append("lastName", userProfile.lastName);
    formData.append("mobileNum", userProfile.mobileNumber || "");

    createProfile(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent sx={{ px: { md: "1rem", sm: ".6rem", xs: ".2rem" } }}>
        <Stack gap={2}>
          {/* Gender Selection */}
          <Stack>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", fontSize: { md: "1.2rem", sm: "1rem", xs: ".9rem" } }}>
              Gender
            </Typography>
            <Select
              value={formValues.gender}
              onChange={(e) => setFormValues((prev) => ({ ...prev, gender: e.target.value }))}
              variant="standard"
              displayEmpty
              sx={{ mt: 1 }}
              inputProps={{ "aria-label": "Gender selection" }}
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Prefer not to say</MenuItem>
            </Select>
          </Stack>

          {/* Date of Birth Input */}
          <Stack>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", fontSize: { md: "1.2rem", sm: "1rem", xs: ".9rem" } }}>
              Date of Birth
            </Typography>
            <TextField
              variant="standard"
              fullWidth
              type="date"
              sx={{ mt: 1 }}
              name="dob"
              value={formValues.dob}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              error={Boolean(formErrors.dob)}
              helperText={formErrors.dob}
              inputRef={dateOfBirthRef}
            />
          </Stack>

          {/* About Me Input */}
          <Stack>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", fontSize: { md: "1.2rem", sm: "1rem", xs: ".9rem" } }}>
              About Me
            </Typography>
            <TextField
              variant="standard"
              fullWidth
              multiline
              rows={4}
              placeholder="Describe yourself (max 200 characters)"
              sx={{ mt: 1 }}
              name="aboutMe"
              value={formValues.aboutMe}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              error={Boolean(formErrors.aboutMe)}
              helperText={formErrors.aboutMe}
              inputRef={aboutMeRef}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", pY: isBelow420 ? ".4rem" : ".8rem", flexDirection: isBelow420 ? "column" : "row", gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<KeyboardArrowLeft />}
          onClick={() => setCurrentStep((prevStep) => prevStep - 1)}
          sx={{ fontWeight: 600 }}
          disabled={isCreatingProfile}
          fullWidth={isBelow420}
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="secondary"
          type="submit"
          sx={{ fontWeight: 600, transform: `translateX(${isBelow420 ? "-.2rem" : "0rem"})` }}
          disabled={isCreatingProfile}
          fullWidth={isBelow420}
        >
          {isCreatingProfile ? "Creating Profile..." : "Create Profile"}
        </Button>
      </DialogActions>
    </form>
  );
};

export default ProfileAdditionalDetailsStep;
