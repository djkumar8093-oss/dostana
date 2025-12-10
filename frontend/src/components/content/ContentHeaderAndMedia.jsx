/* eslint-disable react/prop-types */
import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import ReactPlayer from "react-player";

const ContentHeaderAndMedia = ({ children, content }) => {
  const { media = [], caption, type } = content || {};

  return (
    <Box sx={{ overflowY: "auto", maxHeight: "calc(100vh - 4rem)" }}>
      {type === "thought" ? (
        <>
          {media.length > 0 && (
            <Stack
              direction="row"
              gap={2}
              sx={{
                overflowX: "auto",
                "&::-webkit-scrollbar": { display: "none" },
                msOverflowStyle: "none",
                width: "95%",
                mt: 1,
              }}
            >
              {media.map(({ url, type: mediaType }, index) => (
                <Box
                  key={index}
                  sx={{
                    height: "8rem",
                    width: "8rem",
                    cursor: "pointer",
                    bgcolor: "#000",
                    borderRadius: ".4rem",
                    position: "relative",
                  }}
                >
                  {mediaType === "image" ? (
                    <Box
                      component="img"
                      src={url}
                      sx={{
                        height: "100%",
                        width: "100%",
                        objectFit: "contain",
                        borderRadius: ".4rem",
                      }}
                    />
                  ) : (
                    <ReactPlayer url={url} width="100%" height="100%" controls style={{ borderRadius: ".4rem", overflow: "hidden" }} />
                  )}
                </Box>
              ))}
            </Stack>
          )}
          {caption && (
            <Typography variant="body2" sx={{ mt: 2, wordBreak: "break-word" }}>
              {caption}
            </Typography>
          )}
        </>
      ) : (
        // For Posts: caption appears first, then media is rendered in a grid-like layout.
        <>
          {caption && (
            <Typography
              variant="body2"
              sx={{
                mt: 2,
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {caption}
            </Typography>
          )}
          {media.length > 0 && (
            <Stack
              sx={{
                height: { md: "26rem", sm: "18rem", xs: "14rem" },
                width: "100%",
                overflow: "hidden",
                mt: "1rem",
                display: "flex",
                flexDirection: "row",
                gap: "0.5rem",
              }}
            >
              {media.map(({ url, type: mediaType }, index) => (
                <Box
                  key={index}
                  sx={{
                    height: "100%",
                    width: media.length > 1 ? "calc(100% / 2)" : "100%",
                    bgcolor: "#000",
                    position: "relative",
                  }}
                >
                  {mediaType === "image" ? (
                    <Box
                      component="img"
                      src={url}
                      sx={{
                        height: "100%",
                        width: "100%",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <ReactPlayer url={url} width="100%" height="100%" controls style={{ objectFit: "contain" }} />
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </>
      )}
      {children}
    </Box>
  );
};

export default ContentHeaderAndMedia;
