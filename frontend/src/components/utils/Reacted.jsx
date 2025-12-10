/* eslint-disable react/prop-types */
import Lottie from "lottie-react";
import React from "react";
import { Stack } from "@mui/material";
import { reactedAnimation } from "../../animation";

const Reacted = ({ onAnimationEnd }) => {
  return (
    <Stack
      sx={{
        height: "100%",
        width: "100%",
        position: "absolute",
        zIndex: 1600,
        pointerEvents: "none",
      }}
    >
      <Lottie animationData={reactedAnimation} loop={false} style={{ height: "100%", width: "100%" }} onLoopComplete={onAnimationEnd} />
    </Stack>
  );
};

export default Reacted;
