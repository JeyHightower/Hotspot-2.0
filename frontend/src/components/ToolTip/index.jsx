import React from "react";
import "./ToolTip.css";

const ToolTip = ({ text, children }) => {
  return (
    <div className="tooltip-container">
      {children}
      <div className="tooltip-text">{text}</div>
    </div>
  );
};

export default ToolTip;
