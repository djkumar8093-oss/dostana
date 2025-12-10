import { Button, IconButton, InputAdornment, Stack, TextField, Typography, useMediaQuery } from "@mui/material";
import { useRef, useState, useCallback } from "react";
import { KeyboardBackspace, Visibility, VisibilityOff } from "@mui/icons-material";
import { AnimatePresence, motion } from "motion/react";
import { useGetResetPasswordOtp, useVerifyOtp } from "../../hooks/auth/otp";
import { useResetPassword } from "../../hooks/auth/password";
import ResentOtp from "../common/ResentOtp";
import { Link } from "react-router-dom";

const animationVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: "-100%" },
};

const ForgetPassword = () => {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const emailRef = useRef(null);
  const otpRef = useRef(null);
  const passwordRef = useRef(null);

  const isMobileScreen = useMediaQuery("(max-width:600px)");

  const { mutate: requestResetPasswordOtp, isPending: isGettingResetPasswordOtp } = useGetResetPasswordOtp({ updateStep: setStep, emailRef });
  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useVerifyOtp({ updateStep: setStep, otpRef });
  const { mutate: resetPassword, isPending: isResettingPassword } = useResetPassword();

  const validateField = useCallback((name, value) => {
    const trimmedValue = value.trim();
    if (!value) return;
    if (!trimmedValue) return "Field cannot be empty.";
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(trimmedValue) ? "" : "Enter a valid email address.";
    } else if (name === "otp" && trimmedValue.length !== 6) {
      return "Enter a valid 6-digit OTP.";
    } else if (name === "password") {
      return trimmedValue.length >= 6 ? "" : "Password must be at least 6 characters long.";
    }
    return "";
  }, []);

  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    },
    [validateField]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const emailValue = emailRef.current.value.trim();
      const otpValue = otpRef.current?.value.trim();
      const passwordValue = passwordRef.current?.value.trim();

      const emailError = step === 0 ? validateField("email", emailValue) : "";
      const otpError = step === 1 ? validateField("otp", otpValue) : "";
      const passwordError = step === 2 ? validateField("password", passwordValue) : "";

      const currentErrors = { email: emailError, otp: otpError, password: passwordError };
      setErrors(currentErrors);

      if (emailError || otpError || passwordError) {
        if (emailError) emailRef.current.focus();
        else if (otpError) otpRef.current.focus();
        else if (passwordError) passwordRef.current.focus();
        return;
      }

      if (step === 0) requestResetPasswordOtp({ email: emailValue });
      else if (step === 1) verifyOtp({ email: emailValue, otp: otpValue });
      else if (step === 2) resetPassword({ email: emailValue, password: passwordValue });
    },
    [step, validateField, requestResetPasswordOtp, verifyOtp, resetPassword]
  );

  return (
    <Stack minHeight="35vh" component="form" onSubmit={handleSubmit} sx={{ px: { xs: "1rem", sm: "2rem" }, py: { xs: "1rem", sm: "1.6rem" } }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: { xs: "1rem", sm: "1.2rem" } }}>
        Forget your Password
      </Typography>
      <Stack spacing={3} marginTop=".6rem">
        <TextField label="Email" variant="standard" fullWidth inputRef={emailRef} name="email" onBlur={handleBlur} error={Boolean(errors.email)} helperText={errors.email} disabled={step > 0} />
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div initial="initial" animate="animate" variants={animationVariants}>
              <Stack gap={1} alignItems="flex-end">
                <TextField label="OTP" variant="standard" fullWidth type="number" inputRef={otpRef} name="otp" onBlur={handleBlur} error={Boolean(errors.otp)} helperText={errors.otp} />
                <ResentOtp onClick={() => requestResetPasswordOtp({ email: emailRef.current.value.trim() })} isLoading={isGettingResetPasswordOtp} />
              </Stack>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div initial="initial" animate="animate" variants={animationVariants}>
              <TextField
                label="New Password"
                variant="standard"
                fullWidth
                type={showPassword ? "text" : "password"}
                inputRef={passwordRef}
                name="password"
                onBlur={handleBlur}
                error={Boolean(errors.password)}
                helperText={errors.password}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((prev) => !prev)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Stack>
      <Stack marginTop={4} flexDirection="row" justifyContent="flex-end" gap={1}>
        {step > 0 && (
          <Button variant="outlined" color="primary" onClick={() => setStep(0)} size={isMobileScreen ? "small" : "medium"}>
            <KeyboardBackspace /> Back
          </Button>
        )}
        <Button variant="contained" color="primary" type="submit" disabled={isGettingResetPasswordOtp || isVerifyingOtp || isResettingPassword} size={isMobileScreen ? "small" : "medium"}>
          {step === 0 ? "Get OTP" : step === 1 ? "Verify OTP" : "Reset Password"}
        </Button>
      </Stack>
      <Stack alignItems="center" marginTop={3} flexDirection={"row"} justifyContent={"center"}>
        <Typography variant="body2">Go back to</Typography>
        <Button variant="text" sx={{ fontWeight: "bold" }} size={isMobileScreen ? "small" : "medium"}>
          <Link to="/login" style={{ textDecoration: "none" }}>
            LOG IN
          </Link>
        </Button>
      </Stack>
    </Stack>
  );
};

export default ForgetPassword;
