import { useEffect, useMemo } from "react";

export const useSocketSetup = (socket, userProfile) => {
  const authData = useMemo(() => {
    return userProfile
      ? {
          userId: userProfile._id,
          name: `${userProfile.firstName} ${userProfile.lastName}`,
          profileImage: userProfile.profileImage,
        }
      : null;
  }, [userProfile]);

  useEffect(() => {
    if (!socket || !authData) return;

    // Set the auth data on the socket before it connects.
    socket.auth = authData;

    const handleConnect = () => {};

    const handleDisconnect = () => {};

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket, authData]);
};
