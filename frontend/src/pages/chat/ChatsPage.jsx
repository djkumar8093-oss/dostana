import React from "react";
import ChatManagement from "../../components/chat/ChatManagement";
import { Outlet } from "react-router-dom";

const ChatsPage = () => {
  return (
    <>
      <ChatManagement />
      {<Outlet />}
    </>
  );
};

export default ChatsPage;
