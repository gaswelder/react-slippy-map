import React from 'react';
import ReactDOM from 'react-dom';
import Component from './component';
import {Marker} from './component';

class Test extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			lat: 53.9049,
			lon: 27.5609,
			zoom: 16,
			markers: []
		};
		let b = ['left', 'right', 'in', 'out', 'onCenterChange', 'onClick'];
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

	diff(key, delta) {
		this.setState(function(s) {
			return {[key]: s[key] + delta};
		});
	}

	out() { this.diff('zoom', -1); }
	in() { this.diff('zoom', 1); }

	onClick(arg) {
		this.setState(function(s) {
			return {markers: s.markers.concat(arg)};
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
					zoom={this.state.zoom}
					onCenterChange={this.onCenterChange}
					onClick={this.onClick}>

					{this.state.markers.map((pos, i) => <Marker key={i} pos={pos}/>)}

				</Component>
				<div>
					<button onClick={this.left}>Left</button>
					<button onClick={this.right}>Right</button>
					<button onClick={this.out}>-</button>
					<button onClick={this.in}>+</button>
				</div>
			</div>
		);
	}
}

let container = document.createElement('div');
document.body.appendChild(container);
ReactDOM.render(<Test/>, container);
