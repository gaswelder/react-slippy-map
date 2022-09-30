import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Context } from "./Context";
import DraggableDiv from "./DraggableDiv";
import Projection from "./mercator";
import report from "./report";
import { TilesLayer } from "./TilesLayer";

const rootStyle = {
  minHeight: "1em",
  height: "100%",
  position: "relative",
  overflow: "hidden",
};

export const ControlledSlippyMap = (props) => {
  // Current size of the map's container element.
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
    <div style={rootStyle} ref={containerRef}>
      {containerRef.current && (
        <Layer
          {...props}
          containerSize={containerSize}
          containerElement={containerRef.current}
        />
      )}
    </div>
  );
};

const Layer = ({
  containerSize,
  containerElement,
  baseTilesUrl,
  zoom,
  center,
  onAreaChange,
  onWheel,
  onClick,
  children,
}) => {
  if (!baseTilesUrl) {
    report.propsFault("missing baseTilesUrl prop for slippy map");
  }
  const lat = center.latitude;
  const lon = center.longitude;
  const halfSize = [containerSize[0] / 2, containerSize[1] / 2];

  // Object describing currently visible area in coordinates.
  const $area = useMemo(() => {
    return {
      leftTop: coordinatesAtOffset(center, zoom, -halfSize[0], -halfSize[1]),
      rightBottom: coordinatesAtOffset(center, zoom, halfSize[0], halfSize[1]),
    };
  }, [center, zoom, halfSize[0], halfSize[1]]);

  const $offset = useMemo(() => {
    return {
      x: Math.round(Projection.getX(center.longitude, zoom) / 10000) * 10000,
      y: Math.round(Projection.getY(center.latitude, zoom) / 10000) * 10000,
    };
  }, [center.latitude, center.longitude, zoom]);

  const left = halfSize[0] - Projection.getX(lon, zoom) + $offset.x;
  const top = halfSize[1] - Projection.getY(lat, zoom) + $offset.y;

  // Processes click events and passes the to the listener in the props.
  const $handleClick = useCallback(
    (event) => {
      if (!onClick) {
        return;
      }
      // Find out the click event's offset from the center.
      const rect = containerElement.getBoundingClientRect();
      const x = event.pageX - rect.x;
      const y = event.pageY - rect.y;
      const dx = x - halfSize[0];
      const dy = y - halfSize[1];
      const clickCoords = coordinatesAtOffset(center, zoom, dx, dy);
      onClick(clickCoords);
    },
    [containerElement, halfSize[0], halfSize[1], onClick, center, zoom]
  );

  // Preprocesses dragging events and calls the listener in the props.
  const $handleMove = useCallback(
    (event) => {
      if (!onAreaChange) {
        return;
      }
      onAreaChange({
        center: coordinatesAtOffset(center, zoom, -event.dx, -event.dy),
        ...$area,
      });
    },
    [onAreaChange, center, zoom, $area]
  );

  useEffect(() => {
    if (!onAreaChange) {
      return;
    }
    onAreaChange({ center, ...$area });
  }, [onAreaChange, center, $area]);

  const $layerStyle = useMemo(() => {
    return {
      position: "absolute",
      left: `${left}px`,
      top: `${top}px`,
    };
  }, [left, top]);

  const $contextValue = useMemo(() => {
    return { zoom, offset: $offset };
  }, [zoom, center.latitude, center.longitude]);

  return (
    <Context.Provider value={$contextValue}>
      <DraggableDiv
        style={$layerStyle}
        onClick={$handleClick}
        onMove={$handleMove}
        onWheel={onWheel}
      >
        <TilesLayer
          baseUrl={baseTilesUrl}
          zoom={zoom}
          area={$area}
          offset={$offset}
        />
        <div className="objects-container">{children}</div>
      </DraggableDiv>
    </Context.Provider>
  );
};

// Returns latitude and longitude corresponding to the point
// at [x,y] pixels from the current map center.
const coordinatesAtOffset = (center, zoom, x, y) => {
  // Get coordinates of our center on the projection cylinder.
  let lat1 = center.latitude;
  let lon1 = center.longitude;
  let mx = Projection.getX(lon1, zoom);
  let my = Projection.getY(lat1, zoom);
  // Apply the offset to the projection coordinates and get the
  // corresponding latitude and longitude.
  return {
    latitude: Projection.getLat(my + y, zoom),
    longitude: Projection.getLon(mx + x, zoom),
  };
};

// // Returns offset [x,y] in pixels from the current map center
// // corresponding to the given coordinates.
// const offsetAtCoordinates = ({ latitude, longitude }) => {
//   // Get location of our center on the projection
//   let px = Projection.getX(center.longitude, zoom);
//   let py = Projection.getY(center.latitude, zoom);

//   // Get location of the given point on the projection
//   let cx = Projection.getX(longitude, zoom);
//   let cy = Projection.getY(latitude, zoom);

//   // Get the difference
//   let dx = cx - px;
//   let dy = cy - py;
//   return [dx, dy];
// };
