import React, { useMemo, useState, useRef, useCallback } from "react";
import { ControlledSlippyMap } from "./ControlledSlippyMap";
import withOwnCenter from "./withOwnCenter";

const containerStyle = {
  position: "relative",
  height: "100%",
};

const zoomStyle = {
  position: "absolute",
  right: "10px",
  bottom: "10px",
};

const clamp = (min, max, val) => {
  let r = val;
  if (r > max) r = max;
  if (r < min) r = min;
  return r;
};

export const SlippyMap = ({
  minZoom = 2,
  maxZoom = 20,
  zoomStep = 0.1,
  defaultZoom = 16,
  ...props
}) => {
  const M = useMemo(() => {
    let M = ControlledSlippyMap;
    if (props.center == undefined) {
      M = withOwnCenter(M);
    }
    return M;
  }, [props.center == undefined, props.zoom == undefined]);

  const [zoom, setZoom] = useState(defaultZoom);
  const ignoreWheelUntil = useRef(0);

  const $handleZoomChange = useCallback(
    (val) => {
      setZoom(clamp(minZoom, maxZoom, Math.round(val * 100) / 100));
    },
    [minZoom, maxZoom]
  );

  const $onWheel = useCallback(
    (event) => {
      // Throttle barrier
      if (
        ignoreWheelUntil.current &&
        event.timeStamp < ignoreWheelUntil.current
      ) {
        return;
      }
      let delay = 33 + zoomStep * 166;
      if (delay > 200) delay = 200;
      ignoreWheelUntil.current = event.timeStamp + delay;
      $handleZoomChange(event.deltaY > 0 ? zoom - zoomStep : zoom + zoomStep);
    },
    [ignoreWheelUntil.current, zoom, zoomStep]
  );
  return (
    <div style={containerStyle}>
      <M zoom={zoom} onWheel={$onWheel} {...props} />
      <div style={zoomStyle}>
        ({zoom})
        <input
          type="range"
          min={minZoom}
          max={maxZoom}
          step={zoomStep}
          value={zoom}
          onChange={(e) => {
            $handleZoomChange(e.target.value);
          }}
        />
      </div>
    </div>
  );
};
