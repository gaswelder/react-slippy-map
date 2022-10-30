import React, { useCallback, useEffect, useMemo } from "react";
import { Context } from "./Context";
import { GestureDiv } from "./GestureDiv";
import Projection from "./mercator";
import report from "./report";

// Length of a map tile's side in pixels
const TileSize = 256;

export const ControlledSlippyMap = ({
  containerSize,
  containerElement,
  baseTilesUrl,
  zoom,
  center,
  onAreaChange,
  onMove,
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

  const $eventCoords = useCallback(
    (event) => {
      const rect = containerElement.getBoundingClientRect();
      const x = event.pageX - rect.x;
      const y = event.pageY - rect.y;
      const dx = x - halfSize[0];
      const dy = y - halfSize[1];
      return coordinatesAtOffset(center, zoom, dx, dy);
    },
    [containerElement, halfSize[0], halfSize[1], center, zoom]
  );

  // Processes click events and passes the to the listener in the props.
  const $handleClick = useCallback(
    (event) => {
      onClick && onClick($eventCoords(event));
    },
    [containerElement, $eventCoords]
  );

  const $handleWheel = useCallback(
    (event) => {
      onWheel && onWheel({ ...event, ...$eventCoords(event) });
    },
    [onWheel, $eventCoords]
  );

  // Preprocesses dragging events and calls the listener in the props.
  const $handleMove = useCallback(
    (event) => {
      if (!onAreaChange && !onMove) {
        return;
      }
      const newcenter = coordinatesAtOffset(center, zoom, -event.dx, -event.dy);
      onMove && onMove(newcenter);
      onAreaChange && onAreaChange({ center: newcenter, ...$area });
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

  const x1 = Projection.getX($area.leftTop.longitude, zoom);
  const x2 = Projection.getX($area.rightBottom.longitude, zoom);
  const y1 = Projection.getY($area.leftTop.latitude, zoom);
  const y2 = Projection.getY($area.rightBottom.latitude, zoom);

  // The entire projection surface is a square with a side size of
  // (TileSize * 2**zoom) pixels. Assuming integer zoom value, there are tiles
  // with indices i,j changing from 0 to 2**zoom. A tile with index i covers x
  // range from (i*TileSize) to ((i+1)*TileSize), and same for the index j.

  // If zoom value is not integer, then we have to use scaled tiles from the
  // nearest zoom level. If we have zoom level Zr but want to use tiles from
  // zoom level Zi, then we have to cover (TileSize*2**Zr) pixels with (2**Zi)
  // tiles, which means each tile from Zi has to be stretched or shrunk to be
  // the size of (TileSize*2**Zr)/(2**Zi) = TileSize * 2**(Zr-Zi) pixels.
  const izoom = Math.round(zoom);
  const size = TileSize * Math.pow(2, zoom - izoom);

  // The tile indices are then simply calculated from proportions.
  const i1 = Math.floor(x1 / size);
  const i2 = Math.floor(x2 / size);
  const j1 = Math.floor(y1 / size);
  const j2 = Math.floor(y2 / size);

  const $tiles = useMemo(() => {
    const tiles = [];
    for (let i = i1; i <= i2; i++) {
      for (let j = j1; j <= j2; j++) {
        const key = `${izoom}/${i}/${j}`;
        tiles.push(
          <div
            key={key}
            style={{
              position: "absolute",
              // The parent component puts the rendered result in a coordinate system
              // shifted to keep the relative coordinates of the tiles low. That offset is
              // given as a prop here.
              left: i * size - $offset.x + "px",
              top: j * size - $offset.y + "px",
              width: size + "px",
              height: size + "px",
              backgroundColor: "#e6ec88",
            }}
          >
            <img
              src={`${baseTilesUrl}/${key}.png`}
              style={{ width: "100%" }}
              alt=""
            />
          </div>
        );
      }
    }
    return tiles;
  }, [i1, i2, j1, j2, izoom, baseTilesUrl, size]);

  return (
    <Context.Provider value={$contextValue}>
      <GestureDiv
        onClick={$handleClick}
        onMove={$handleMove}
        onWheel={$handleWheel}
      >
        <div style={$layerStyle}>
          <div className="tiles-container" style={{ position: "relative" }}>
            {$tiles}
          </div>
          <div className="objects-container">{children}</div>
        </div>
      </GestureDiv>
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
