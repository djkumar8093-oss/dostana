import React, { useCallback, useState } from "react";
import { Avatar, Dialog, DialogTitle, IconButton, Stack, TextField, Tooltip, Typography, Box, InputAdornment, Button, useMediaQuery } from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import EmojiPickerComponent from "../common/EmojiPickerComponent";
import { useCreateContent } from "../../hooks/content/content";
import { secondaryShareIcon } from "../../assets";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

const MAX_IMAGES = 6;

// eslint-disable-next-line react/prop-types
const ThoughtCreationModal = ({ open, handleClose }) => {
  const [images, setImages] = useState([]);
  const [thought, setThought] = useState("");
  const [error, setError] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { mutate: createContent } = useCreateContent({ handleClose, type: "tweet" });
  const { isPosting } = useSelector((state) => state.alert);

  const isBelow900 = useMediaQuery("(max-width:900px)");
  const isBelow480 = useMediaQuery("(max-width:480px)");

  // Handle image file selection
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files).slice(0, MAX_IMAGES);
    setImages((prev) => [...prev, ...selectedFiles].slice(0, MAX_IMAGES));
    event.target.value = null; // Clear file input for re-selection
  };

  // Handle image deletion
  const handleDeleteImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle content submission with extra create content logic
  const handleSubmitContent = async () => {
    if (isPosting) {
      setError("A post is already being uploaded. Please try again later.");
      return;
    }
    if (!thought.trim()) {
      setError("Content text is required!");
      return;
    }

    const formData = new FormData();

    // Add multiple files to FormData if available
    if (images.length > 0) {
      images.forEach((image) => formData.append("media", image));
    }

    formData.append("caption", thought);
    formData.append("type", "thought");
    formData.append("mediaType", "image"); // Tweets are limited to images in this case

    // Call createContent and update content status based on the API response
    createContent(formData);
  };

  // Handle emoji selection
  const handleEmojiClick = useCallback((emoji) => {
    setThought((prev) => prev + emoji.emoji);
  }, []);

  // Toggle Emoji Picker visibility
  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  return (
    <Dialog open={open} maxWidth={isBelow900 ? "xs" : "sm"} fullWidth onClose={handleClose}>
      <Stack minHeight="20vh" maxHeight="60vh" sx={{ overflow: "auto", px: { xs: ".6rem", sm: "1rem" }, py: "1rem" }}>
        {/* Header */}
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
          <DialogTitle
            sx={{
              fontWeight: "bold",
              fontFamily: "Poppins",
              fontSize: { xs: "1rem", md: "1.2rem" },
              p: 0,
            }}
          >
            Your Thought
          </DialogTitle>
          <Tooltip title="Share">
            <IconButton
              sx={{
                height: { xs: "1.6rem", md: "3rem" },
                width: { xs: "1.6rem", md: "3rem" },
                mr: "1rem",
              }}
              onClick={handleSubmitContent}
            >
              <Avatar src={secondaryShareIcon} />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Image Previews */}
        {images.length > 0 && (
          <Stack
            direction="row"
            spacing={2}
            mt={2}
            sx={{
              overflowX: "auto",
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
            }}
          >
            {images.map((image, index) => (
              <Box key={index} position="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  style={{
                    width: "8rem",
                    height: "8rem",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleDeleteImage(index)}
                  sx={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    backgroundColor: "white",
                    color: "red",
                    boxShadow: 3,
                    "&:hover": { backgroundColor: "#000", color: "white" },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}

        {/* Content Area */}
        <Stack
          maxHeight="40vh"
          overflow="auto"
          sx={{
            marginTop: "1rem",
            "&::-webkit-scrollbar": { display: "none" },
            msOverflowStyle: "none",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: { xs: ".9rem", sm: "1rem" } }}>
            What's happening?
          </Typography>
          <TextField
            multiline
            placeholder="Write something..."
            variant="standard"
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            error={!!error}
            helperText={error}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Attach Images">
                    <label htmlFor="image-upload">
                      <IconButton component="span">
                        <AttachFileIcon />
                      </IconButton>
                    </label>
                  </Tooltip>
                  <input type="file" id="image-upload" accept="image/*" style={{ display: "none" }} multiple onChange={handleFileChange} />
                  <Tooltip title="Emoji Picker">
                    <IconButton onClick={toggleEmojiPicker}>
                      <EmojiEmotionsIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
          {showEmojiPicker && <EmojiPickerComponent onEmojiClick={handleEmojiClick} />}
        </Stack>

        {/* Post Button */}
        <Stack direction="row" justifyContent="flex-end" spacing={1} mt="1.4rem">
          <Button variant="contained" color="primary" onClick={handleSubmitContent} sx={{ fontWeight: "bold" }} size={isBelow480 ? "small" : "medium"}>
            Share Thought
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
};

export default ThoughtCreationModal;
