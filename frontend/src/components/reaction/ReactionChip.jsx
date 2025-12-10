/* eslint-disable react/prop-types */
import React, { useCallback, useContext, useEffect, useRef, useState, memo } from "react";
import Lottie from "lottie-react";
import { Card, Chip, useMediaQuery } from "@mui/material";
import ThumbUpRoundedIcon from "@mui/icons-material/ThumbUpRounded";
import ReactionMenu from "./ReactionMenu";
import reactionAnimations from "../../constants/reactionAnimationList";
import { useToggleReaction } from "../../hooks/content/contentReaction";
import { AnimatePresence } from "motion/react";
import { isSameDay } from "date-fns";

const ReactionChip = ({ content, userReaction, setShowReactedAnimation }) => {
  // Get the content ID and the owner (target) user id.
  const { _id: contentId, type: contentType } = content || {};

  const isBelow480 = useMediaQuery("(max-width:480px)");

  const targetUserId = content?.user?._id;

  // Get whether the current user has already reacted.
  const currentAnimation = userReaction ? reactionAnimations.find((anim) => anim.name === userReaction.type) : null;

  // Hooks for toggling the userReaction and creating a notification.
  const { mutate: toggleReaction, isPending: isTogglingReaction } = useToggleReaction({ type: content.type });

  // Use the passed-in userProfile instead of calling useUserProfile here.

  // Local state to track if the userReaction menu is open.
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // A ref for the container so we can detect outside clicks.
  const containerRef = useRef(null);
  // Create a unique ID for this chip (used in the global event).
  const uniqueIdRef = useRef(`userReaction-chip-${Math.random().toString(36)}`);
  const myId = uniqueIdRef.current;

  // When the mouse enters the container, open the menu and dispatch an event so that
  // any other ReactionChip (listening globally) will close its menu.
  const handleMouseEnter = useCallback(() => {
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent("reactionMenuOpened", { detail: { id: myId } }));
      setIsMenuOpen(true);
    });
  }, [myId]);

  // Close the menu on mouse leave.
  const handleMouseLeave = () => {
    setIsMenuOpen(false);
  };

  // Listen for the custom event. If another ReactionChip’s menu opens, close this one.
  useEffect(() => {
    const handleGlobalReactionMenuOpened = (event) => {
      if (event.detail.id !== myId) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("reactionMenuOpened", handleGlobalReactionMenuOpened);
    return () => {
      window.removeEventListener("reactionMenuOpened", handleGlobalReactionMenuOpened);
    };
  }, [myId]);

  // Close the menu when clicking outside the container.
  useEffect(() => {
    let frameId;
    const handleDocumentClick = (event) => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
          setIsMenuOpen(false);
        }
      });
    };
    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  // Called when a userReaction icon is selected from the ReactionMenu.
  const handleReactIconClick = useCallback(
    (emojiName) => {
      if (!emojiName || isTogglingReaction) return;
      toggleReaction({ contentId, type: emojiName, targetUserId, contentType });
    },
    [isTogglingReaction, toggleReaction, contentId, targetUserId, contentType]
  );

  // When the chip itself is clicked, toggle the default "like" userReaction (or remove it).
  const handleToggleReactionClick = useCallback(() => {
    if (isTogglingReaction) return;
    if (userReaction) {
      // Remove the userReaction.
      toggleReaction({ contentId, targetUserId, contentType });
    } else {
      // Add a default "like" userReaction.
      toggleReaction(
        { contentId, type: "like", targetUserId, contentType },
        {
          onSuccess: (data) => {
            const isReacted = data.reactionDetails.isReacted;
            if (isReacted) {
              setShowReactedAnimation(true);
            }
          },
        }
      );
    }
  }, [isTogglingReaction, userReaction, toggleReaction, contentId, targetUserId, contentType, setShowReactedAnimation]);

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block", width: "100%" }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Chip
        icon={userReaction && currentAnimation ? <Lottie animationData={currentAnimation.animationData} autoplay loop style={{ height: 24, width: 24 }} /> : <ThumbUpRoundedIcon />}
        label={userReaction ? "Reacted" : "React"}
        onClick={handleToggleReactionClick}
        variant={userReaction ? "filled" : "outlined"}
        disabled={isTogglingReaction}
        sx={{
          width: "100%",
          backgroundColor: userReaction ? "secondary.main" : "default",
          color: userReaction ? "white" : "inherit",
          "&:hover": {
            backgroundColor: userReaction ? "secondary.light" : "default",
          },
          fontWeight: userReaction ? "bold" : "normal",
        }}
      />
      <AnimatePresence>
        {isMenuOpen && (
          <Card
            sx={{
              position: "absolute",
              top: "-4.4rem",
              left: isBelow480 ? "100%" : { sm: "50%", xs: "50%" },
              transform: "translateX(-50%)",
              borderRadius: "3rem",
              p: ".2rem",
              bgcolor: "#FFFFFFB3",
            }}
          >
            <ReactionMenu onSelect={handleReactIconClick} />
          </Card>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(ReactionChip);
