import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isVisible: false,
  message: "",
  type: "", // e.g., 'success', 'error', 'info', 'warning'
  loading: false, // Loading state
  isPosting: false,
};

const alertSlice = createSlice({
  name: "alert",
  initialState,
  reducers: {
    showAlert: (state, action) => {
      const { message, type, loading = false, isPosting } = action.payload;
      state.isVisible = true;
      state.message = message;
      state.type = type;
      state.loading = loading;
      state.isPosting = isPosting;
    },
    hideAlert: (state) => {
      state.isVisible = false;
      state.message = "";
      state.type = "";
      state.loading = false;
      state.isPosting = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload; // Action to set loading state
    },
  },
});

export const { showAlert, hideAlert, setLoading } = alertSlice.actions;
export default alertSlice.reducer;
