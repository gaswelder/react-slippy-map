import React from "react";
import Pin from "./Pin";
import Projection from "./mercator";
import { Context } from "./Context";

function encodePath(points) {
  let l = "M " + points[0];
  for (let i = 1; i < points.length; i++) {
    l += " L " + points[i];
  }
  return l;
}

function Path(props) {
  const { points, color = "orange" } = props;

  if (points.length < 1) {
    return null;
  }

  if (points.length < 2) {
    return (
      <Pin coords={points[0]}>
        <div
          style={{
            translate: "-2px -2px",
            backgroundColor: color,
            width: "4px",
            height: "4px"
          }}
        />
      </Pin>
    );
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

        const size = [
          Math.max(...xys.map(p => p[0])),
          Math.max(...xys.map(p => p[1]))
        ];

        // Convert left top coordinate back to latitude and longitude.
        const O = Projection.getLatLon(corner, zoom);

        return (
          <Pin coords={O}>
            <svg width={size[0]} height={size[1]}>
              <path
                d={encodePath(xys)}
                fill="none"
                stroke={color}
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
