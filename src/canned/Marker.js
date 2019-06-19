import React from "react";
import pinned from "../pinned";
import { boxShadow } from "./style";

function Marker(props) {
  const { color = "#0091ff", ...rest } = props;
  const style = {
    background: color,
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    boxShadow,
    transform: "translate(-8px, -8px)",
    cursor: "pointer"
  };
  return <div style={style} {...rest} />;
}

export default pinned(Marker);
