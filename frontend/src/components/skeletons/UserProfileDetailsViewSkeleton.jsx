import React from "react";
import { Card, Stack, Box, Skeleton, Divider } from "@mui/material";

const UserProfileDetailsViewSkeleton = () => {
  return (
    <Stack mt="1rem" alignItems="center" spacing={4}>
      {/* Personal Details Card Skeleton */}
      <Card
        sx={{
          width: "90%",
          p: 4,
          boxShadow: 3,
          borderRadius: "1rem",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              maxWidth: "20rem",
              flexDirection: "column",
            }}
          >
            <Skeleton
              variant="circular"
              sx={{
                width: { xs: 80, md: 150 },
                height: { xs: 80, md: 150 },
              }}
            />
          </Box>
          <Stack flex={1} spacing={3}>
            <Skeleton
              variant="text"
              sx={{
                width: { xs: "50%", md: "40%" },
                height: 24,
              }}
            />
            <Divider />
            <Stack spacing={2}>
              {[1, 2, 3, 4, 5].map((key) => (
                <Skeleton
                  key={key}
                  variant="rectangular"
                  sx={{
                    width: "100%",
                    height: { xs: 32, md: 36 },
                    borderRadius: "4px",
                  }}
                />
              ))}
            </Stack>
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Skeleton
                variant="rectangular"
                sx={{
                  width: { xs: 80, md: 100 },
                  height: { xs: 32, md: 36 },
                  borderRadius: "4px",
                }}
              />
              <Skeleton
                variant="rectangular"
                sx={{
                  width: { xs: 80, md: 100 },
                  height: { xs: 32, md: 36 },
                  borderRadius: "4px",
                }}
              />
            </Stack>
          </Stack>
        </Stack>
      </Card>

      {/* Hobbies Card Skeleton */}
      <Card
        sx={{
          width: "90%",
          p: 4,
          boxShadow: 3,
          borderRadius: "1rem",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems="center">
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              maxWidth: "20rem",
            }}
          >
            <Skeleton
              variant="circular"
              sx={{
                width: { xs: 80, md: 150 },
                height: { xs: 80, md: 150 },
              }}
            />
          </Box>
          <Stack flex={1} spacing={3}>
            <Skeleton
              variant="text"
              sx={{
                width: { xs: "50%", md: "40%" },
                height: 24,
              }}
            />
            <Divider />
            <Stack direction="row" spacing={1} flexWrap="wrap" gap="1rem">
              {[...Array(8)].map((_, index) => (
                <Skeleton
                  key={index}
                  variant="rectangular"
                  sx={{
                    width: { xs: 60, md: 80 },
                    height: { xs: 20, md: 24 },
                    borderRadius: "12px",
                    cursor: "pointer",
                  }}
                />
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
};

export default UserProfileDetailsViewSkeleton;
