import React, { createContext, useReducer } from "react";

const ContentContext = createContext();

const initialState = [];

function contentReducer(state, action) {
  switch (action.type) {
    case "ADD_CONTENT":
      return [...state, action.payload];
    case "REMOVE_CONTENT":
      return state.filter((content) => content.id !== action.payload);
    case "UPDATE_CONTENT":
      return state.map((content) => (content.id === action.payload.id ? { ...content, ...action.payload.updates } : content));
    default:
      return state;
  }
}

export const ContentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(contentReducer, initialState);

  const addContent = (content) => dispatch({ type: "ADD_CONTENT", payload: content });
  const removeContent = (id) => dispatch({ type: "REMOVE_CONTENT", payload: id });
  const updateContent = (id, updates) => dispatch({ type: "UPDATE_CONTENT", payload: { id, updates } });

  return <ContentContext.Provider value={{ contentList: state, addContent, removeContent, updateContent }}>{children}</ContentContext.Provider>;
};

export default ContentContext;
