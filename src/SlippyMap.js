import React from 'react';
import ReactDOM from 'react-dom';
import Projection from './mercator';
import DraggableDiv from './DraggableDiv';
import TilesLayer from './TilesLayer';


export default class SlippyMap extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			// Current size of the map's container element.
			containerSize: [0, 0]
		};

		this.onClick = this.onClick.bind(this);
		this.onDrag = this.onDrag.bind(this);
		this.onWheel = this.onWheel.bind(this);
	}

	// When the map is mounted, we can get its container via ref
	// (see render) and measure its size here.
	componentDidMount() {
		let c = this._container;

		// This will trigger a rerender, but this is exactly what
		// we need since the first render returned nothing because
		// the container was still missing.
		this.setState({
			containerSize: [c.offsetWidth, c.offsetHeight]
		});
	}

	// Returns halved width and height of the container in pixels.
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
		let mx = Projection.getX(lon1, zoom);
		let my = Projection.getY(lat1, zoom);
		// Apply the offset to the projection coordinates and get the
		// corresponding latitude and longitude.
		return {
			latitude: Projection.getLat(my + y, zoom),
			longitude: Projection.getLon(mx + x, zoom)
		};
	}

	// Returns offset [x,y] in pixels from the current map center
	// corresponding to the given coordinates.
	offsetAtCoordinates({latitude, longitude}) {
		let zoom = this.props.zoom;

		// Get location of our center on the projection
		let px = Projection.getX(this.props.center.longitude, zoom);
		let py = Projection.getY(this.props.center.latitude, zoom);

		// Get location of the given point on the projection
		let cx = Projection.getX(longitude, zoom);
		let cy = Projection.getY(latitude, zoom);

		// Get the difference
		let dx = cx - px;
		let dy = cy - py;
		return [dx, dy];
	}

	// Processes click events and passes the to the listener in
	// the props.
	onClick(event) {
		// If there is no listeners, then why bother.
		if (!this.props.onClick) {
			return;
		}

		// Find out the click event's offset from the center.
		let x = event.pageX - this._container.offsetLeft;
		let y = event.pageY - this._container.offsetTop;
		let [w, h] = this.halfSize();
		let dx = x - w;
		let dy = y - h;
		let clickCoords = this.coordinatesAtOffset(dx, dy);
		this.props.onClick(clickCoords);
	}

	// Preprocesses dragging events and calls the listener in the props.
	onDrag(event) {
		// If there is no listener, don't bother.
		if (!this.props.onCenterChange) {
			return;
		}
		let newCenterCoords = this.coordinatesAtOffset(-event.dx, -event.dy);
		this.props.onCenterChange(newCenterCoords);
	}

	// Preprocesses mousewheel converting them to zoom change events
	// and calls the listener.
	onWheel(event) {
		// If there is no zoom listener, don't bother.
		if (!this.props.onZoomChange) {
			return;
		}

		// Throttle barrier
		if (this.ignoreWheelUntil && event.timeStamp < this.ignoreWheelUntil) {
			return;
		}
		this.ignoreWheelUntil = event.timeStamp + 500;

		// Call the listener with the new zoom level
		let delta = event.deltaY < 0 ? 1 : -1;
		this.props.onZoomChange(this.props.zoom + delta);
	}

	render() {
		let style = {
			minHeight: '1em',
			height: '100%',
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

		// To make coordinates of our elements small we have to put all layers
		// in a relative coordinate system. We might just choose the current
		// center, but then all relative coordinates would have to be
		// recalculated on each rendering. We can't choose a static offset
		// either because that would assume specific zoom and location.

		// So instead we choose a pair of nearby round coordinates. This trims
		// big numbers nicely while being static most of the time (except when
		// the user happens to be at round coordinates).
		let offset = {
			x: Math.round(Projection.getX(lon, zoom) / 10000) * 10000,
			y: Math.round(Projection.getY(lat, zoom) / 10000) * 10000
		};

		let left = w - (Projection.getX(lon, zoom)) + offset.x;
		let top = h - (Projection.getY(lat, zoom)) + offset.y;

		let layerStyle = {
			position: 'absolute',
			left: `${left}px`,
			top: `${top}px`
			//transform: `translate3d(${left}px, ${top}px, 0px)`
		};

		return (
			<DraggableDiv style={layerStyle} onClick={this.onClick} onMove={this.onDrag} onWheel={this.onWheel}>
				<TilesLayer
					baseUrl={this.props.baseTilesUrl}
					zoom={this.props.zoom}
					area={this.area()}
					offset={offset}/>
				<div className="objects-container">
					{React.Children.map(this.props.children, function(child, i) {
						// Render the same thing, but add offset and zoom properties
						// for internal purposes.
						let ChildElement = child.type;
						return <ChildElement key={i} {...child.props} offset={offset} zoom={zoom}/>;
					})}
				</div>
			</DraggableDiv>
		);
	}
}

function noop() {}

SlippyMap.defaultProps = {
	zoom: 16,
	center: {latitude: 53.9049, longitude: 27.5609},
	onCenterChange: noop,
	onClick: noop
};
