import { Button, Stack, Typography, useMediaQuery } from "@mui/material";
import Lottie from "lottie-react";
import React from "react";
import { noFeedAvailable } from "../../animation";
import { useNavigate } from "react-router-dom";

const NoFeedMsg = ({ btnTitle, textMsg }) => {
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width:480px)");
  return (
    <Stack alignItems={"center"} justifyContent={"center"} flex={1} sx={{ transform: "translateY(-1rem)" }}>
      <Stack sx={{ height: { md: "18rem", xs: "10rem" }, width: { md: "18rem", xs: "10rem" } }}>
        <Lottie animationData={noFeedAvailable} style={{ height: "100%", width: "100%" }} />
      </Stack>
      <Typography variant="body2" fontWeight={"bold"} sx={{ fontSize: { sm: "1rem", xs: ".8rem" } }}>
        {textMsg}
      </Typography>
      {btnTitle && (
        <Button
          sx={{ paddingX: "2.4rem", fontSize: ".8rem", fontWeight: "bold", borderRadius: ".4rem", minWidth: { md: "10rem", xs: "8rem" }, mt: "1rem" }}
          variant="contained"
          color="secondary"
          onClick={() => navigate("/home")}
          size={isSmallScreen ? "small" : "medium"}
        >
          {btnTitle}
        </Button>
      )}
    </Stack>
  );
};

export default NoFeedMsg;
