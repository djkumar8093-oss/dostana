import { createSlice } from "@reduxjs/toolkit";

// Initial state for the profile slice
const initialState = {
  details: {
    firstName: "",
    lastName: "",
    dob: "",
    gender: "male",
    mobileNumber: "",
    aboutMe: "",
    isGoogleAccount: false,
  },
  currentStep: 0,
};

const userProfileSlice = createSlice({
  name: "userProfile",
  initialState,
  reducers: {
    // Updates the current step in the profile creation process
    updateCurrentStep(state, action) {
      state.currentStep = action.payload;
    },

    // Updates the user profile details
    updateProfileDetails(state, action) {
      state.details = action.payload;
    },

    // Resets the profile state to its initial values
    resetUserProfile(state) {
      state.details = initialState.details;
      state.currentStep = initialState.currentStep;
    },
    setGoogleProfileImage(state, action) {
      state.googleProfileImage = action.payload;
    },
    setIsGoogleAccount(state, action) {
      state.isGoogleAccount = action.payload;
    },
  },
});

// Export actions
export const { updateProfileDetails, updateCurrentStep, resetUserProfile, setGoogleProfileImage, setIsGoogleAccount } = userProfileSlice.actions;

// Export reducer
export default userProfileSlice.reducer;
