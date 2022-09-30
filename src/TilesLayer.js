import React, { useMemo, memo } from "react";
import Projection from "./mercator";

// Length of a map tile's side in pixels
const TileSize = 256;

export const TilesLayer = memo(({ area, zoom, offset, baseUrl }) => {
  const x1 = Projection.getX(area.leftTop.longitude, zoom);
  const x2 = Projection.getX(area.rightBottom.longitude, zoom);
  const y1 = Projection.getY(area.leftTop.latitude, zoom);
  const y2 = Projection.getY(area.rightBottom.latitude, zoom);

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
              left: i * size - offset.x + "px",
              top: j * size - offset.y + "px",
              width: size + "px",
              height: size + "px",
              backgroundColor: "#e6ec88",
            }}
          >
            <img
              src={`${baseUrl}/${key}.png`}
              style={{ width: "100%" }}
              alt=""
            />
          </div>
        );
      }
    }
    return tiles;
  }, [i1, i2, j1, j2, izoom, baseUrl, size]);

  const style = { position: "relative" };
  return (
    <div className="tiles-container" style={style}>
      {$tiles}
    </div>
  );
});
