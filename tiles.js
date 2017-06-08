const TileSize = 256;

// Returns list of tiles to cover the area determined
// by points {x,y} leftTop and rightBottom on the projection
// cylinder.
export function getTiles(leftTop, rightBottom, zoom) {
	let x0 = leftTop.x;
	let y0 = leftTop.y;
	let x1 = rightBottom.x;
	let y1 = rightBottom.y;

	let i1 = Math.floor(x0 / TileSize);
	let i2 = Math.floor(x1 / TileSize);
	let j1 = Math.floor(y0 / TileSize);
	let j2 = Math.floor(y1 / TileSize);

	let tiles = [];

	for (let i = i1; i <= i2; i++) {
		for (let j = j1; j <= j2; j++) {
			tiles.push({
				x: i * TileSize,
				y: j * TileSize,
				url: `https://a.tile.openstreetmap.org/${zoom}/${i}/${j}.png`
			});
		}
	}
	return tiles;
}
