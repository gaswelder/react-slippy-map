import React from 'react';
import Component from './component';
import Clusters from './Clusters';
import Pin from './Pin';
import {Marker, InfoBox} from './elements';

export {
	Pin,
	Component,
	Clusters
};

function pinned(Component) {
	return function(props) {
		let pinProps = props;
		return (
			<Pin {...pinProps}>
				<Component {...props}>{props.children}</Component>
			</Pin>
		);
	};
}

export let MarkerPin = pinned(Marker);
export let InfoBoxPin = pinned(InfoBox);
