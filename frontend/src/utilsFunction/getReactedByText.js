const getReactedByText = ({ reactionDetails, userProfile }) => {
  const totalReactions = reactionDetails?.totalReactions || 0;
  const reactions = reactionDetails?.reactions || [];
  const userReaction = reactionDetails?.reactions?.find((reaction) => reaction.user?._id === userProfile._id) || null;

  if (totalReactions === 0) return "";

  if (userReaction) {
    if (totalReactions === 2) {
      const otherUser = reactions.find((reaction) => reaction?.user?._id !== userProfile?._id);
      return `Reacted by You and ${otherUser?.user?.firstName}`;
    } else if (totalReactions > 2) {
      const otherUser = reactions.find((reaction) => reaction?.user?._id !== userProfile?._id);
      return `Reacted by You, ${otherUser?.user?.firstName} and ${totalReactions - 2} others`;
    } else {
      return "Reacted by You";
    }
  } else {
    if (totalReactions === 2) {
      const [firstUser, secondUser] = reactions;
      return `Reacted by ${firstUser?.user?.firstName} and ${secondUser?.user?.firstName}`;
    } else if (totalReactions > 2) {
      const [firstUser] = reactions;
      return `Reacted by ${firstUser?.user?.firstName} and ${totalReactions - 1} others`;
    } else {
      const [onlyUser] = reactions;
      return `Reacted by ${onlyUser?.user?.firstName}`;
    }
  }
};
export default getReactedByText;
