import React from "react";
import Projection from "./mercator";
import report from "./report";
import { Context } from "./Context";

// Generic container for any content that can be put on the map.
export default function Pin(props) {
  const { coords, children, ...rest } = props;

  return (
    <Context.Consumer>
      {({ zoom, offset }) => {
        if (!offset || !zoom) {
          report.internalFault(
            "the pin didn't receive offset or zoom properties"
          );
          return null;
        }

        // Get projection coordinates and subtract our coordinates offset.
        let px = Projection.getX(coords.longitude, zoom) - offset.x;
        let py = Projection.getY(coords.latitude, zoom) - offset.y;

        let style = {
          position: "absolute",
          left: px + "px",
          top: py + "px"
        };

        return (
          <div {...rest} style={style}>
            {children}
          </div>
        );
      }}
    </Context.Consumer>
  );
}
