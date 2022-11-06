import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Context } from "./Context";
import { GestureDiv } from "./GestureDiv";
import Projection, { TileSize } from "./mercator";
import report from "./report";

export const SlippyMap = ({
  zoom = 16,
  center = { latitude: 53.9049, longitude: 27.5609 },
  onMove,
  onMoveEnd,
  onPinch,
  onAreaChange,
  onWheel,
  baseTilesUrl,
  onClick,
  children,
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

  if (!baseTilesUrl) {
    report.propsFault("missing baseTilesUrl prop for slippy map");
  }
  const halfSize = [containerSize[0] / 2, containerSize[1] / 2];

  // Object describing currently visible area in coordinates.
  const $area = useMemo(() => {
    const [x, y] = Projection.getXY(center, zoom);
    const leftTop = Projection.getLatLon(
      [x - halfSize[0], y - halfSize[1]],
      zoom
    );
    const rightBottom = Projection.getLatLon(
      [x + halfSize[0], y + halfSize[1]],
      zoom
    );
    return { leftTop, rightBottom };
  }, [center, zoom, halfSize[0], halfSize[1]]);

  const $eventCoords = useCallback(
    (event) => {
      const rect = containerRef.current.getBoundingClientRect();
      const dx = event.pageX - rect.x - halfSize[0];
      const dy = event.pageY - rect.y - halfSize[1];
      const [x, y] = Projection.getXY(center, zoom);
      return Projection.getLatLon([x + dx, y + dy], zoom);
    },
    [containerRef.current, halfSize[0], halfSize[1], center, zoom]
  );

  // Processes click events and passes the to the listener in the props.
  const $handleClick = useCallback(
    (event) => {
      onClick && onClick($eventCoords(event));
    },
    [containerRef.current, $eventCoords]
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
      const [x, y] = Projection.getXY(center, zoom);
      const newcenter = Projection.getLatLon(
        [x - event.dx, y - event.dy],
        zoom
      );
      onMove && onMove(newcenter);
      onAreaChange && onAreaChange({ center: newcenter, ...$area });
    },
    [onAreaChange, center, zoom, $area]
  );

  const $handleMoveEnd = useCallback(
    (event) => {
      // Current position.
      const p1 = center;
      const [x1, y1] = Projection.getXY(center, zoom);

      // From the event we know that the previous move tick had dx and dy pixels
      // worth of movement. If the next tick had the same speed, we'd end up at
      // this position.
      const [x2, y2] = [x1 - event.dx, y1 - event.dy];
      const p2 = Projection.getLatLon([x2, y2], zoom);

      // Send up the speed to the callback as dlat, dlon.
      const dlat = p2.latitude - p1.latitude;
      const dlon = p2.longitude - p1.longitude;
      onMoveEnd && onMoveEnd({ speed: [dlat, dlon] });
    },
    [center, zoom, onMoveEnd]
  );

  useEffect(() => {
    if (!onAreaChange) {
      return;
    }
    onAreaChange({ center, ...$area });
  }, [onAreaChange, center, $area]);

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
  const scaledTileSize = TileSize * Math.pow(2, zoom - izoom);

  const [XC, YC] = Projection.getXY(center, zoom);

  // 256i + L + w/2 = X(C)
  const i = (XC - containerSize[0] / 2) / scaledTileSize;
  const L = XC - containerSize[0] / 2 - scaledTileSize * Math.floor(i);
  // N > (w+L)/S
  const N = Math.ceil((containerSize[0] + L) / scaledTileSize);

  // 256j + T + h/2 = Y(C)
  const j = (YC - containerSize[1] / 2) / scaledTileSize;
  const T = YC - containerSize[1] / 2 - scaledTileSize * Math.floor(j);
  // M > (h+T)/S
  const M = Math.ceil((containerSize[1] + T) / scaledTileSize);

  const irange = new Array(N).fill(0).map((_, _i) => _i + Math.floor(i));
  const jrange = new Array(M).fill(0).map((_, _i) => _i + Math.floor(j));

  return (
    <div
      id="slippy-map-root"
      style={{
        position: "relative",
        height: "100%",
        minHeight: "1em",
        overflow: "hidden",
      }}
      ref={containerRef}
    >
      {containerRef.current && (
        <>
          <div
            style={{
              position: "absolute",
              left: -L,
              top: -T,
              width: scaledTileSize * N,
              height: scaledTileSize * M,
              display: "grid",
              gridTemplateColumns: `repeat(${N}, ${scaledTileSize}px)`,
              gridTemplateRows: `repeat(${M}, ${scaledTileSize}px)`,
              alignItems: "stretch",
              justifyItems: "stretch",
            }}
          >
            {jrange.map((j) => (
              <>
                {irange.map((i) => (
                  // <div key={[i, j].join(",")}>{`${izoom}/${i}/${j}.png`}</div>
                  <img
                    key={[i, j].join(",")}
                    src={`${baseTilesUrl}/${izoom}/${i}/${j}.png`}
                  />
                ))}
              </>
            ))}
          </div>
          <GestureDiv
            onClick={$handleClick}
            onMove={$handleMove}
            onMoveEnd={$handleMoveEnd}
            onWheel={$handleWheel}
            onPinch={onPinch}
            style={{
              position: "absolute",
              inset: 0,
            }}
          />
          <Context.Provider value={{ zoom, halfSize, XC, YC }}>
            {children}
          </Context.Provider>
        </>
      )}
    </div>
  );
};
