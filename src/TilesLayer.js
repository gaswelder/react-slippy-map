import React from 'react';
import {getX, getY, getLat, getLon} from './mercator';


// Length of a map tile's side in pixels
const TileSize = 256;

export default class TilesLayer extends React.Component {
	render() {
		let area = this.props.area;
		let zoom = this.props.zoom;

		let x1 = getX(area.leftTop.longitude, zoom);
		let x2 = getX(area.rightBottom.longitude, zoom);
		let y1 = getY(area.leftTop.latitude, zoom);
		let y2 = getY(area.rightBottom.latitude, zoom);

		let i1 = Math.floor(x1 / TileSize);
		let i2 = Math.floor(x2 / TileSize);
		let j1 = Math.floor(y1 / TileSize);
		let j2 = Math.floor(y2 / TileSize);

		let tiles = [];

		for (let i = i1; i <= i2; i++) {
			for (let j = j1; j <= j2; j++) {
				let key = `${zoom}/${i}/${j}`;
				let url = `https://a.tile.openstreetmap.org/${key}.png`;
				let style = {
					position: 'absolute',
					//transform: `translate(${x}px, ${y}px)`
					left: (i * TileSize) + 'px',
					top: (j * TileSize) + 'px'
				};
				tiles.push(<img style={style} src={url} key={key} alt=""/>);
			}
		}
		return <div className="tiles">{tiles}</div>;
	}
}
