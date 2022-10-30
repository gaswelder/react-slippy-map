import React, { useEffect, useRef, useState } from "react";
import { ControlledSlippyMap } from "./ControlledSlippyMap";

const containerStyle = {
  position: "relative",
  height: "100%",
  minHeight: "1em",
  overflow: "hidden",
};

export const SlippyMap = ({
  zoom = 16,
  center = { latitude: 53.9049, longitude: 27.5609 },
  onMove,
  onAreaChange,
  onWheel,
  ...props
}) => {
  const [containerSize, setContainerSize] = useState([0, 0]);
  const containerRef = useRef(null);
  useEffect(() => {
    const c = containerRef.current;
    // When the map is mounted, get its container and measure its size.
    //
    // This will trigger a rerender, but this is exactly what we need since the
    // first render returnes nothing because the container is still missing.
    setContainerSize([c.offsetWidth, c.offsetHeight]);
  }, [containerRef.current]);

  return (
    <div style={containerStyle} ref={containerRef}>
      {containerRef.current && (
        <ControlledSlippyMap
          {...props}
          onAreaChange={onAreaChange}
          onMove={onMove}
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
