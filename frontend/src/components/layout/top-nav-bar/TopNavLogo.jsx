import { Box, useMediaQuery } from "@mui/material";
import { secondaryCompanyLogo, companyFaviIcon } from "../../../assets";

const TopNavLogo = () => {
  const isBellow700 = useMediaQuery("(max-width:700px)");
  return <Box component={"img"} src={isBellow700 ? companyFaviIcon : secondaryCompanyLogo} width={isBellow700 ? "2.2rem" : { xs: "4rem", sm: "5rem", md: "7rem" }} alt="logo" />;
};

export default TopNavLogo;
