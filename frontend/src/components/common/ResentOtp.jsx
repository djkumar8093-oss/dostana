/* eslint-disable react/prop-types */
import React from "react";
import { Button, Typography } from "@mui/material";

const ResentOtp = ({ onClick, isLoading }) => {
  // Initially, no countdown is running.
  const [timer, setTimer] = React.useState(0);
  // This flag tells us that a resend was requested.
  const [otpRequested, setOtpRequested] = React.useState(false);

  // When the user clicks the resend button, we trigger the OTP send.
  // We mark that a resend was requested so that once sending completes,
  // we can start the timer.
  const handleResendOtp = () => {
    if (!isLoading) {
      setOtpRequested(true);
      onClick();
    }
  };

  // Once isLoading becomes false (i.e. the OTP send request finished)
  // and if a resend was requested, start the countdown timer.
  React.useEffect(() => {
    if (!isLoading && otpRequested) {
      setTimer(120); // Set timer to 120 seconds (2 minutes)
      setOtpRequested(false);
    }
  }, [isLoading, otpRequested]);

  // This effect handles the countdown timer.
  // It only runs if the timer is positive and the OTP is not currently sending.
  React.useEffect(() => {
    let interval;
    if (timer > 0 && !isLoading) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, isLoading]);

  // --- Render Logic ---

  // 1. If currently sending OTP, show the button with a circular progress spinner.
  if (isLoading) {
    return (
      <Button variant="text" disabled sx={{ fontWeight: 600 }}>
        Resend OTP
      </Button>
    );
  }

  // 2. If the timer is active (and not loading), show the countdown message.
  if (timer > 0) {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    return (
      <Typography variant="body1" sx={{ fontSize: ".8rem", fontFamily: "Roboto", fontWeight: 500 }}>
        You can resend OTP in {formattedTime} minutes
      </Typography>
    );
  }

  // 3. Otherwise, show the enabled button.
  return (
    <Button variant="text" onClick={handleResendOtp} sx={{ fontWeight: 600 }}>
      Resend OTP
    </Button>
  );
};

export default ResentOtp;
