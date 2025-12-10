import React, { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/common/ErrorBoundary";
import SocketProvider from "./contextProvider/SocketProvider";
import SnackBarAlert from "./components/utils/SnackBarAlert";
import MediaPreviewModal from "./components/utils/MediaPreviewModal";
import DownloadSnackbarAlert from "./components/utils/DownloadSnackbarAlert";
import NotistackAlert from "./components/utils/NotistackAlert";

// Directly import route components instead of lazy-loading them
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgetPasswordPage from "./pages/auth/ForgetPasswordPage";
import UserProfileCreationPage from "./pages/profile/UserProfileCreationPage";
import UserProfileCreationBannerPage from "./pages/profile/UserProfileCreationBannerPage";
import HomePage from "./pages/app/HomePage";
import UserProfileViewPage from "./pages/profile/UserProfileViewPage";
import UserProfileFeedViewPage from "./pages/profile/UserProfileFeedViewPage";
import UserProfileDetailsViewPage from "./pages/profile/UserProfileDetailsViewPage";
import AddFriendPage from "./pages/friend/AddFriendPage";
import FriendsViewPage from "./pages/friend/FriendsViewPage";
import FriendRequestsViewPage from "./pages/friend/FriendRequestsViewPage";
import ChatsPage from "./pages/chat/ChatsPage";
import ChatModalPage from "./pages/chat/ChatModalPage";
import SharedFeedViewPage from "./pages/feed/SharedFeedViewPage";
import SavedFeedViewPage from "./pages/feed/SavedFeedViewPage";
import AppLayout from "./components/layout/AppLayout";
import SnackbarInstallButton from "./components/utils/SnackbarInstall";
import SingleContentViewModal from "./components/content/SingleContentViewModal";
import OfflineIndicator from "./components/utils/OfflineIndicator";
const App = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <SnackBarAlert />
        <MediaPreviewModal />
        <DownloadSnackbarAlert />
        <NotistackAlert />
        <SnackbarInstallButton />
        <OfflineIndicator />
        <Routes>
          <Route path="/" element={<Navigate to={isLoggedIn ? "/home" : "/login"} />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="profile-setup" element={<UserProfileCreationPage />} />
          <Route path="forget-password" element={<ForgetPasswordPage />} />
          <Route
            path="/"
            element={
              <SocketProvider>
                <AppLayout />
              </SocketProvider>
            }
          >
            <Route path="welcome" element={<UserProfileCreationBannerPage />} />
            <Route path="home" element={<HomePage />}>
              <Route path="content/:contentId" element={<SingleContentViewModal />} />
            </Route>
            <Route path="profile" element={<UserProfileViewPage />}>
              <Route index element={<Navigate to="feed" />} />
              <Route path="feed" element={<UserProfileFeedViewPage />} />
              <Route path="details" element={<UserProfileDetailsViewPage />} />
            </Route>
            <Route path="user-profile/:userId" element={<UserProfileViewPage />}>
              <Route index element={<Navigate to="feed" />} />
              <Route path="feed" element={<UserProfileFeedViewPage />} />
              <Route path="details" element={<UserProfileDetailsViewPage />} />
            </Route>
            <Route path="add-friend" element={<AddFriendPage />} />
            <Route path="chats" element={<ChatsPage />}>
              <Route path=":userId" element={<ChatModalPage />} />
            </Route>
            <Route path="friends" element={<FriendsViewPage />} />
            <Route path="friend-requests" element={<FriendRequestsViewPage />} />
            <Route path="shared-feed" element={<SharedFeedViewPage />} />
            <Route path="saved-feed" element={<SavedFeedViewPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
