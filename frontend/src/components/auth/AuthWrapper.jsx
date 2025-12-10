import { Box, Paper, Stack, useMediaQuery, useTheme } from "@mui/material";
import { companyLogoV2, primaryCompanyLogo } from "../../assets";

const AuthWrapper = ({ children }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md")); // Detect screen size

  return (
    <Stack height={"100vh"} width={"100vw"} justifyContent={"center"} alignItems={"center"} bgcolor={{ xs: "#00000080", md: "#fff" }}>
      <Stack
        flexDirection={{ sm: "column", md: "row" }}
        borderRadius={1}
        bgcolor={{ md: "#fff" }}
        component={Paper}
        elevation={2}
        width={{ xs: "95%", sm: "30rem", md: "55rem", lg: "60rem" }}
        sx={{ py: { xs: "2rem", md: 0 }, borderRadius: { xs: "1rem", md: ".2rem" } }}
      >
        {/* Left Side with Responsive Logo */}
        <Stack flex={1} justifyContent={"center"} alignItems={"center"} overflow={"hidden"} bgcolor={{ md: "#000" }} sx={{ borderTopRightRadius: "6rem", borderBottomRightRadius: "3rem" }}>
          {/* Conditional Image */}
          <Box component="img" src={isSmallScreen ? companyLogoV2 : primaryCompanyLogo} width={{ xs: "50%", md: "65%" }} />
        </Stack>

        {/* Right Side */}
        <Stack flex={1} justifyContent={"center"}>
          {children}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default AuthWrapper;
