import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isVisible: false,
  message: "",
  type: "", // 'success', 'error', 'downloading'
};

const downloadingSlice = createSlice({
  name: "downloading",
  initialState,
  reducers: {
    showDownloading: (state, action) => {
      const { message, type } = action.payload;
      state.isVisible = true;
      state.message = message;
      state.type = type;
    },
    hideDownloading: (state) => {
      state.isVisible = false;
      state.message = "";
      state.type = "";
    },
  },
});

export const { showDownloading, hideDownloading } = downloadingSlice.actions;
export default downloadingSlice.reducer;
