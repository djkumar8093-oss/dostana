import { angryReact, careReact, heartReact, laughReact, likeReact } from "../animation";

const reactionAnimations = [
  { name: "like", animationData: likeReact },
  { name: "heart", animationData: heartReact },
  { name: "care", animationData: careReact },
  { name: "angry", animationData: angryReact },
  { name: "laugh", animationData: laughReact },
];
export default reactionAnimations;
