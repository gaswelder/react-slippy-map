import React from "react";
import pinned from "../pinned";
import { boxShadow } from "./style";

function InfoBox(props) {
  const { children, up, ...rest } = props;

  const style = {
    background: "white",
    boxShadow,
    padding: "10px",
    borderRadius: "6px",
    maxWidth: "400px",
    position: "absolute"
  };
  if (up) {
    style.bottom = "0px";
  }
  return (
    <div style={style} {...rest}>
      {children}
    </div>
  );
}

export default pinned(InfoBox);
