import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  recipient: null,
};

const chatRecipientSlice = createSlice({
  name: "chatRecipient",
  initialState,
  reducers: {
    setChatRecipientProfile: (state, action) => {
      state.recipient = action.payload;
    },
    resetChatRecipientProfile: (state) => {
      state.recipient = null;
    },
  },
});
export const { setChatRecipientProfile, resetChatRecipientProfile } = chatRecipientSlice.actions;
export default chatRecipientSlice.reducer;
