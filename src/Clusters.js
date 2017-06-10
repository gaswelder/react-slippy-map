import React from 'react';
import {getX, getY, getLat, getLon} from './mercator';
import {clusterize} from './clusters.js';
import Pin_ from './Pin';
import {Marker} from './Objects';

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
