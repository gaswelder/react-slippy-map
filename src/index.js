import React from 'react';
import Clusters from './Clusters';
import Pin from './Pin';
import SlippyMap from './SlippyMap';
import SlippyMapWithControls from './SlippyMapWithControls';
import {Marker as PureMarker, Label as PureLabel, InfoBox as PureInfoBox} from './elements';

export {
	Clusters,
	Pin,
	SlippyMap,
	SlippyMapWithControls
};

export function pinned(Component) {
	let f = function(props) {
		let pinProps = props;
		return (
			<Pin {...pinProps}>
				<Component {...props}>{props.children}</Component>
			</Pin>
		);
	};
	f._isPinned = true;
	return f;
}

export const Marker = pinned(PureMarker);
export const Label = pinned(PureLabel);
export const InfoBox = pinned(PureInfoBox);
