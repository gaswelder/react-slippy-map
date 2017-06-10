import React from 'react';
import Projection from './mercator';

// Generic container for any content that can be put on the map.
export default class Pin extends React.Component {
	render() {
		let {pos, offset, zoom} = this.props;

		// Get projection coordinates and subtract our coordinates offset.
		let px = Projection.getX(pos.longitude, zoom) - offset.x;
		let py = Projection.getY(pos.latitude, zoom) - offset.y;

		let style = {
			position: 'absolute',
			left: px + 'px',
			top: py + 'px'
			//transform: `translate(${x}px, ${y}px)`
		};
		return <div style={style}>{this.props.children}</div>;
	}
}
