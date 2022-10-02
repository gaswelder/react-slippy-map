import React, { useCallback, useEffect, useRef, useState } from "react";
import { ControlledSlippyMap } from "./ControlledSlippyMap";

const containerStyle = {
  position: "relative",
  height: "100%",
};

const zoomStyle = {
  position: "absolute",
  right: "10px",
  bottom: "10px",
};

const rootStyle = {
  minHeight: "1em",
  height: "100%",
  position: "relative",
  overflow: "hidden",
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
  defaultCenter = { latitude: 53.9049, longitude: 27.5609 },
  onAreaChange,
  ...props
}) => {
  // Current size of the map's container element.
  const [containerSize, setContainerSize] = useState([0, 0]);

  // Current high-level state of the map.
  const [zoom, setZoom] = useState(defaultZoom);
  const [center, setCenter] = useState(defaultCenter);

  const ignoreWheelUntil = useRef(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const c = containerRef.current;
    // When the map is mounted, get its container and measure its size.
    //
    // This will trigger a rerender, but this is exactly what we need since the
    // first render returnes nothing because the container is still missing.
    setContainerSize([c.offsetWidth, c.offsetHeight]);
  }, [containerRef.current]);

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

  const $onAreaChange = useCallback(
    (area) => {
      setCenter(area.center);
      if (onAreaChange) {
        onAreaChange(area);
      }
    },
    [onAreaChange]
  );

  return (
    <div style={containerStyle}>
      <div style={rootStyle} ref={containerRef}>
        {containerRef.current && (
          <ControlledSlippyMap
            {...props}
            onAreaChange={$onAreaChange}
            center={center}
            onWheel={$onWheel}
            zoom={zoom}
            containerSize={containerSize}
            containerElement={containerRef.current}
          />
        )}
      </div>
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
