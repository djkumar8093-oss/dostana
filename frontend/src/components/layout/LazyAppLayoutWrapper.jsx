import React, { Suspense, useEffect, useState } from "react";
import Loading from "../common/Loading";
import { useUserProfile } from "../../hooks/userProfile/userProfile";
import { useDispatch } from "react-redux";
import { showAlert } from "../../reduxSlices/alertSlice";
import { useNavigate } from "react-router-dom";

// Lazy load the AppLayout component.
const LazyAppLayout = React.lazy(() => import("./AppLayout"));

const LazyAppLayoutWrapper = () => {
  const { isLoading: isProfileFetching, data: userProfile, isError: isProfileError, isFetched: isProfileFetched } = useUserProfile();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isProfileFetching) return;

    if (isProfileError || !userProfile) {
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
  }, [isProfileFetching, isProfileError, isProfileFetched, userProfile, dispatch, navigate]);

  if (isProfileFetching || !isReady) {
    return <Loading />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <LazyAppLayout />
    </Suspense>
  );
};

export default LazyAppLayoutWrapper;
