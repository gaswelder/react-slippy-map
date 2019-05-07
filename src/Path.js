import React from "react";
import Pin from "./Pin";
import Projection from "./mercator";
import { Context } from "./Context";
import { Marker } from "./elements";

function encodePath(points) {
  let l = "M " + points[0];
  for (let i = 1; i < points.length; i++) {
    l += " L " + points[i];
  }
  return l;
}

function Path(props) {
  const { points } = props;

  console.log(points);

  if (points.length == 1) {
    return (
      <Pin coords={points[0]}>
        <Marker />
      </Pin>
    );
  }

  if (points.length < 2) {
    return null;
  }

  return (
    <Context.Consumer>
      {({ zoom }) => {
        // Convert all points to rectangular coordinates.
        const XYS = points.map(p => Projection.getXY(p, zoom));

        // Find the left top coordinate of the bounding box.
        const corner = [
          Math.min(...XYS.map(p => p[0])),
          Math.min(...XYS.map(p => p[1]))
        ];

        // Make all coordinates relative to the box.
        const xys = XYS.map(xy => [xy[0] - corner[0], xy[1] - corner[1]]);

        const O = Projection.getLatLon(corner, zoom);
        const size = [
          Math.max(...xys.map(p => p[0])),
          Math.max(...xys.map(p => p[1]))
        ];

        return (
          <Pin coords={O}>
            <svg
              width={size[0]}
              height={size[1]}
              style={{ outline: "thin solid red" }}
            >
              <path
                d={encodePath(xys)}
                fill="none"
                stroke="#ff6200"
                strokeWidth="4"
              />
            </svg>
          </Pin>
        );
      }}
    </Context.Consumer>
  );
}

export default Path;
