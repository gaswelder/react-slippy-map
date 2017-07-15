function randomPos() {
	return {
		latitude: 53.9049 + (Math.random()-0.5) * 0.01,
		longitude: 27.5609 + (Math.random()-0.5) * 0.01
	};
}

function gen(size, func) {
	let r = [];
	for(let i = 0; i < size; i++) {
		r.push(func());
	}
	return r;
}

const pointsSource = {
	all: [],

	get(n) {
		let m = n - this.all.length;
		if(m > 0) {
			this.all = this.all.concat(gen(m, randomPos));
		}
		return this.all.slice(0, n);
	}
};

function settings() {
	return (
		<div>
			<label>Zoom</label>
			<Range max={19} onChange={this.setZoom} value={this.state.zoom}/>
		</div>
		<div>
			<label>Number of markers</label>
			<Range max={500} onChange={this.setMarkersNumber} value={this.state.markersNumber}/>
		</div>
		<div>
			<label>Clustering</label>
			<Range max={50} onChange={this.setClusterThreshold} value={this.state.clusterThreshold}/>
		</div>
	);
}

function Range(props) {
	return (
		<div>
			<input type="range" min="0" max={props.max} onChange={props.onChange} value={props.value}/>
			<span>{props.value}</span>
		</div>
	);
}
