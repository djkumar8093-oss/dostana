import { Box, Button, Stack, TextField, Typography, IconButton, InputAdornment, useMediaQuery } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useRef, useState, useCallback } from "react";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";
import { useGetSignupOtp, useVerifyOtp } from "../../hooks/auth/otp";
import { useSignup } from "../../hooks/auth/signup";
import ResentOtp from "../common/ResentOtp";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const animationVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const BTN_STYLE = { fontWeight: 600, minWidth: "8rem" };

const Signup = () => {
  const isSmallScreen = useMediaQuery("(max-width:400px)");
  const isMediumScreen = useMediaQuery("(max-width:600px)");

  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const emailRef = useRef(null);
  const otpRef = useRef(null);

  const { mutate: requestSignupOtp, isPending: isGettingSignupOtp } = useGetSignupOtp({ updateStep: setStep, emailRef });
  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useVerifyOtp({ updateStep: setStep, otpRef });
  const { mutate: signup, isPending: isSigningUp } = useSignup();

  const validateEmail = (value) => /\S+@\S+\.\S+/.test(value);
  const validateOtp = (value) => value.length === 6;
  const validatePassword = (value) => value.length >= 7 && /[a-zA-Z]/.test(value) && /[0-9]/.test(value);

  const handleBlur = useCallback((field, value) => {
    if (!value) return;
    setErrors((prev) => ({
      ...prev,
      [field]:
        field === "email"
          ? validateEmail(value.trim())
            ? ""
            : "Enter a valid email address"
          : field === "otp"
          ? validateOtp(value.trim())
            ? ""
            : "Enter a valid 6-digit OTP"
          : validatePassword(value.trim())
          ? ""
          : "Password must be at least 7 characters long and contain both letters and numbers",
    }));
  }, []);

  const handleGetOtp = useCallback(() => {
    if (!validateEmail(email)) {
      setErrors((prev) => ({ ...prev, email: "Enter a valid email address" }));
      return;
    }
    requestSignupOtp({ email });
  }, [email, requestSignupOtp]);

  const handleVerifyOtp = useCallback(() => {
    if (!validateOtp(otp)) {
      setErrors((prev) => ({ ...prev, otp: "Enter a valid 6-digit OTP" }));
      return;
    }
    verifyOtp({ email, otp });
  }, [otp, email, verifyOtp]);

  const handleSignUp = useCallback(() => {
    if (!validatePassword(password)) {
      setErrors((prev) => ({ ...prev, password: "Password must be at least 7 characters long and contain both letters and numbers" }));
      return;
    }
    signup({ email, password });
  }, [password, email, signup]);

  const getHelperText = useCallback(
    (field) => {
      if (errors[field]) return errors[field];
      if (field === "email") {
        if (step === 0) return "We will send an OTP to this email address.";
        if (step === 1) return "OTP sent successfully, please verify.";
        if (step === 2) return "Email verified successfully";
      }
      return "";
    },
    [errors, step]
  );

  return (
    <Stack minHeight="35vh" sx={{ px: { xs: "1rem", sm: "2rem" }, py: { xs: "1rem", sm: "1.6rem" } }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: { xs: "1rem", sm: "1.2rem" } }}>
        Create your account
      </Typography>
      <Stack spacing={1} marginTop="0.6rem">
        <TextField
          label="Email"
          variant="standard"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur("email", email)}
          error={Boolean(errors.email)}
          helperText={getHelperText("email")}
          color={step === 2 ? "success" : "primary"}
          inputRef={emailRef}
          disabled={step !== 0}
          autoComplete={"on"}
        />
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div variants={animationVariants} initial="initial" animate="animate" exit="exit" key="otp">
              <Stack gap="0.2rem">
                <TextField
                  label="OTP"
                  placeholder="Enter 6-digit OTP"
                  type="number"
                  variant="standard"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  onBlur={() => handleBlur("otp", otp)}
                  error={Boolean(errors.otp)}
                  helperText={errors.otp}
                  inputRef={otpRef}
                />
                <Box justifyContent="flex-end" display="flex">
                  <ResentOtp onClick={() => requestSignupOtp({ email })} isLoading={isGettingSignupOtp} />
                </Box>
              </Stack>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div variants={animationVariants} initial="initial" animate="animate" exit="exit" key="signup">
              <Stack spacing={3}>
                <TextField
                  label="Password"
                  variant="standard"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur("password", password)}
                  error={Boolean(errors.password)}
                  helperText={errors.password}
                  type={showPassword ? "text" : "password"}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword((show) => !show)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Stack>
            </motion.div>
          )}
        </AnimatePresence>
      </Stack>
      <Stack marginTop={4} alignItems="center" flexDirection="row" gap="0.4rem" alignSelf={"flex-end"}>
        {step === 1 && (
          <Button variant="outlined" sx={BTN_STYLE} startIcon={<KeyboardBackspaceIcon />} onClick={() => setStep(0)} size={isMediumScreen ? "small" : "medium"}>
            Back
          </Button>
        )}
        {step === 0 && (
          <Button variant="contained" sx={BTN_STYLE} onClick={handleGetOtp} disabled={isGettingSignupOtp} size={isMediumScreen ? "small" : "medium"}>
            Get OTP
          </Button>
        )}
        {step === 1 && (
          <Button variant="contained" sx={BTN_STYLE} onClick={handleVerifyOtp} disabled={isVerifyingOtp} size={isMediumScreen ? "small" : "medium"}>
            Verify OTP
          </Button>
        )}
        {step === 2 && (
          <Button variant="contained" sx={BTN_STYLE} color="secondary" onClick={handleSignUp} disabled={isSigningUp} size={isMediumScreen ? "small" : "medium"} fullWidth={isMediumScreen}>
            Sign up
          </Button>
        )}
      </Stack>
      <Stack marginTop="1rem" flexDirection="row" justifyContent="center" paddingY="1rem">
        <Stack flexDirection={isSmallScreen ? "column" : "row"} alignItems="center">
          <Typography variant="body2" color={grey[700]} sx={{ fontWeight: 700 }}>
            Already an existing user?
          </Typography>
          <Button variant="text" sx={{ fontWeight: 600 }} disableRipple size={isSmallScreen ? "small" : "medium"}>
            <Link to="/login" style={{ textDecoration: "none" }}>
              LOG IN
            </Link>
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Signup;
