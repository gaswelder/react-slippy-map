import React from "react";
import Pin from "../Pin";
import { boxShadow } from "./style";

function InfoBox({ coords, children, up, ...rest }) {
  const style = {
    background: "white",
    boxShadow,
    padding: "10px",
    borderRadius: "6px",
    maxWidth: "400px",
    position: "absolute",
  };
  if (up) {
    style.bottom = "0px";
  }
  return (
    <Pin coords={coords}>
      <div style={style} {...rest}>
        {children}
      </div>
    </Pin>
  );
}

export default InfoBox;
