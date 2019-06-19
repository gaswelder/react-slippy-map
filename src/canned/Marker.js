import React from "react";
import pinned from "../pinned";
import { boxShadow } from "./style";

function Marker(props) {
  const style = {
    background: props.color || "#0091ff",
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    boxShadow,
    transform: "translate(-8px, -8px)"
  };
  return <div style={style} />;
}

export default pinned(Marker);
