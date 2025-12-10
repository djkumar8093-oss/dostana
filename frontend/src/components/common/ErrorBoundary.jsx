/* eslint-disable react/prop-types */
import React from "react";
import { Backdrop, Box, Stack, Typography } from "@mui/material";
import Lottie from "lottie-react";
import { errorBoundaryAnimation } from "../../animation";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Stack height={"100vh"} width={"100vw"} justifyContent={"center"} alignItems={"center"} component={Backdrop} open={true} bgcolor={"#fff"}>
          <Box sx={{ position: "relative", width: { xs: "80%" }, height: { xs: "80%" } }}>
            <Lottie animationData={errorBoundaryAnimation} style={{ width: "100%", height: "100%" }} autoplay loop={false} />

            {/* Clickable area for reset */}
            <Box
              onClick={this.handleReset}
              sx={{
                position: "absolute",
                top: "55%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "100px",
                height: "40px",
                cursor: "pointer",
                zIndex: 1,
              }}
            />
          </Box>
          <Typography variant="h6" color="error" mt={2}>
            {this.state.error?.message || "Something went wrong!"}
          </Typography>
        </Stack>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
