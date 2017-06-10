import React from 'react';
import {Marker, Pin} from './Objects';
import {clusterize} from './clusters.js';
import {getX, getY, getLat, getLon} from './mercator';

// Returns coordinates on the projection sufrace
// for the given point at given zoom level.
function projectionCoords(point, zoom) {
	return [
		getX(point.longitude, zoom),
		getY(point.latitude, zoom)
	];
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

export default class ObjectsLayer extends React.Component {
	render() {
		let offset = this.props.offset;

		let children = React.Children.toArray(this.props.objects);
		let markers = children.filter(c => c.type == Marker);
		let pins = children.filter(c => c.type == Pin);

		// If clustering is turned on, convert the given list of markers
		// to a new list according to the clustering result.
		if(this.props.clusterThreshold > 0) {
			markers = clusterizeMarkers(markers, pixelDistance.bind(undefined, this.props.zoom), this.props.clusterThreshold)
				.map(function(cluster) {
					// If a marker didn't get into a cluster,
					// return it as it was.
					if(cluster.markers.length == 1) {
						return cluster.markers[0];
					}
					// Replace a cluster of markers with a single
					// generic marker.
					return <Marker pos={cluster.center} color="red"/>;
				});
		}

		let objects = pins.concat(markers)
			.map((child, i) => {
				let px = getX(child.props.pos.longitude, this.props.zoom) - offset.x;
				let py = getY(child.props.pos.latitude, this.props.zoom) - offset.y;

				let style = {
					position: 'absolute',
					left: px + 'px',
					top: py + 'px'
					//transform: `translate(${x}px, ${y}px)`
				};
				return (
					<div key={i} style={style}>{child}</div>
				);
			});

		return (
			<div className="objects-container">{objects}</div>
		);
	}
}
