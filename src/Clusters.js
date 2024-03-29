import React, { useContext, useMemo } from "react";
import Marker from "./canned/Marker";
import { Context } from "./Context";
import Projection from "./mercator";
import Pin from "./Pin";
import report from "./report";
import { useStabilizer, warnDefault } from "./util";

// A clustering container.
// Reduces an array of objects to an array of clusters and renders
// the clusters as markers.
export default function Clusters({
  objects = warnDefault("objects prop on Clusters is missing", []),
  threshold = 20,
  render = defaultRender,
}) {
  const { zoom, offset } = useContext(Context);
  const $objects = useStabilizer(objects);
  const $clusters = useMemo(() => {
    return clusterizeObjects(
      $objects,
      pixelDistance.bind(undefined, zoom),
      threshold
    );
  }, [$objects, zoom, threshold]);

  return $clusters.map((cluster, i) => {
    return (
      <Pin key={i} {...{ offset, zoom }} coords={cluster.coords}>
        {render(cluster)}
      </Pin>
    );
  });
}

function defaultRender(cluster) {
  if (cluster.objects.length == 1) {
    return <Marker />;
  }
  return <Marker color="red" />;
}

// Returns distance in pixels between two
// geopoints.
function pixelDistance(zoom, p1, p2) {
  let r1 = projectionCoords(p1, zoom);
  let r2 = projectionCoords(p2, zoom);
  let dx = r1[0] - r2[0];
  let dy = r1[1] - r2[1];
  return Math.sqrt(dx * dx + dy * dy);
}

// Returns coordinates on the projection sufrace
// for the given point at given zoom level.
function projectionCoords(point, zoom) {
  return [
    Projection.getX(point.longitude, zoom),
    Projection.getY(point.latitude, zoom),
  ];
}

// Takes an array of objects and returns an array of clusters.
// Each object must have a `coords` field with {latitude, longitude} values.
function clusterizeObjects(objects, distance, threshold) {
  if (
    !objects.every(
      (x) =>
        x &&
        x.coords &&
        typeof x.coords.latitude == "number" &&
        typeof x.coords.longitude == "number"
    )
  ) {
    report.propsFault(
      "Cluster: missing coords.latitude or coords.longitude on objects",
      objects
    );
    return [];
  }
  // Create a array of points to give to the algorithm.
  // Keep references to the markers on the points.
  let points = objects.map(function (object) {
    // We need to give a plain point to the function
    // below, but keep a reference to the full objects.
    // Instead of mutating the coords themselves, give
    // a copy.
    let point = Object.assign({}, object.coords);
    point.object = object;
    return point;
  });

  let clusters = clusterize(points, distance, threshold);

  return clusters.map(function (cluster) {
    return {
      objects: cluster.map((point) => point.object),
      coords: cluster.center,
    };
  });
}

// A simple greedy algorithm to merge points into clusters.
// * points is an array of {latitude, longitude} objects.
// * distance is a function that takes two points and returns the
//   distance in whichever units.
// * threshold is the distance threshold for the clustering, in the
//   same units as the distance.
function clusterize(points, distance, threshold) {
  // Create a list of clusters, each with a single marker in it.
  let clusters = points.map((p) => [p]);

  // Go through each pair of clusters.
  for (let i = 0; i < clusters.length - 1; i++) {
    let c1 = clusters[i];
    if (!c1) continue;
    for (let j = i + 1; j < clusters.length; j++) {
      let c2 = clusters[j];
      if (!c2) continue;

      // If this pair of clusters is close enough, merge them
      // into a new cluster. Put the new cluster at the end
      // of the list and "delete" these two.
      if (distance(center(c1), center(c2)) < threshold) {
        clusters.push(c1.concat(c2));
        clusters[i] = null;
        clusters[j] = null;
        break;
      }
    }
  }

  return clusters
    .filter((x) => x)
    .map(function (c) {
      c.center = center(c);
      return c;
    });
}

// Calculates center for the given cluster.
function center(cluster) {
  let lat = 0;
  let lon = 0;
  for (let m of cluster) {
    lat += m.latitude;
    lon += m.longitude;
  }
  return {
    latitude: lat / cluster.length,
    longitude: lon / cluster.length,
  };
}
