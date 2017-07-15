import React from 'react';
import Clusters from './Clusters';
import Pin from './Pin';
import SlippyMap from './SlippyMap';
import SlippyMapWithControls from './SlippyMapWithControls';
import {Marker, InfoBox} from './elements';

export {
	Clusters,
	Pin,
	SlippyMap,
	SlippyMapWithControls
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
