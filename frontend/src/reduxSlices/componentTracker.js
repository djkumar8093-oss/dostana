import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
};

const notificationModalSlice = createSlice({
  name: "notificationModal",
  initialState,
  reducers: {
    openNotificationModal(state) {
      state.isOpen = true;
    },
    closeNotificationModal(state) {
      state.isOpen = false;
    },
    toggleNotificationModal(state) {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { openNotificationModal, closeNotificationModal, toggleNotificationModal } = notificationModalSlice.actions;
export const notificationModalReducer = notificationModalSlice.reducer;
