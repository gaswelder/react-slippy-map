import React from 'react';
import SlippyMap from './SlippyMap';
import Clusters from './Clusters';
import Pin from './Pin';
import {Marker, InfoBox} from './elements';

export {
	Pin,
	SlippyMap,
	Clusters
};

export function pinned(Component) {
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
