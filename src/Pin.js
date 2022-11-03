import React from "react";
import { Context } from "./Context";
import Projection from "./mercator";

// Generic container for any content that can be put on the map.
export default function Pin({ coords, children, ...rest }) {
  return (
    <Context.Consumer>
      {({ zoom, halfSize, XC, YC }) => {
        const x = Projection.getX(coords.longitude, zoom);
        const y = Projection.getY(coords.latitude, zoom);
        // X(C) - w/2 + left = x
        // left = x + w/2 - X(C)
        return (
          <div
            {...rest}
            style={{
              position: "absolute",
              left: x + halfSize[0] - XC,
              top: y + halfSize[1] - YC,
            }}
          >
            {children}
          </div>
        );
      }}
    </Context.Consumer>
  );
}
