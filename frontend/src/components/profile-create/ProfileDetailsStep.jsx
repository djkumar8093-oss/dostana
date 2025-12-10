import { useCallback, useRef, useState } from "react";
import { ArrowRightAlt, KeyboardArrowLeft } from "@mui/icons-material";
import { Button, DialogTitle, DialogContent, DialogActions, Stack, TextField, Typography, Divider, useMediaQuery } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { updateCurrentStep, updateProfileDetails } from "../../reduxSlices/profileSlice";
import { useUserProfile } from "../../hooks/userProfile/userProfile";
import { useQueryClient } from "@tanstack/react-query";

const ProfileDetailsStep = ({ setCurrentStep }) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const isBelow420 = useMediaQuery("(max-width: 420px)");

  const {
    data: { firstName, lastName, mobileNumber },
  } = useUserProfile();

  // Local state for form inputs and errors
  const [formValues, setFormValues] = useState({
    firstName: firstName || "",
    lastName: lastName || "",
    mobileNumber: mobileNumber || "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Refs for focusing inputs
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const mobileNumberRef = useRef(null);

  // Validation functions
  const validateName = useCallback((value, fieldName) => {
    if (value.length < 3) return `${fieldName} must be at least 3 characters long`;
    if (value.length > 15) return `${fieldName} must be at most 15 characters long`;
    if (!/^[a-zA-Z\s]+$/.test(value)) return `${fieldName} must contain only alphabets`;
    return "";
  }, []);

  const validateMobileNumber = useCallback((value) => {
    if (!value.trim()) return "";
    if (value.length !== 10) return "Mobile number must be 10 digits long";
    return "";
  }, []);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Handle input blur (validation on blur only if value exists)
  const handleInputBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      let error = "";
      if (value.trim()) {
        if (name === "firstName" || name === "lastName") {
          error = validateName(value, name === "firstName" ? "First Name" : "Last Name");
        } else if (name === "mobileNumber") {
          error = validateMobileNumber(value);
        }
      }
      setFormErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateName, validateMobileNumber]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const errors = {
        firstName: validateName(formValues.firstName, "First Name"),
        lastName: validateName(formValues.lastName, "Last Name"),
        mobileNumber: validateMobileNumber(formValues.mobileNumber),
      };

      setFormErrors(errors);

      // Focus the first field with an error
      if (errors.firstName) {
        firstNameRef.current.focus();
      } else if (errors.lastName) {
        lastNameRef.current.focus();
      } else if (errors.mobileNumber) {
        mobileNumberRef.current.focus();
      } else {
        queryClient.setQueryData(["userProfile"], (prev) => ({ ...prev, ...formValues }));
        setCurrentStep((prevStep) => prevStep + 1);
      }
    },
    [validateName, formValues, validateMobileNumber, queryClient, setCurrentStep]
  );

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent sx={{ px: { md: "1rem", sm: ".6rem", xs: ".2rem" } }}>
        <Stack gap={2}>
          {/* Profile Name Section */}
          <Stack>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", fontSize: { md: "1.2rem", sm: "1rem", xs: ".9rem" } }}>
              Profile Name
            </Typography>
            <Stack spacing={1}>
              <TextField
                label="First Name"
                variant="standard"
                fullWidth
                name="firstName"
                value={formValues.firstName}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                error={Boolean(formErrors.firstName)}
                helperText={formErrors.firstName}
                inputRef={firstNameRef}
              />
              <TextField
                label="Last Name"
                variant="standard"
                fullWidth
                name="lastName"
                value={formValues.lastName}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                error={Boolean(formErrors.lastName)}
                helperText={formErrors.lastName}
                inputRef={lastNameRef}
              />
            </Stack>
          </Stack>

          {/* Mobile Number Section */}
          <Stack>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", fontSize: { md: "1.2rem", sm: "1rem", xs: ".9rem" } }}>
              Mobile Number
            </Typography>
            <Stack direction="row" spacing={2} mt={1}>
              <TextField variant="standard" value="+91" sx={{ width: "5rem" }} InputProps={{ readOnly: true }} />
              <TextField
                variant="standard"
                fullWidth
                placeholder="Enter your mobile number (optional)"
                type="number"
                name="mobileNumber"
                value={formValues.mobileNumber}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                error={Boolean(formErrors.mobileNumber)}
                helperText={formErrors.mobileNumber}
                inputRef={mobileNumberRef}
              />
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ justifyContent: "space-between", py: isBelow420 ? ".6rem" : ".8rem" }}>
        <Button variant="outlined" startIcon={<KeyboardArrowLeft />} onClick={() => dispatch(setCurrentStep((prevStep) => prevStep - 1))} sx={{ fontWeight: 600 }}>
          Back
        </Button>
        <Button variant="contained" endIcon={<ArrowRightAlt />} type="submit" sx={{ fontWeight: 600 }}>
          Next
        </Button>
      </DialogActions>
    </form>
  );
};

export default ProfileDetailsStep;
