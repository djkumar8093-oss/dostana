import { List, Stack, Typography } from "@mui/material";
import { useRef, useCallback, useEffect, useMemo } from "react";
import { useUserProfile } from "../../hooks/userProfile/userProfile.js";
import ContentCard from "./ContentCard";
import ContentCardSkeleton from "../skeletons/ContentCardSkeleton";
import { AnimatePresence } from "motion/react";
import NoFeedMsg from "../common/NoFeedMsg";

// eslint-disable-next-line react/prop-types
const ContentFeed = ({ contents = [], fetchNextPage, hasNextPage, isFetchingNextPage, loading = false, showFeedLogo = true }) => {
  const observerRef = useRef(null);
  const { data: userProfile } = useUserProfile();

  // Debounced Intersection Observer to prevent excessive calls
  const lastContentElementRef = useCallback(
    (node) => {
      if (isFetchingNextPage || !hasNextPage) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setTimeout(() => fetchNextPage(), 200); // Debounce API call
          }
        },
        { threshold: 1.0 } // Fire only when fully visible
      );

      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, fetchNextPage, hasNextPage]
  );

  // Memoizing content list to prevent unnecessary re-renders
  const renderedContents = useMemo(
    () =>
      contents.map((content, index) => {
        const isLastElement = index === contents.length - 1;
        return (
          <div ref={isLastElement ? lastContentElementRef : null} key={content._id} style={{ width: "100%" }}>
            <ContentCard content={content} userProfile={userProfile} />
          </div>
        );
      }),
    [contents, lastContentElementRef, userProfile]
  );

  if (loading) {
    return (
      <Stack alignItems="center" sx={{ maxWidth: "95%", width: { xs: "95%", sm: "80%", md: "38rem" } }} flex={1} overflow="hidden">
        {[...Array(5)].map((_, index) => (
          <ContentCardSkeleton key={index} />
        ))}
      </Stack>
    );
  }

  return (
    <List sx={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "95%", width: { xs: "95%", sm: "28rem", md: "38rem" } }}>
      {/* <AnimatePresence initial={false}>{renderedContents}</AnimatePresence> */}
      {renderedContents}
      {showFeedLogo && !contents.length && <NoFeedMsg textMsg="No more content" />}
      {isFetchingNextPage && (
        <Stack mt={2} alignItems="center">
          <Typography variant="body2">Loading more...</Typography>
        </Stack>
      )}
    </List>
  );
};

export default ContentFeed;
