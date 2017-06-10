import React from 'react';
import {getX, getY, getLat, getLon} from './mercator';


export default class Pin extends React.Component {
	render() {
		let {pos, offset, zoom} = this.props;

		// Get projection coordinates and subtract our coordinates offset.
		let px = getX(pos.longitude, zoom) - offset.x;
		let py = getY(pos.latitude, zoom) - offset.y;

		let style = {
			position: 'absolute',
			left: px + 'px',
			top: py + 'px'
			//transform: `translate(${x}px, ${y}px)`
		};
		return <div style={style}>{this.props.children}</div>;
	}
}
