import React from 'react';
import Component from './component';
import Clusters from './Clusters';
import Pin from './Pin';
import {Marker} from './elements';

export {
	Pin,
	Component,
	Clusters
};

export function MarkerPin(props) {
	let pinProps = {
		pos: props.pos,
		offset: props.offset,
		zoom: props.zoom
	};
	return (
		<Pin {...pinProps}>
			<Marker {...props}>{props.children}</Marker>
		</Pin>
	);
}
