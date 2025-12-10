import { IconButton, Stack, Tooltip } from "@mui/material";
import Lottie from "lottie-react";
import reactionAnimations from "../../constants/reactionAnimationList";
import { motion } from "motion/react";
import React from "react";

// Define the animation variants for entry and exit.
const menuVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.8, y: 10, transition: { duration: 0.15 } },
};

const ReactionMenu = ({ onSelect }) => {
  return (
    <motion.div variants={menuVariants} initial="hidden" animate="visible" exit="exit">
      <Stack flexDirection="row" justifyContent="center" alignItems="center">
        {reactionAnimations.map((icon) => (
          <Tooltip key={icon.name} title={icon.name.charAt(0).toUpperCase() + icon.name.slice(1)}>
            <IconButton onClick={() => onSelect(icon.name)}>
              <Stack sx={{ height: { sm: "2.6rem", xs: "2rem" }, width: { sm: "2.6rem", xs: "2rem" } }}>
                <Lottie animationData={icon.animationData} style={{ height: "100%", width: "100%" }} />
              </Stack>
            </IconButton>
          </Tooltip>
        ))}
      </Stack>
    </motion.div>
  );
};

export default React.memo(ReactionMenu);
