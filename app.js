import React from 'react';
import ReactDOM from 'react-dom';
import Component from './component';
import {Marker, Pin} from './component';

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

class Test extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			lat: 53.9049,
			lon: 27.5609,
			zoom: 16,
			markersNumber: 10,
			notes: [],
			clusterThreshold: 10
		};
		let b = ['onCenterChange', 'onClick', 'setClusterThreshold', 'setMarkersNumber', 'setZoom'];
		for(let k of b) {
			this[k] = this[k].bind(this);
		}
	}

	// componentDidMount() {
	// 	let s = new Swarm();
	// 	s.subscribe(markers => {
	// 		this.setState({markers});
	// 	})
	// }

	onCenterChange(coords) {
		this.setState({
			lat: coords.latitude,
			lon: coords.longitude
		});
		//console.log(coords);
	}

	setClusterThreshold(e) {
		this.setState({clusterThreshold: e.target.value});
	}

	setMarkersNumber(e) {
		this.setState({markersNumber: e.target.value});
	}

	setZoom(e) {
		this.setState({zoom: e.target.value});
	}

	onClick(pos) {
		let note = {pos, text: JSON.stringify(pos)};
		this.setState(function(s) {
			return {notes: s.notes.concat(note)};
		});
	}

	render() {
		let center = {
			latitude: this.state.lat,
			longitude: this.state.lon
		};

		let markers = pointsSource.get(this.state.markersNumber);
		return (
			<div>
				<Component
					center={center}
					clusterThreshold={this.state.clusterThreshold}
					zoom={this.state.zoom}
					onCenterChange={this.onCenterChange}
					onClick={this.onClick}>

					{markers.map((pos, i) => <Marker key={i} pos={pos}/>)}
					{this.state.notes.map((note, i) => <Pin key={'note-'+i} pos={note.pos}>{note.text}</Pin>)}
				</Component>
				<div>
					<label>Zoom</label>
					<Range max={22} onChange={this.setZoom} value={this.state.zoom}/>
				</div>
				<div>
					<label>Number of markers</label>
					<Range max={500} onChange={this.setMarkersNumber} value={this.state.markersNumber}/>
				</div>
				<div>
					<label>Clustering</label>
					<Range max={50} onChange={this.setClusterThreshold} value={this.state.clusterThreshold}/>
				</div>
			</div>
		);
	}
}

function Range(props) {
	return (
		<div>
			<input type="range" min="0" max={props.max} onChange={props.onChange} value={props.value}/>
			<span>{props.value}</span>
		</div>
	);
}

let container = document.createElement('div');
document.body.appendChild(container);
ReactDOM.render(<Test/>, container);
