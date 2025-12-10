import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import axiosInstance from "../../configs/axiosInstance";
import { setLoading, showAlert } from "../../reduxSlices/alertSlice";

// API call to verify OTP
const verifyOtpApi = async (data) => {
  const response = await axiosInstance.post("/auth/verify-otp", data);
  return response.data;
};

const requestSignupOtp = async (data) => {
  data.isSignup = true;
  const response = await axiosInstance.post("/auth/signup/get-otp", data);
  return response.data;
};

// API call to request reset password OTP
const requestResetPasswordOtp = async (data) => {
  data.isForgetPassword = true;
  const response = await axiosInstance.post("/auth/forget-password/get-otp", data);
  return response.data;
};

const useVerifyOtp = ({ otpRef, updateStep }) => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: verifyOtpApi,
    onMutate: () => {
      dispatch(showAlert({ message: "Verifying OTP...", type: "info", loading: true }));
    },
    onSuccess: () => {
      dispatch(showAlert({ message: "OTP verified successfully.", type: "success", loading: false }));
      updateStep(2); // Move to the next step on successful OTP verification
    },
    onError: (error) => {
      let errorMessage = "Failed to verify OTP. Please try again.";
      if (error.response?.status === 400) {
        if (otpRef) {
          otpRef.current.focus();
        }
        errorMessage = error.response.data?.message || "Something went wrong. Please try again.";
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = "Network error. Please check your connection.";
      }
      dispatch(showAlert({ message: errorMessage, type: "error", loading: false }));
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
};

// API call to request signup OTP

// Hook for requesting signup OTP
const useGetSignupOtp = ({ updateStep, emailRef }) => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: requestSignupOtp,
    onMutate: () => {
      dispatch(showAlert({ message: "Requesting  OTP...", type: "info", loading: true }));
    },
    onSuccess: () => {
      dispatch(showAlert({ message: "OTP sent successfully.", type: "success", loading: false }));
      updateStep(1); // Move to the next step on success
    },
    onError: (error) => {
      let errorMessage = "Failed to send  OTP. Please try again.";
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || "Something went wrong. Please try again.";
        if (emailRef) {
          emailRef.current.focus();
        }
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = "Network error. Please check your connection.";
      }
      dispatch(showAlert({ message: errorMessage, type: "error", loading: false }));
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
};

// Hook for requesting reset password OTP
const useGetResetPasswordOtp = ({ updateStep, emailRef }) => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: requestResetPasswordOtp,
    onMutate: () => {
      dispatch(showAlert({ message: "Requesting  OTP...", type: "info", loading: true }));
    },
    onSuccess: () => {
      dispatch(showAlert({ message: "OTP sent successfully.", type: "success", loading: false }));
      updateStep(1); // Move to the next step on success
    },
    onError: (error) => {
      let errorMessage = "Failed to send OTP. Please try again.";
      if (error.response?.status === 404) {
        errorMessage = error.response.data?.message || "Something went wrong. Please try again.";
        if (emailRef) {
          emailRef.current.focus();
        }
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = "Network error. Please check your connection.";
      }
      dispatch(showAlert({ message: errorMessage, type: "error", loading: false }));
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
};

export { useVerifyOtp, useGetSignupOtp, useGetResetPasswordOtp };
