import React, { useState, useCallback, useMemo } from "react";
import { Box, Stack, Drawer, IconButton, Button, Divider, useMediaQuery, Badge, Tooltip } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import ShareIcon from "@mui/icons-material/Share";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import Person2Icon from "@mui/icons-material/Person2";
import NotificationsIcon from "@mui/icons-material/Notifications";
import TopNavLogo from "./TopNavLogo";
import AccountIconButton from "../../../features/account/AccountIconButton";
import TopNavMenu from "./TopNavMenu";
import SideNavFriendRequestsView from "../../friend/SideNavFriendRequestsView";
import { useNavigate, useLocation } from "react-router-dom";
import NotificationModal from "../../../features/notification/NotificationModal";
import { useGetUnreadNotificationCount } from "../../../hooks/notification/notificationReader";
import { secondaryCompanyLogo } from "../../../assets";
import NotificationIconButton from "../../../features/notification/NotificationIconButton";

// New component: a drawer-style notification button with badge functionality
const NotificationDrawerButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: unreadCount, isLoading } = useGetUnreadNotificationCount();

  const toggleModal = useCallback(() => {
    setIsModalOpen((prev) => !prev);
  }, []);

  const badgeContent = useMemo(() => (!isLoading && unreadCount > 0 ? unreadCount : 0), [isLoading, unreadCount]);

  return (
    <>
      <Button
        fullWidth
        startIcon={
          <Badge badgeContent={badgeContent} color="secondary" max={99}>
            <NotificationsIcon color="action" sx={{ width: "1.5rem", height: "1.5rem" }} />
          </Badge>
        }
        onClick={toggleModal}
        sx={{
          justifyContent: "flex-start",
          textTransform: "none",
          fontWeight: "bold",
          color: "#000000a6",
          p: "1rem",
          px: ".8rem",
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        Notifications
      </Button>
      {isModalOpen && <NotificationModal open={isModalOpen} handleClose={toggleModal} />}
    </>
  );
};

const TopNav = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isBelow600 = useMediaQuery("(max-width:600px)");

  const isBellow500 = useMediaQuery("(max-width:500px)");
  const isBelow450 = useMediaQuery("(max-width:450px)");
  const isBelow370 = useMediaQuery("(max-width:370px)"); // New condition for below 370px
  const isBelow1300 = useMediaQuery("(max-width:1300px)");
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const extraMenuItems = [
    ...(isBelow450 ? [{ label: "Profile", icon: <Person2Icon />, path: "/profile" }] : []),
    { label: "Shared Post", icon: <ShareIcon />, path: "/shared-feed" },
    { label: "Saved Feed", icon: <BookmarkRoundedIcon />, path: "/saved-feed" },
  ];

  return (
    <Box sx={{ boxShadow: 3, zIndex: 1000 }} component="header">
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" sx={{ px: { xs: ".4rem", sm: "1rem", md: "1.6rem" }, py: ".4rem" }}>
        <Stack direction="row" alignItems="center" gap={1}>
          {isBelow1300 && (
            <>
              <IconButton onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
              <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} sx={{ "& .MuiDrawer-paper": { p: 2 } }}>
                {/* Logo at the top of the drawer */}
                <Stack direction="row" alignItems="center" justifyContent="center">
                  <Box component={"img"} src={secondaryCompanyLogo} width={"6rem"} alt="logo" />
                </Stack>
                {isBelowMd && (
                  <>
                    {extraMenuItems.map((item, index) => {
                      const isActive = location.pathname.startsWith(item.path);
                      return (
                        <Button
                          key={index}
                          fullWidth
                          startIcon={item.icon}
                          onClick={() => {
                            navigate(item.path);
                            setDrawerOpen(false);
                          }}
                          sx={{
                            justifyContent: "flex-start",
                            backgroundColor: isActive ? "action.selected" : "inherit",
                            my: 0.5,
                            textTransform: "none",
                            fontWeight: "bold",
                            color: "#000000a6",
                            p: "1rem",
                            px: ".8rem",
                            "&:hover": {
                              backgroundColor: "action.hover",
                            },
                          }}
                        >
                          {item.label}
                        </Button>
                      );
                    })}
                    <Divider sx={{ my: 1 }} />
                    {/* Render notification button inside the drawer if below 370px */}
                    {isBelow370 && (
                      <>
                        <NotificationDrawerButton />
                        <Divider sx={{ my: 1 }} />
                      </>
                    )}
                  </>
                )}

                <SideNavFriendRequestsView setOpenDrawer={setDrawerOpen} />
              </Drawer>
            </>
          )}
          {!isBellow500 && <TopNavLogo />}
        </Stack>
        <TopNavMenu />
        <Stack component="nav" flexDirection="row" alignItems="center" gap={{ xs: ".2rem", md: 3 }}>
          {/* Show the notification button in the top bar only if viewport is above 370px */}
          {!isBelow370 && <NotificationIconButton />}
          <AccountIconButton />
        </Stack>
      </Stack>
    </Box>
  );
};

export default TopNav;
