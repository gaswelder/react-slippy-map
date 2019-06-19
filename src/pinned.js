import React from "react";
import Pin from "./Pin";

export default function pinned(Component) {
  let f = function(props) {
    if (!props.coords) {
      console.error(
        `Missing "coords" property from the pinned version of "${
          Component.name
        }"`
      );
    }
    // The pin only requires coords, offset and zoom properties.
    // The rest is for the underlying element.
    // Remember we need offset and zoom only internally.
    let pinKeys = ["coords", "offset", "zoom"];
    let pinProps = {};
    let restProps = Object.assign({}, props);
    for (let k of pinKeys) {
      pinProps[k] = props[k];
      delete restProps[k];
    }
    return (
      <Pin {...pinProps}>
        <Component {...restProps} />
      </Pin>
    );
  };
  f._isPinned = true;
  return f;
}
