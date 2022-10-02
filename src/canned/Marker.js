import React from "react";
import Pin from "../Pin";
import { boxShadow } from "./style";

function Marker({ coords, color = "#0091ff", ...rest }) {
  const style = {
    background: color,
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    boxShadow,
    transform: "translate(-8px, -8px)",
    cursor: "pointer",
  };
  return (
    <Pin coords={coords}>
      <div style={style} {...rest} />
    </Pin>
  );
}

export default Marker;
