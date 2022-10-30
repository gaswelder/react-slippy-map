import React, { useCallback, useEffect, useRef, useState } from "react";
import { ControlledSlippyMap } from "./ControlledSlippyMap";

const containerStyle = {
  position: "relative",
  height: "100%",
  minHeight: "1em",
  overflow: "hidden",
};

export const SlippyMap = ({
  zoom = 16,
  defaultCenter = { latitude: 53.9049, longitude: 27.5609 },
  onAreaChange,
  onWheel,
  ...props
}) => {
  // Current size of the map's container element.
  const [containerSize, setContainerSize] = useState([0, 0]);

  const [center, setCenter] = useState(defaultCenter);
  const containerRef = useRef(null);

  useEffect(() => {
    const c = containerRef.current;
    // When the map is mounted, get its container and measure its size.
    //
    // This will trigger a rerender, but this is exactly what we need since the
    // first render returnes nothing because the container is still missing.
    setContainerSize([c.offsetWidth, c.offsetHeight]);
  }, [containerRef.current]);

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
    <div style={containerStyle} ref={containerRef}>
      {containerRef.current && (
        <ControlledSlippyMap
          {...props}
          onAreaChange={$onAreaChange}
          center={center}
          onWheel={onWheel}
          zoom={zoom}
          containerSize={containerSize}
          containerElement={containerRef.current}
        />
      )}
    </div>
  );
};
