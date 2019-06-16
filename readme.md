# react-slippy-map

From-scratch implementation of a "web mercator"-projected slippy map. This is
not a wrapper around an existing old-style map widget, but a real React
component.

A demo (for desktop Firefox and Chrome): https://gaswelder.github.io/react-slippy-map/demo/

## Usage example

```js
import { SlippyMap, Marker, Label, InfoBox } from "react-slippy-map";

let coords = { latitude: 53.90824, longitude: 27.56136 };
let infoCoords = { latitude: 53.90902, longitude: 27.562 };

function MyComponent() {
  return (
    <SlippyMap center={coords} zoom={16}>
      <Label coords={coords} text="You are here" />
      <Marker coords={coords} />

      <InfoBox coords={infoCoords}>
        <b>Howdy, Globe</b>
      </InfoBox>
    </SlippyMap>
  );
}
```

It's possible to use the `Pin` component and put any content
inside of it:

```js
import { SlippyMap, Pin } from "react-slippy-map";

function MapWithUser(props) {
  return (
    <SlippyMap>
      <Pin coords={props.userCoords}>
        <div style={{ background: "white", padding: "1em" }}>You are here</div>
        <UserMarker title="You are here" />
      </Pin>
    </SlippyMap>
  );
}
```

Any component can also be placed on the map after wrapping it in the `pinned` high-order component:

```js
import { SlippyMap, pinned } from "react-slippy-map";

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
  return (
    <div style={userMarkerStyle} title={props.title}>
      <img src={userMarkerImage} alt="" />
    </div>
  );
}

// Make a "pinned" version of the UserMarker
const PinnedUserMarker = pinned(UserMarker);

// ...And place it on the map
function MapWithUser(props) {
  return (
    <SlippyMap>
      <PinnedUserMarker coords={props.userCoords} title="You are here" />
    </SlippyMap>
  );
}
```

## `SlippyMap`

`SlippyMap` is the main component that actually draws the map with tiles.

The map component has width and height assigned to 100%, thus its size is
controlled by the size of its container.

The properties are:

- required `baseTilesUrl`
- `center: { latitude:number, longitude:number }`
- `onCenterChange` - called with `{latitude, longitude}` every time the user drags the map
- `children` - content like markers and boxes
- `zoom` - zoom level, typically from 1 to 18, but depends on the tile provider; can be fractional (in that case the closest zoom's tiles are scaled)
- `onClick` - function that is called on click events on the map; receives a `{latitude, longitude}` object as the argument
- `onWheel` - called with the wheel event as the argument when the user uses the mouse wheel

If `center` is not set, the map starts at `defaultCenter` and takes care of controlling this prop itself.
If `zoom` is not set, the map starts at `defaultZoom`, renders additionally zoom in/out buttons and controls the zoom itself.
Additionally, `minZoom`, `maxZoom` and `zoomStep` props are taken into account by the zoom buttons.

## `Path`

`Path` renders as a polyline on the map.

- required `points` - array of `{latitude, longitude}` objects
- `color = "orange"` - color of the line

## Controlling the map state

An example of controlling the map:

```js
import React from "react";
import { SlippyMap } from "react-slippy-map";

class MyMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      center: { latitude: 53.9049, longitude: 27.5609 },
      zoom: 10
    };
    this.onCenterChange = this.onCenterChange.bind(this);
    this.onWheel = this.onWheel.bind(this);
  }

  onCenterChange(center) {
    this.setState({ center });
  }

  onWheel(event) {
    this.setState(function(state) {
      let delta = event.deltaY > 0 ? -1 : 1;
      return { zoom: state.zoom + delta };
    });
  }

  render() {
    return (
      <div style={{ height: "500px" }}>
        <SlippyMap
          center={this.state.center}
          onCenterChange={this.onCenterChange}
          zoom={this.state.zoom}
          onWheel={this.onWheel}
        />
      </div>
    );
  }
}
```

## Clusters

It's possible to wrap multiple objects in a `Cluster` component and have them
clustered:

```js
import { SlippyMap as Map, Clusters } from "react-slippy-map";

function View(props) {
  return (
    <Map>
      <Clusters objects={props.zerlings} />
      <Clusters objects={props.marines} />
    </Map>
  );
}
```

The `Cluster` component's `objects` property must be an array with objects,
each having a `coords` field with latitude and longitude. For example:

```js
let zerlings = [
  {
    type: "zerling",
    health: 50,
    coords: { latitude: 12.3, longitude: 58.2042 }
  },
  {
    type: "zerling",
    health: 48,
    coords: { latitude: 12.3001, longitude: 58.2044 }
  }
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
  return <Clusters objects={props.zerlings} render={renderZerlingsCluster} />;
}

function renderZerlingsCluster(cluster) {
  let n = cluster.objects.count;

  // If this cluster has only one zerling, render it as usual.
  if (n == 1) {
    let zerlingObject = cluster.objects[0];
    return <Zerling {...zerlingObject} />;
  }

  // If there are multiple zerlings, render some meta info.
  let label = "";
  if (n > 50) {
    label = "You're gone, pal";
  } else if (n > 20) {
    label = "Get more firebats";
  } else {
    label = "Them again";
  }
  return <ManyZerlings label={label} />;
}
```
