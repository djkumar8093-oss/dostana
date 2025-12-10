import { useContext } from "react";
import ContentContext from "./ContentContext";

const useContentStack = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContentStack must be used within a ContentProvider");
  }
  return context;
};

export default useContentStack;
