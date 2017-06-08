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

class Test extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			lat: 53.9049,
			lon: 27.5609,
			zoom: 16,
			markers: gen(100, randomPos),
			notes: [],
			clusterThreshold: 10
		};
		let b = ['left', 'right', 'in', 'out', 'onCenterChange', 'onClick', 'setClusterThreshold'];
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

	left() {
		this.diff('lon', -0.001);
	}

	right() {
		this.diff('lon', 0.001);
	}

	setClusterThreshold(e) {
		this.setState({clusterThreshold: e.target.value});
	}

	diff(key, delta) {
		this.setState(function(s) {
			return {[key]: s[key] + delta};
		});
	}

	out() { this.diff('zoom', -1); }
	in() { this.diff('zoom', 1); }

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
		return (
			<div>
				<Component
					center={center}
					clusterThreshold={this.state.clusterThreshold}
					zoom={this.state.zoom}
					onCenterChange={this.onCenterChange}
					onClick={this.onClick}>

					{this.state.markers.map((pos, i) => <Marker key={i} pos={pos}/>)}
					{this.state.notes.map((note, i) => <Pin key={'note-'+i} pos={note.pos}>{note.text}</Pin>)}
				</Component>
				<div>
					<button onClick={this.left}>Left</button>
					<button onClick={this.right}>Right</button>
					<button onClick={this.out}>-</button>
					<button onClick={this.in}>+</button>
				</div>
				<div>
					<label>Clustering</label>
					<input type="range" min="0" max="50" onChange={this.setClusterThreshold} value={this.state.clusterThreshold}/>
					<span>{this.state.clusterThreshold}</span>
				</div>
			</div>
		);
	}
}

let container = document.createElement('div');
document.body.appendChild(container);
ReactDOM.render(<Test/>, container);
