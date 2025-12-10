import { Stack, Typography } from "@mui/material";
import Lottie from "lottie-react";
import React, { useState } from "react";
import { noPostFoundAnimation } from "../../animation";

const SelfProfileNoContentMsg = ({ isUserPostedContent = false }) => {
  return (
    <Stack alignItems={"center"} justifyContent={"center"} mt={2}>
      <Lottie animationData={noPostFoundAnimation} style={{ height: "20rem", width: "20rem" }} loop={true} autoPlay={true} />
      <Stack sx={{ transform: "translateY(-2rem)" }} justifyContent={"center"} alignItems={"center"}>
        <Typography variant="body2" fontWeight={"bold"}>
          {isUserPostedContent ? "No more posts" : "User has not added any post yet"}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default SelfProfileNoContentMsg;
