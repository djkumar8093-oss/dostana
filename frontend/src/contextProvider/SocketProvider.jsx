import React, { createContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useUserProfile } from "../hooks/userProfile/userProfile";

const SocketContext = createContext(null);

const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { data: userProfile } = useUserProfile();

  useEffect(() => {
    if (!userProfile) return; // Wait until user profile is available

    const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
      withCredentials: true, // Allow authentication cookies
      auth: {
        userId: userProfile._id,
        name: `${userProfile.firstName} ${userProfile.lastName}`,
        profileImage: userProfile.profileImage,
      },
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userProfile]); // Depend on userProfile to reinitialize socket when user changes

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export default SocketProvider;
export { SocketContext };
