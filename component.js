import React from 'react';
import ReactDOM from 'react-dom';

// Length a map tile's side in pixels
const TileSize = 256;

import {getX, getY, getLat, getLon} from './mercator';
import DraggableDiv from './DraggableDiv';


export default class Component extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			containerSize: [0, 0]
		};

		this.onClick = this.onClick.bind(this);
		this.onDrag = this.onDrag.bind(this);
	}

	/*
	 * Returns halved width and height of the container.
	 */
	halfSize() {
		return [this.state.containerSize[0]/2, this.state.containerSize[1]/2];
	}

	onClick(event) {
		let x = event.pageX - this._container.offsetLeft;
		let y = event.pageY - this._container.offsetTop;

		// Get coordinates of our center on the projection cylinder.
		let lat1 = this.props.center.latitude;
		let lon1 = this.props.center.longitude;
		let zoom = this.props.zoom;
		let mx = getX(lon1, zoom);
		let my = getY(lat1, zoom);

		// Find out click offset from the center.
		let [w, h] = this.halfSize();
		let dx = x - w;
		let dy = y - h;

		// Apply the offset to the projection coordinates and get the
		// corresponding latitude and longitude.
		let lat2 = getLat(my + dy, zoom);
		let lon2 = getLon(mx + dx, zoom);

		this.props.onClick({latitude: lat2, longitude: lon2});
	}

	onDrag(event) {
		let zoom = this.props.zoom;
		let lat1 = this.props.center.latitude;
		let lon1 = this.props.center.longitude;
		let lat2 = getLat(getY(lat1, zoom) - event.dy, zoom);
		let lon2 = getLon(getX(lon1, zoom) - event.dx, zoom);
		this.props.onCenterChange({latitude: lat2, longitude: lon2});
	}

	/*
	 * Returns index ranges of tiles required
	 * to cover our current container area.
	 */
	getTilesRange() {
		let zoom = this.props.zoom;
		let lat = this.props.center.latitude;
		let lon = this.props.center.longitude;

		// Determine where our center is on the projection surface.
		let x = getX(lon, zoom);
		let y = getY(lat, zoom);

		let [w, h] = this.halfSize();

		let i1 = Math.floor((x-w) / TileSize);
		let i2 = Math.floor((x+w) / TileSize);
		let j1 = Math.floor((y-h) / TileSize);
		let j2 = Math.floor((y+h) / TileSize);

		return [i1, i2, j1, j2];
	}

	render() {
		let style = {
			width: '600px',
			height: '400px',
			border: 'thin solid red',
			position: 'relative',
			overflow: 'hidden'
		};

		return (
			<div style={style} ref={ref => this._container = ref}>
				{this._container && this.renderLayer()}
				{this._container && this.renderChildren()}
			</div>
		);
	}

	componentDidMount() {
		let c = this._container;
		this.setState({
			containerSize: [c.offsetWidth, c.offsetHeight]
		});
	}

	renderLayer() {
		let zoom = this.props.zoom;
		let lat = this.props.center.latitude;
		let lon = this.props.center.longitude;

		// Determine the range of tiles we have to get
		// to cover our area.
		let [i1, i2, j1, j2] = this.getTilesRange();

		let tiles = [];

		let x0 = i1 * 256;
		let y0 = j1 * 256;

		for(let i = i1; i <= i2; i++) {
			for(let j = j1; j <= j2; j++) {
				let url = `https://a.tile.openstreetmap.org/${zoom}/${i}/${j}.png`;
				let x = i * 256 - x0;
				let y = j * 256 - y0;
				let style = {
					position: 'absolute',
					transform: `translate3d(${x}px, ${y}px, 0px)`
				};
				tiles.push(
					<img key={url} src={url} style={style} alt=""/>
				)
			}
		}

		let [w, h] = this.halfSize();
		let left = w - (getX(lon, zoom) - x0);
		let top = h - (getY(lat, zoom) - y0);

		let layerStyle = {
			position: 'absolute',
			transform: `translate3d(${left}px, ${top}px, 0px)`
		};

		return (
			<DraggableDiv style={layerStyle} onClick={this.onClick} onMove={this.onDrag}>
				{tiles}
			</DraggableDiv>
		);
	}

	renderChildren() {
		return React.Children.map(this.props.children, this.renderChild.bind(this));
	}

	renderChild(child) {
		let zoom = this.props.zoom;

		// Get location of our center on the projection
		let px = getX(this.props.center.longitude, zoom);
		let py = getY(this.props.center.latitude, zoom);

		// Get location of the child on the projection
		let cx = getX(child.props.pos.longitude, zoom);
		let cy = getY(child.props.pos.latitude, zoom);

		// Get the difference
		let dx = cx - px;
		let dy = cy - py;

		let [w, h] = this.halfSize();
		let x = w + dx;
		let y = h + dy;

		let style = {
			position: 'absolute',
			transform: `translate3d(${x}px, ${y}px, 0px)`
		};
		return (
			<div style={style}>{child}</div>
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

export function Marker(props) {
	let style = {
		background: 'url("marker-icon-2x.png")',
		width: '50px',
		height: '82px',
		transform: 'translate3d(-25px, -62px, 0px) scale(0.5)'
	};

	return (
		<div style={style}/>
	);
}
