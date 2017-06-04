import React from 'react';
import ReactDOM from 'react-dom';

// Length a map tile's side in pixels
const TileSize = 256;

import {getX, getY, getLat, getLon} from './mercator';


export default class Component extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			dragging: false,
			prevDragPos: [0, 0],
			containerSize: [0, 0]
		};

		let b = ['onDragStart', 'onDrag', 'onDragEnd', 'onClick'];
		for(let k of b) {
			this[k] = this[k].bind(this);
		}
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

	onDragStart(event) {
		this.setState({
			dragging: true,
			prevDragPos: [event.pageX, event.pageY]
		});
	}

	onDrag(event) {
		if(!this.state.dragging) return;

		let x = event.pageX;
		let y = event.pageY;

		this.setState(function(s) {
			let dx = x - s.prevDragPos[0];
			let dy = y - s.prevDragPos[1];



			let lat1 = this.props.center.latitude;
			let lon1 = this.props.center.longitude;
			let zoom = this.props.zoom;

			let lat2 = getLat(getY(lat1, zoom) - dy, zoom);
			let lon2 = getLon(getX(lon1, zoom) - dx, zoom);

			//console.log(dx, dy, lat1, lat2);

			this.props.onCenterChange({latitude: lat2, longitude: lon2});

			return {prevDragPos: [x, y]};
		});
	}

	onDragEnd(event) {
		this.setState({dragging: false});
	}

	shouldComponentUpdate(prevProps, prevState) {
		//console.log(prevProps, prevState);
		return true;
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
			<div style={layerStyle}
				onDragStart={e => e.preventDefault()}
				onMouseDown={this.onDragStart}
				onMouseMove={this.onDrag}
				onMouseUp={this.onDragEnd}
				onClick={this.onClick}>
				{tiles}
			</div>
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
