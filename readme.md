# react-slippy-map

From-scratch implementation of a "web mercator"-projected slippy map. This is
not a wrapper around an existing old-style map widget, but a real React
component.

A demo (for desktop Firefox and Chrome):
https://gaswelder.github.io/react-slippy-map/demo/

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

## `SlippyMap` - the main component

It has width and height assigned to 100%, thus its size is controlled by the
size of its container.

Props:

- required `baseTilesUrl` - for example,
  "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
- required `center`: `{ latitude:number, longitude:number }` - coordinates of the map
  center
- required `zoom` - zoom level, typically from 1 to 18, but depends on the tile provider;
  can be fractional (in that case the closest zoom's tiles are scaled to
  interpolate)
- `children` - content like markers and boxes
- `onClick` - function that is called on click events on the map; receives a
  `{latitude, longitude}` object as the argument
- `onAreaChange` - called with `{center: Coords, leftTop: Coords, rightBottom: Coords}` every time the user
  the area is changed
- `onWheel` - called with the wheel event as the argument when the user uses the
  mouse wheel

The map is fully controlled, there's no internal state, the host must always
supply the position and zoom. An example with the container's state:

```js
const MyMap = () => {
  const [center, setCenter] = useState({
    latitude: 53.9049,
    longitude: 27.5609,
  });
  const [zoom, setZoom] = useState(10);

  return (
    <div style={{ height: "500px" }}>
      <SlippyMap
        center={center}
        zoom={zoom}
        onAreaChange={(area) => {
          setCenter(area.center);
        }}
        onWheel={(event) => {
          const delta = event.deltaY > 0 ? -1 : 1;
          setZoom((x) => x + delta);
        }}
      />
    </div>
  );
};
```

## `Pin` - generic positioned container for arbitrary content

```js
import { SlippyMap, Pin } from "react-slippy-map";

function MapWithUser(props) {
  return (
    <SlippyMap center={props.center} zoom={props.zoom}>
      <Pin coords={props.userCoords}>
        <div style={{ background: "white", padding: "1em" }}>You are here</div>
      </Pin>
    </SlippyMap>
  );
}
```

## `Path` - renders as a polyline on the map

Props:

- required `points` - array of `{latitude, longitude}` objects
- `color`: `string` - color of the line

## Canned components

"Canned components" are components that could be easily made as wrappers around the `Pin` component but are provided anyway for the laziest of us.
These are:

- `<Marker coords={...} />`
- `<InfoBox coords={...} up>{content}</InfoBox>`
- `<Label coords={...} up text={...} />`

The `up` property makes the label or infobox look "up" from the pin instead of default "down".

`Marker`, `InfoBox` and `Label` pass any other properties down to the actual `div` that they render, so it's possible to assign event listeners to them.

## Clusters - groups objects into one and renders the groups

Props:

- required `objects`: `{coords: {...}, ...}[]`
- `threshold`: `number` - pixel distance at which objects are merged into a
  cluster
- `render`: `({objects: {coords: {...}}[]}) => JSX` - function to render the
  clusters with. Receives a cluster object with the field `objects` having a
  subset of the original objects.

```js
import { SlippyMap, Clusters } from "react-slippy-map";

function ClustersExample(props) {
  let zerlings = [
    {
      coords: { latitude: 12.3, longitude: 58.2042 },
      data: { health: 50 },
    },
    {
      data: { health: 48 },
      coords: { latitude: 12.3001, longitude: 58.2044 },
    },
  ];
  return (
    <SlippyMap>
      <Clusters objects={zerlings} render={renderZerlingsCluster} />
      <Clusters objects={props.marines} />
    </SlippyMap>
  );
}

function renderZerlingsCluster(cluster) {
  let n = cluster.objects.length;
  if (n == 1) {
    let zerlingObject = cluster.objects[0];
    return <Zerling {...zerlingObject} />;
  }
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
