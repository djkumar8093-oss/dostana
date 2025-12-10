import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isVisible: false,
  message: "",
  avatarSrc: "",
  notificationType: "",
  senderName: "",
  bulletNotification: localStorage.getItem("bulletNotification"),
};

const notistackAlertSlice = createSlice({
  name: "notistackAlert",
  initialState,
  reducers: {
    showNotistackAlert: (state, action) => {
      const { message, avatarSrc, notificationType, senderName } = action.payload;
      state.isVisible = true;
      state.message = message;
      state.avatarSrc = avatarSrc;
      state.notificationType = notificationType;
      state.senderName = senderName;
    },
    hideNotistackAlert: (state) => {
      state.isVisible = false;
      state.message = "";
      state.avatarSrc = "";
      state.notificationType = "";
    },
    setBulletNotification: (state, action) => {
      state.bulletNotification = action.payload;
      localStorage.setItem("bulletNotification", action.payload);
    },
  },
});

export const { showNotistackAlert, hideNotistackAlert, setBulletNotification } = notistackAlertSlice.actions;
export default notistackAlertSlice.reducer;
