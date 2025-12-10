import React from "react";
import axiosInstance from "../../configs/axiosInstance";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showAlert, setLoading } from "../../reduxSlices/alertSlice";

const GoogleAuthButton = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSuccess = (credentialResponse) => {
    // Show a loading alert while fetching data from the backend
    dispatch(showAlert({ message: "Logging in...", type: "info", loading: true }));
    dispatch(setLoading(true));

    axiosInstance
      .post("/auth/google/token", { token: credentialResponse.credential })
      .then((res) => {
        if (res.data.success) {
          console.log("Logged in successfully!");
          dispatch(showAlert({ message: "Login successful", type: "success", loading: false }));
          dispatch(setLoading(false));
          localStorage.setItem("isLoggedIn", true);
          navigate("/home");
        }
      })
      .catch((err) => {
        console.error("Authentication error:", err);
        dispatch(showAlert({ message: "Authentication error. Please try again.", type: "error", loading: false }));
        dispatch(setLoading(false));
      });
  };

  const onError = () => {
    console.error("Google login failed");
    dispatch(showAlert({ message: "Google login failed", type: "error", loading: false }));
    dispatch(setLoading(false));
  };

  return <GoogleLogin onSuccess={onSuccess} onError={onError} />;
};

export default GoogleAuthButton;
