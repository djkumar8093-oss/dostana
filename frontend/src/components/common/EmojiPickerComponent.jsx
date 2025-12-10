/* eslint-disable react/prop-types */
import React from "react";
import EmojiPicker from "emoji-picker-react";
import { Stack, useMediaQuery } from "@mui/material";

const EmojiPickerComponent = ({ onEmojiClick }) => {
  const isXs = useMediaQuery("(max-width:460px)");

  return (
    <Stack component={"div"} mt={"1rem"} sx={{ "& .EmojiPickerReact": { "--epr-emoji-size": isXs ? "20px" : "32px" } }}>
      <Stack>
        <EmojiPicker onEmojiClick={onEmojiClick} width={"100%"} reactionsDefaultOpen={true} />
      </Stack>
    </Stack>
  );
};

export default React.memo(EmojiPickerComponent);
