import React from "react";
import InfoBox from "./InfoBox";

function Label(props) {
  const { text, ...rest } = props;
  return <InfoBox {...rest}>{text}</InfoBox>;
}

export default Label;
