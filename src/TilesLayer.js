import React from 'react';
import Projection from './mercator';


// Length of a map tile's side in pixels
const TileSize = 256;

export default class TilesLayer extends React.Component {
	render() {
		// We are given a map area specified as latitude and longitude ranges.
		const area = this.props.area;

		// To render this area we have to get the corresponding projection area as x
		// and y coordinate ranges.
		const zoom = this.props.zoom;
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

		// The parent component puts the rendered result in a coordinate system
		// shifted to keep the relative coordinates of the tiles low. The offset is
		// given as a property here.
		const offset = this.props.offset;
		const style = {position: 'relative'};

		const baseUrl = this.props.baseUrl;

		let tiles = [];
		for (let i = i1; i <= i2; i++) {
			for (let j = j1; j <= j2; j++) {
				let key = `${izoom}/${i}/${j}`;
				let url = `${baseUrl}/${key}.png`;
				let style = {
					position: 'absolute',
					left: (i * size - offset.x) + 'px',
					top: (j * size - offset.y) + 'px',
					width: size + 'px',
					height: size + 'px',
					backgroundColor: '#e6ec88'
				};
				tiles.push(<div key={key} style={style}><img src={url} style={{width: '100%'}} alt=""/></div>);
			}
		}
		return (
			<div className="tiles-container" style={style}>
				{tiles}
			</div>
		);
	}
}

TilesLayer.defaultProps = {
	baseUrl: 'https://a.tile.openstreetmap.org'
};
