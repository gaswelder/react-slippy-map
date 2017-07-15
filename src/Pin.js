import React from 'react';
import Projection from './mercator';

// Generic container for any content that can be put on the map.
export default class Pin extends React.Component {
	render() {
		let {coords, offset, zoom} = this.props;
		let divProps = propsExcept(this.props, ['coords', 'offset', 'zoom']);

		// Get projection coordinates and subtract our coordinates offset.
		let px = Projection.getX(coords.longitude, zoom) - offset.x;
		let py = Projection.getY(coords.latitude, zoom) - offset.y;

		let style = {
			position: 'absolute',
			left: px + 'px',
			top: py + 'px'
			//transform: `translate(${x}px, ${y}px)`
		};
		return <div {...divProps} style={style}>{this.props.children}</div>;
	}
}

function propsExcept(props, except) {
	let newProps = Object.assign({}, props);
	for (let k of except) {
		delete newProps[k];
	}
	delete newProps.children;
	return newProps;
}
