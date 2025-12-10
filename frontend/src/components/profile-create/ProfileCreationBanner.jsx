import { Box, Button, Stack, Typography, useMediaQuery } from "@mui/material";
import Lottie from "lottie-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { welcomeBanner } from "../../animation";
import { secondaryCompanyLogo } from "../../assets";
import { useUserProfile } from "../../hooks/userProfile/userProfile";
import { useDispatch } from "react-redux";
import { showAlert } from "../../reduxSlices/alertSlice";
import Loading from "../common/Loading";

const ProfileCreationBanner = () => {
  const navigate = useNavigate();
  const isBelowSm = useMediaQuery("(max-width: 600px)");
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);

  const { isLoading: isProfileFetching, data: userProfile, isError: isProfileError, isFetched: isProfileFetched } = useUserProfile();
  const animationOptions = useMemo(
    () => ({
      animationData: welcomeBanner,
      loop: true,
    }),
    []
  );

  useEffect(() => {
    if (isProfileFetching) return;
    if (isProfileError || !userProfile) {
      localStorage.clear();
      dispatch(
        showAlert({
          message: "Something went wrong. Please login again.",
          type: "error",
          loading: false,
        })
      );
      navigate("/login");
    } else if (isProfileFetched) {
      if (!userProfile?.isProfileComplete) {
        navigate("/welcome");
      }

      setIsReady(true);
    }
  }, [isProfileError, isProfileFetched, userProfile, navigate, dispatch, isProfileFetching]);

  if (isProfileFetching || !isReady) {
    return <Loading />;
  }

  // Memoizing the animation to prevent re-renders

  return (
    <Stack height="100vh" width="100vw" justifyContent="center" alignItems="center">
      <Stack
        sx={{
          position: "relative",
          textAlign: "center",
          height: "100%",
          width: "100%",
        }}
        alignItems="center"
        justifyContent="center"
      >
        <Stack sx={{ height: { xs: "15rem", sm: "50%" }, width: { xs: "15rem", sm: "50%" } }}>
          <Lottie {...animationOptions} style={{ height: "100%", width: "100%" }} />
        </Stack>
        <Stack sx={{ transform: "translateY(-3rem)" }}>
          <Stack flexDirection="row" alignItems="center" justifyContent="center" gap={2}>
            <Typography variant="h4" sx={{ fontSize: { md: "2rem", xs: "1.2rem", sm: "1.5rem" } }}>
              Welcome To
            </Typography>
            <Box component="img" src={secondaryCompanyLogo} sx={{ width: { md: "10rem", xs: "6rem", sm: "8rem", transform: "translateX(-.7rem)" } }} />
          </Stack>

          <Button
            sx={{
              marginTop: "1rem",
              fontWeight: "bold",
              borderRadius: ".4rem",
              alignSelf: "center",
              wordBreak: "keep-all",
              whiteSpace: "nowrap",
              minWidth: { md: "15rem", xs: "12rem" },
            }}
            variant="contained"
            color="secondary"
            onClick={() => navigate("/profile-setup")}
            size={isBelowSm ? "small" : "large"}
          >
            Create Your Profile
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ProfileCreationBanner;
