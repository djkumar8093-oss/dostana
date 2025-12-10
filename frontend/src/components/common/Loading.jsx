import React from "react";
import Lottie from "lottie-react";
import { Backdrop, Stack, useMediaQuery } from "@mui/material";
import { loadingHandAnimation } from "../../animation";

const Loading = () => {
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  return (
    <Stack alignItems={"center"} justifyContent={"center"} height={"100%"} width={"100%"} component={Backdrop} open={true} bgcolor={"#fff"}>
      <Lottie animationData={loadingHandAnimation} style={{ height: isSmallScreen ? "60%" : "50%", width: isSmallScreen ? "60%" : "50%" }} loop={true} autoPlay={true} />
    </Stack>
  );
};

export default React.memo(Loading);
