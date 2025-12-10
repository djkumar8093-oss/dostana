import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, useTheme, useMediaQuery, BottomNavigation, BottomNavigationAction, Badge } from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import Person2Icon from "@mui/icons-material/Person2";
import ShareIcon from "@mui/icons-material/Share";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import { useGetTotalUnreadMessages } from "../../../hooks/chat/message";

const allMenuItems = [
  { label: "Home", icon: <HomeRoundedIcon />, path: "/home" },
  { label: "Profile", icon: <Person2Icon />, path: "/profile" },
  { label: "Friends", icon: <GroupRoundedIcon />, path: "/friends" },
  { label: "Chats", icon: <ChatRoundedIcon />, path: "/chats" },
  { label: "Shared Post", icon: <ShareIcon />, path: "/shared-feed" },
  { label: "Saved Feed", icon: <BookmarkRoundedIcon />, path: "/saved-feed" },
];

const TopNavMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  // Determine if the viewport is below the "md" breakpoint.
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // typically below 600px
  const isBelow450 = useMediaQuery("(max-width:450px)");

  // If below md, filter out the extra menu items from the top nav.
  const menuItems = allMenuItems.filter((item) => (!isBelowMd || (item.label !== "Shared Post" && item.label !== "Saved Feed")) && (!isBelow450 || item.label !== "Profile"));

  // Get unread messages count for the Chats icon badge.
  const { data: totalUnreadMessages } = useGetTotalUnreadMessages();

  const handleChange = (event, newValue) => {
    navigate(menuItems[newValue].path);
  };

  const activeIndex = menuItems.findIndex((item) => location.pathname.startsWith(item.path));

  return (
    <Box sx={{ margin: 0 }}>
      <BottomNavigation showLabels={!isMobile} value={activeIndex} onChange={handleChange} sx={{ overflow: "hidden" }}>
        {menuItems.map((item, index) => (
          <BottomNavigationAction
            key={index}
            label={item.label}
            icon={
              item.label === "Chats" ? (
                <Badge badgeContent={totalUnreadMessages > 0 ? totalUnreadMessages : null} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )
            }
            sx={{
              width: isMobile ? "auto" : "100%",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: activeIndex === index ? "primary.main" : "text.secondary",
              fontSize: isMobile ? "0.75rem" : "inherit",
              "& .MuiSvgIcon-root": {
                width: isMobile ? "1.2rem" : "1.5rem",
                height: isMobile ? "1.2rem" : "1.5rem",
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Box>
  );
};

export default TopNavMenu;
