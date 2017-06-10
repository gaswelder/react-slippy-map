import React from 'react';

const boxShadow = '0px 2px 2px #023';

export function Marker(props) {
	let style = {
		background: props.color || '#0091ffe6',
		width: '16px',
		height: '16px',
		borderRadius: '50%',
		boxShadow,
		transform: 'translate(-8px, -8px)'
	};
	return <div style={style}/>;
}

export function InfoBox(props) {
	let style = {
		background: 'white',
		boxShadow,
		padding: '10px',
		borderRadius: '6px',
		maxWidth: '400px'
	};
	return <div style={style}>{props.children}</div>;
}
