import React from 'react';
import {getX, getY, getLat, getLon} from './mercator';
import Pin_ from './Pin';
import {Marker} from './Objects';

export default class Clusters extends React.Component {
	render() {
		let {offset, zoom} = this.props;

		let children = React.Children.toArray(this.props.children);
		let markers = clusterizeMarkers(children, pixelDistance.bind(undefined, this.props.zoom), this.props.threshold)
			.map(function(cluster, i) {
				// If a marker didn't get into a cluster,
				// return it as it was.
				if(cluster.markers.length == 1) {
					let m = cluster.markers[0];
					return <Pin_ key={i} pos={m.props.pos} zoom={zoom} offset={offset}>{m}</Pin_>;
				}
				// Replace a cluster of markers with a single
				// generic marker.
				return (
					<Pin_ key={i} pos={cluster.center} zoom={zoom} offset={offset}>
						<Marker color="red"/>
					</Pin_>
				);
			});
		return (
			<div>
				{markers}
			</div>
		);
	}
}

// Returns distance in pixels between two
// geopoints.
function pixelDistance(zoom, p1, p2) {
	let r1 = projectionCoords(p1, zoom);
	let r2 = projectionCoords(p2, zoom);
	let dx = r1[0] - r2[0];
	let dy = r1[1] - r2[1];
	return Math.sqrt(dx*dx + dy*dy);
}

// Returns coordinates on the projection sufrace
// for the given point at given zoom level.
function projectionCoords(point, zoom) {
	return [
		getX(point.longitude, zoom),
		getY(point.latitude, zoom)
	];
}

function clusterizeMarkers(markers, distance, threshold) {

	// Create array of points to give to the algorithm.
	// Keep references to the markers on the points.
	let points = markers.map(function(marker) {
		let point = Object.assign({}, marker.props.pos);
		point.marker = marker;
		return point;
	});

	let clusters = clusterize(points, distance, threshold);

	return clusters.map(function(cluster) {
		return {
			markers: cluster.map(point => point.marker),
			center: cluster.center
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
	let clusters = points.map(p => [p]);

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

	return clusters.filter(x => x).map(function(c) {
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
		longitude: lon / cluster.length
	};
}
