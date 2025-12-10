/* eslint-disable react/prop-types */
import { Button, Stack, Typography } from "@mui/material";
import Lottie from "lottie-react";
import React, { useState } from "react";
import { addFirstPostAnimation } from "../../animation";
import PostCreationModal from "../post/PostCreationModal";
const UserNoContentMsg = ({ isUserPostedContent = false }) => {
  const [showPostModal, setShowPostModal] = useState(false);

  return (
    <Stack alignItems={"center"} justifyContent={"center"}>
      <Lottie animationData={addFirstPostAnimation} style={{ height: { md: "20rem", xs: "15rem" }, width: { md: "20rem", xs: "15rem" } }} loop={true} autoPlay={true} />
      <Stack sx={{ transform: "translateY(-2rem)" }} justifyContent={"center"} alignItems={"center"}>
        {!isUserPostedContent && (
          <Typography variant="body2" fontWeight={"bold"}>
            {"You have not added any post yet"}
          </Typography>
        )}
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setShowPostModal(true)}
          sx={{
            paddingX: "2.4rem",
            fontSize: ".8rem",
            fontWeight: "bold",
            borderRadius: ".4rem",
            mt: "1rem",
          }}
        >
          {isUserPostedContent ? "Add Post" : "Add First Post"}
        </Button>
      </Stack>
      {showPostModal && <PostCreationModal handleClose={() => setShowPostModal(false)} open={showPostModal} />}
    </Stack>
  );
};

export default UserNoContentMsg;
