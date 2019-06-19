import React from "react";
import pinned from "../pinned";
import { boxShadow } from "./style";

const style = {
  background: "white",
  boxShadow,
  padding: "10px",
  borderRadius: "6px",
  maxWidth: "400px"
};

function InfoBox(props) {
  return <div style={style}>{props.children}</div>;
}

export default pinned(InfoBox);
