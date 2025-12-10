import React from "react";
import { Stack } from "@mui/material";
import { Outlet, useNavigate, useParams } from "react-router-dom";

import { useGetUserProfileById, useUserProfile } from "../../hooks/userProfile/userProfile";
import UserProfileFrontViewSkeleton from "../skeletons/UserProfileFrontViewSkeleton";
import UserProfilePageNavTab from "./UserProfilePageNavTab";
import UserProfileFrontView from "./UserProfileFrontView";

const UserProfileView = () => {
  const navigate = useNavigate();

  const { userId } = useParams();
  const { data: userProfile, isLoading: isProfileFetching } = useGetUserProfileById(userId);
  const { data: selfProfile } = useUserProfile();
  const isSelf = !userId;

  React.useEffect(() => {
    if (selfProfile._id === userId) {
      navigate("/profile");
    }
  }, [navigate, selfProfile._id, userId]);

  const profile = isSelf ? selfProfile : userProfile;

  return (
    <Stack flex={1} width="100%" alignItems="center" overflow="auto" pb={2}>
      <Stack sx={{ width: { xs: "99%", md: "55rem" } }}>
        {isProfileFetching ? <UserProfileFrontViewSkeleton isSelf={isSelf} /> : <UserProfileFrontView userProfile={profile} />}
        <UserProfilePageNavTab />
        <Stack mt={1} justifyContent="center" alignItems="center" width="100%">
          <Outlet />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default UserProfileView;
