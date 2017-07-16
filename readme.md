# react-slippy-map

From-scratch implementation of a "web mercator"-projected slippy map. This is
not a wrapper around an existing old-style map widget, but a real React
component.

A demo (for desktop Firefox and Chrome): https://gaswelder.github.io/react-slippy-map/demo/


## Basic usage

```js
import {SlippyMap, Marker, Label, InfoBox} from 'react-slippy-map';

let coords = {latitude: 53.90824, longitude: 27.56136};
let infoCoords = {latitude: 53.90902, longitude: 27.56200};

function MyComponent() {
	return (
		<SlippyMap center={coords}>
			<Label coords={coords} text="You are here"/>
			<Marker coords={coords}/>

			<InfoBox coords={infoCoords}>
				<b>Howdy, Globe</b>
			</InfoBox>
		</SlippyMap>
	);
}
```

The map component has width and height assigned to 100%, thus its size is
controlled by the size of its container.


## Map tiles

The base URL for the tiles can be set in the `baseTilesUrl` property:

	<SlippyMap baseTilesUrl="https://a.tile.openstreetmap.org"/>

By default the component uses the tile server provided by Openstreetmap.


## Placing objects on the map

Marker, Label and InfoBox are predefined map objects for demonstration purposes
or for cases where the design is not important. For advanced cases any component
can be placed on the map after wrapping it in the high-order component `pinned`.
For example:

```js
import {SlippyMap, pinned} from 'react-slippy-map';

// Create a custom marker
const userMarkerStyle = {
	width: "32px",
	height: "32px",
	// Pin is positioned by its left top corner, so
	// to make our marker's center appear right above
	// the reference point we shift it halfway left and top.
	position: "relative",
	left: "-16px",
	top: "-16px"
};
function UserMarker(props) {
	return <div style={userMarkerStyle} title={props.title}>
		<img src={userMarkerImage} alt=""/>
	</div>;
}

// Make a "pinned" version of the UserMarker
const PinnedUserMarker = pinned(UserMarker);

// ...And place it on the map
function MapWithUser(props) {
	return (
		<SlippyMap>
			<PinnedUserMarker coords={props.userCoords} title="You are here"/>
		</SlippyMap>
	);
}
```

Same approach goes for infoboxes and labels: they are just objects on the map.

It's also possible to use the `Pin` component directly and put any content
inside of it:

```js
import {SlippyMap, Pin} from 'react-slippy-map'

function MapWithUser(props) {
	return <SlippyMap>
		<Pin coords={props.userCoords}>
			<UserMarker title="You are here"/>
		</Pin>
	</SlippyMap>;
}
```


## Controlling the map state

The map needs the `center` and `zoom` properties to be set. When the user drags
the map, its `onCenterChange` property is called with the new center coordinates
as the argument. When the user uses the mouse wheel, the map's `onZoomChange`
property is called with the new zoom level as the argument. It's up to the
parent component then to apply the new state values and pass them back to the
map as properties.

An example implementation of an uncontrolled map component might thus be:

```js
import React from 'react';
import {SlippyMap} from 'react-slippy-map';

class MyMap extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			center: {latitude: 53.9049, longitude: 27.5609},
			zoom: 10
		};
		this.onCenterChange = this.onCenterChange.bind(this);
		this.onZoomChange = this.onZoomChange.bind(this);
	}

	onCenterChange(center) {
		this.setState({center});
	}

	onZoomChange(zoom) {
		this.setState({zoom});
	}

	render() {
		return <div style={{height: '500px'}}>
			<SlippyMap center={this.state.center} onCenterChange={this.onCenterChange}
				zoom={this.state.zoom} onZoomChange={this.onZoomChange}/>
		</div>
	}
}
```


## Zoom controls

The main `SlippyMap` component is fully controlled, and both center and zoom
level have to be provided to it and maintaned by the parent component. That
means, the usual "+/-" buttons have to be implemented by the developer along
with the state transition.

But often simple controls are just what's needed by the developer, and if zoom
level isn't going to be controlled by the parent, then there's the
`SlippyMapWithControls` component. It accepts the same properties as the base
component, except `zoom`, and additionally it accepts `defaultZoom`, `minZoom`
and `maxZoom` properties.

```js
import {SlippyMapWithControls as Map} from 'react-slippy-map'

function View() {
	let props = {...} // Props normally used for the basic SlippyMap
	return <Map defaultZoom={16} minZoom={0} maxZoom={20} {...props}/>;
}
```


## Clusters

It's possible to wrap multiple objects in a `Cluster` component and have them
clustered:

```js
import {SlippyMap as Map, Clusters} from 'react-slippy-map'

function View(props) {
	return (
		<Map>
			<Clusters objects={props.zerlings}/>
			<Clusters objects={props.marines}/>
		</Map>
	);
}
```

The `Cluster` component's `objects` property must be an array with objects,
each having a `coords` field with latitude and longitude. For example:

```js
	let zerlings = [
		{type: 'zerling', health: 50, coords: {latitude: 12.3000, longitude: 58.2042}},
		{type: 'zerling', health: 48, coords: {latitude: 12.3001, longitude: 58.2044}}
	];
```

The pixel distance at which objects are merged into a cluster is set in the
`threshold` property:

	<Clusters threshold={20} objects={zerlings}/>

By default after the calculation of resulting cluster centers the clusters
component renders standard markers at those points. The rendering can be
controlled by a callback passed as `render` property.

The callback will receive a cluster object with the field `objects` having a
subset of the original objects property and will have to return a JSX element:

```js
	function View(props) {
		return <Clusters objects={props.zerlings} render={renderZerlingsCluster}/>
	}

	function renderZerlingsCluster(cluster) {
		let n = cluster.objects.count;

		// If this cluster has only one zerling, render it as usual.
		if (n == 1) {
			let zerlingObject = cluster.objects[0];
			return <Zerling {...zerlingObject}/>;
		}

		// If there are multiple zerlings, render some meta info.
		let label = '';
		if (n > 50) {
			label = "You're gone, pal";
		} else if (n > 20) {
			label = "Get more firebats";
		} else {
			label = "Them again";
		}
		return <ManyZerlings label={label}/>;
	}
```


## Trivia / rationale

Existing wrappers around old-school widgets like Leaflet or Google's map widget
don't allow placing arbitrary components on the map.

Names "coords", "latitude" and "longitude" were chosen for coordinate keys to
be similar to the getolocation API.

The main component is named SlippyMap instead of just Map to help avoid
conflicts with the Javascript's Map object.

Clusters component doesn't support children because that would make it
impossible to make it "pure", which would have performance consequences.
