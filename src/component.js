import React from 'react';
import ReactDOM from 'react-dom';

// Length a map tile's side in pixels
const TileSize = 256;

import {getX, getY, getLat, getLon} from './mercator';
import DraggableDiv from './DraggableDiv';
import {getTiles} from './tiles.js';
import ObjectsLayer from './ObjectsLayer';
import {Marker, Pin} from './Objects';

export {Marker, Pin};

export default class Component extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			containerSize: [0, 0]
		};

		this.onClick = this.onClick.bind(this);
		this.onDrag = this.onDrag.bind(this);
	}

	componentDidMount() {
		let c = this._container;
		this.setState({
			containerSize: [c.offsetWidth, c.offsetHeight]
		});
	}

	/*
	 * Returns halved width and height of the container.
	 */
	halfSize() {
		return [this.state.containerSize[0]/2, this.state.containerSize[1]/2];
	}

	// Returns latitude and longitude corresponding to the point
	// at [x,y] pixels from the current map center.
	coordinatesAtOffset(x, y) {
		// Get coordinates of our center on the projection cylinder.
		let lat1 = this.props.center.latitude;
		let lon1 = this.props.center.longitude;
		let zoom = this.props.zoom;
		let mx = getX(lon1, zoom);
		let my = getY(lat1, zoom);
		// Apply the offset to the projection coordinates and get the
		// corresponding latitude and longitude.
		return {
			latitude: getLat(my + y, zoom),
			longitude: getLon(mx + x, zoom)
		};
	}

	// Returns offset [x,y] in pixels from the current map center
	// corresponding to the given coordinates.
	offsetAtCoordinates({latitude, longitude}) {
		let zoom = this.props.zoom;

		// Get location of our center on the projection
		let px = getX(this.props.center.longitude, zoom);
		let py = getY(this.props.center.latitude, zoom);

		// Get location of the given point on the projection
		let cx = getX(longitude, zoom);
		let cy = getY(latitude, zoom);

		// Get the difference
		let dx = cx - px;
		let dy = cy - py;
		return [dx, dy];
	}

	onClick(event) {
		// Find out click offset from the center.
		let x = event.pageX - this._container.offsetLeft;
		let y = event.pageY - this._container.offsetTop;
		let [w, h] = this.halfSize();
		let dx = x - w;
		let dy = y - h;
		let clickCoords = this.coordinatesAtOffset(dx, dy);
		this.props.onClick(clickCoords);
	}

	onDrag(event) {
		let newCenterCoords = this.coordinatesAtOffset(-event.dx, -event.dy);
		this.props.onCenterChange(newCenterCoords);
	}

	render() {
		let style = {
			height: '500px',
			border: 'thin solid red',
			position: 'relative',
			overflow: 'hidden'
		};

		return (
			<div style={style} ref={ref => this._container = ref}>
				{this._container && this.renderLayer()}
			</div>
		);
	}

	renderLayer() {
		let zoom = this.props.zoom;
		let lat = this.props.center.latitude;
		let lon = this.props.center.longitude;

		// Get tiles to cover our area.
		let x = getX(lon, zoom);
		let y = getY(lat, zoom);
		let [w, h] = this.halfSize();
		let leftTop = {x: x-w, y: y-h};
		let rightBottom = {x: x+w, y: y+h};

		let x0 = 0;
		let y0 = 0;

		let tiles = getTiles(leftTop, rightBottom, zoom).map(function(tile) {
			let x = tile.x - x0;
			let y = tile.y - y0;
			let style = {
				position: 'absolute',
				//transform: `translate(${x}px, ${y}px)`
				left: `${x}px`,
				top: `${y}px`
			};
			return <img key={tile.url} src={tile.url} style={style} alt=""/>;
		});

		let left = w - (getX(lon, zoom) - x0);
		let top = h - (getY(lat, zoom) - y0);

		let layerStyle = {
			position: 'absolute',
			left: `${left}px`,
			top: `${top}px`
			//transform: `translate3d(${left}px, ${top}px, 0px)`
		};

		return (
			<DraggableDiv style={layerStyle} onClick={this.onClick} onMove={this.onDrag}>
				<div>{tiles}</div>
				<ObjectsLayer
					zoom={this.props.zoom}
					objects={this.props.children}
					clusterThreshold={this.props.clusterThreshold}/>
			</DraggableDiv>
		);
	}
}

function noop() {}

Component.defaultProps = {
	zoom: 16,
	center: {latitude: 53.9049, longitude: 27.5609},
	onCenterChange: noop,
	onClick: noop
};
