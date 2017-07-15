import React from 'react';
import Projection from './mercator';


// Length of a map tile's side in pixels
const TileSize = 256;

export default class TilesLayer extends React.Component {
	render() {
		let area = this.props.area;
		let zoom = this.props.zoom;
		let offset = this.props.offset;

		// Convert area to projection coordinates.
		let x1 = Projection.getX(area.leftTop.longitude, zoom);
		let x2 = Projection.getX(area.rightBottom.longitude, zoom);
		let y1 = Projection.getY(area.leftTop.latitude, zoom);
		let y2 = Projection.getY(area.rightBottom.latitude, zoom);

		// Find out tile numbers to cover the projection.
		let i1 = Math.floor(x1 / TileSize);
		let i2 = Math.floor(x2 / TileSize);
		let j1 = Math.floor(y1 / TileSize);
		let j2 = Math.floor(y2 / TileSize);

		let layerX = i1 * TileSize - offset.x;
		let layerY = j1 * TileSize - offset.y;

		let style = {
			position: 'absolute',
			left: layerX + 'px',
			top: layerY + 'px'
		};

		let baseUrl = this.props.baseUrl;
		let props = {i1, i2, j1, j2, zoom, baseUrl};
		return <div className="tiles-container" style={style}><Tiles {...props}/></div>;
	}
}

class Tiles extends React.PureComponent {
	render() {
		let {i1, i2, j1, j2, zoom} = this.props;
		let tiles = [];
		let baseUrl = this.props.baseUrl;

		for (let i = i1; i <= i2; i++) {
			for (let j = j1; j <= j2; j++) {
				let key = `${zoom}/${i}/${j}`;
				let url = `${baseUrl}/${key}.png`;
				let style = {
					position: 'absolute',
					left: ((i-i1) * TileSize) + 'px',
					top: ((j-j1) * TileSize) + 'px',
					width: TileSize + 'px',
					height: TileSize + 'px',
					backgroundColor: '#e6ec88'
				};
				tiles.push(<div key={key} style={style}><img src={url} alt=""/></div>);
			}
		}
		return <div style={{position: 'relative'}} className="tiles">{tiles}</div>;
	}
}
Tiles.defaultProps = {
	baseUrl: 'https://a.tile.openstreetmap.org'
};
