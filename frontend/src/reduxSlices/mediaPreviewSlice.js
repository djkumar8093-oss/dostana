import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
  mediaSources: [], // [{url, type}]
  showDownload: false,
  selectedIndex: 0, // New property for the selected media index
};

const mediaPreviewSlice = createSlice({
  name: "mediaPreview",
  initialState,
  reducers: {
    openMediaDialog: (state, action) => {
      const { mediaSources, showDownload, selectedIndex } = action.payload;
      state.isOpen = true;
      state.mediaSources = mediaSources || [];
      state.showDownload = showDownload || false;
      state.selectedIndex = selectedIndex || 0;
    },
    closeMediaDialog: (state) => {
      state.isOpen = false;
      state.mediaSources = [];
      state.showDownload = false;
      state.selectedIndex = 0;
    },
  },
});

export const { openMediaDialog, closeMediaDialog } = mediaPreviewSlice.actions;
export default mediaPreviewSlice.reducer;
