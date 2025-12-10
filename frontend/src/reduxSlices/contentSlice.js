// contentSlice.js
import { createSlice } from "@reduxjs/toolkit";

const contentSlice = createSlice({
  name: "notifications",
  initialState: [],
  reducers: {
    addContent: (state, action) => {
      // payload should include: id, file, previewURL, type, status, retryAction, etc.
      state.push(action.payload);
    },
    updateContent: (state, action) => {
      // payload = { id, updates: { status, ... } }
      const index = state.findIndex((n) => n.id === action.payload.id);
      if (index !== -1) {
        state[index] = { ...state[index], ...action.payload.updates };
      }
    },
    removeContent: (state, action) => {
      return state.filter((n) => n.id !== action.payload.id);
    },
  },
});

export const { addContent, updateContent, removeContent } = contentSlice.actions;
export default contentSlice.reducer;
