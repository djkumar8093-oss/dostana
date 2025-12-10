import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showAlert } from "../../reduxSlices/alertSlice";
import { useUserProfile } from "./userProfile";

export const useProfileCheck = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);

  // Destructure properties from your user profile hook.
  const { isLoading: isProfileFetching, data: userProfile, isError: isProfileError, isFetched: isProfileFetched } = useUserProfile();

  useEffect(() => {
    if (isProfileError) {
      dispatch(
        showAlert({
          message: "Something went wrong. Please login again.",
          type: "error",
          loading: false,
        })
      );
      navigate("/login");
    } else if (isProfileFetched) {
      if (!userProfile?.isProfileComplete) {
        navigate("/welcome");
      }
      setIsReady(true);
    }
  }, [isProfileError, isProfileFetched, userProfile, navigate, dispatch]);

  return { isProfileFetching, isReady, userProfile };
};
