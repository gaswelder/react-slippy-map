import React from 'react';
import ReactDOM from 'react-dom';
import {getX, getY, getLat, getLon} from './mercator';
import DraggableDiv from './DraggableDiv';
import ObjectsLayer from './ObjectsLayer';
import TilesLayer from './TilesLayer';
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

	// Returns object describing currently visible area
	// in coordinates.
	area() {
		let [w, h] = this.halfSize();
		return {
			leftTop: this.coordinatesAtOffset(-w, -h),
			rightBottom: this.coordinatesAtOffset(w, h)
		};
	}

	renderLayer() {
		let zoom = this.props.zoom;
		let lat = this.props.center.latitude;
		let lon = this.props.center.longitude;

		// Get tiles to cover our area.
		let [w, h] = this.halfSize();

		// Put child layers in a relative coordinate system
		// to make their numbers smaller.
		let offset = {x: 9800000, y: 5394920};

		let left = w - (getX(lon, zoom)) + offset.x;
		let top = h - (getY(lat, zoom)) + offset.y;

		let layerStyle = {
			position: 'absolute',
			left: `${left}px`,
			top: `${top}px`
			//transform: `translate3d(${left}px, ${top}px, 0px)`
		};

		return (
			<DraggableDiv style={layerStyle} onClick={this.onClick} onMove={this.onDrag}>
				<TilesLayer zoom={this.props.zoom} area={this.area()} offset={offset}/>
				<ObjectsLayer
					zoom={this.props.zoom}
					objects={this.props.children}
					clusterThreshold={this.props.clusterThreshold}
					offset={offset}/>
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
