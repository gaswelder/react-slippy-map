// A simple greedy algorithm to merge points into clusters.
// * points is an array of {latitude, longitude} objects.
// * distance is a function that takes two points and returns the
//   distance in whichever units.
// * threshold is the distance threshold for the clustering, in the
//   same units as the distance.
export function clusterize(points, distance, threshold) {

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
