import { Stack, Typography, Button } from "@mui/material";
import { useState, useMemo, useEffect } from "react";
import { useGetContents } from "../../hooks/content/content";
import Lottie from "lottie-react";
import { emptyFeedAnimation } from "../../animation";
import HomePageToolBar from "../layout/HomePageToolBar";
import ContentFeed from "../content/ContentFeed";
import usePushNotification from "../../hooks/usePushNotification";

const Home = () => {
  const [firstPostOpenModal, setFirstPostOpenModal] = useState(false);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetContents();

  // Flatten the content from all pages
  const contents = useMemo(() => {
    if (!data || !data.pages) return [];
    return data.pages.flatMap((page) => page.contents || []);
  }, [data]);

  usePushNotification();

  return (
    <Stack alignItems={"center"}>
      <HomePageToolBar firstPostOpenModal={firstPostOpenModal} setFirstPostOpenModal={setFirstPostOpenModal} />
      <Stack alignItems="center" pb="1rem" width="100%">
        {isLoading ? (
          <ContentFeed loading />
        ) : contents.length > 0 ? (
          <ContentFeed contents={contents} fetchNextPage={fetchNextPage} hasNextPage={hasNextPage} isFetchingNextPage={isFetchingNextPage} />
        ) : (
          <Stack alignItems="center" spacing={3} sx={{ mt: "6rem", textAlign: "center" }}>
            <Lottie animationData={emptyFeedAnimation} style={{ height: "10rem", width: "100%" }} autoplay loop={false} />
            <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: ".8rem", sm: "1rem", md: "1.6rem" } }}>
              Ohh! Looks like you're the first user.
            </Typography>
            <Button variant="contained" size="large" color="secondary" onClick={() => setFirstPostOpenModal(true)} sx={{ borderRadius: "2rem", textTransform: "none", px: 4, py: 1 }}>
              Create the first post
            </Button>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

export default Home;
