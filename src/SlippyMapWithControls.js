import React from 'react'
import SlippyMap from './SlippyMap';

const containerStyle = {
	position: 'relative',
	height: '100%'
};

export default class SlippyMapWithControls extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			zoom: props.defaultZoom
		};
		this.zoomOut = this.zoomOut.bind(this);
		this.zoomIn = this.zoomIn.bind(this);
		this.onWheel = this.onWheel.bind(this);
	}

	zoomOut() {
		this.setState(function(s) {
			let zoom = Math.round((s.zoom - this.props.zoomStep)*100)/100;
			if (zoom < this.props.minZoom) {
				zoom = this.props.minZoom;
			}
			return {zoom};
		});
	}

	zoomIn() {
		this.setState(function(s) {
			let zoom = Math.round((s.zoom + this.props.zoomStep)*100)/100;
			if (zoom > this.props.maxZoom) {
				zoom = this.props.maxZoom;
			}
			return {zoom};
		});
	}

	onWheel(event) {
		// Throttle barrier
		if (this.ignoreWheelUntil && event.timeStamp < this.ignoreWheelUntil) {
			return;
		}
		this.ignoreWheelUntil = event.timeStamp + 50;

		event.deltaY > 0 ? this.zoomOut() : this.zoomIn();
	}

	render() {
		let props = Object.assign({}, this.props, {zoom: this.state.zoom});
		for (let k in SlippyMapWithControls.defaultProps) {
			delete props[k];
		}
		return (
			<div style={containerStyle}>
				<SlippyMap {...props} onWheel={this.onWheel}/>
				<ZoomControl less={this.zoomOut} more={this.zoomIn}
					min={this.props.minZoom} max={this.props.maxZoom} current={this.state.zoom}/>
			</div>
		)
	}
}

SlippyMapWithControls.defaultProps = {
	minZoom: 0,
	defaultZoom: 14,
	maxZoom: 18,
	zoomStep: 1
};


const zoomStyle = {
	position: 'absolute',
	right: '10px',
	bottom: '10px',
};

function ZoomControl(props) {
	return (
		<div style={zoomStyle}>
			({props.current})
			<button type="button" onClick={props.less} disabled={props.current <= props.min}>&minus;</button>
			<button type="button" onClick={props.more} disabled={props.current >= props.max}>+</button>
		</div>
	);
}
