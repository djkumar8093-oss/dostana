import React from "react";
import SingleContentModal from "./SingleContentModal";
import { useNavigate, useParams } from "react-router-dom";

const SingleContentViewModal = () => {
  const { contentId } = useParams();
  const navigate = useNavigate();

  return <SingleContentModal contentId={contentId} handleClose={navigate("/home")} open={Boolean(contentId)} />;
};

export default SingleContentViewModal;
