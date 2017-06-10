import React from 'react';

export function Marker(props) {
	let style = {
		background: props.color || '#0091ffe6',
		width: '16px',
		height: '16px',
		borderRadius: '50%',
		boxShadow: '0px 2px 2px #023',
		transform: 'translate(-8px, -8px)'
	};

	return <div style={style}/>;
}

export function Pin(props) {
	return <div>{props.children}</div>;
}
