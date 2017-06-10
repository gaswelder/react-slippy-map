import React from 'react';
import {Marker, Pin} from './Objects';
import {getX, getY, getLat, getLon} from './mercator';
import Clusters from './Clusters';
import {Pin_} from './Pin';

export default class ObjectsLayer extends React.Component {
	render() {
		let offset = this.props.offset;

		let children = React.Children.toArray(this.props.objects);
		let markers = children.filter(c => c.type == Marker);
		let pins = children.filter(c => c.type == Pin);

		let objects = pins.map((child, i) => {
				return <Pin_ key={i} pos={child.props.pos} zoom={this.props.zoom} offset={this.props.offset}>{child}</Pin_>;
			});

		return (
			<div className="objects-container">
				<Clusters offset={this.props.offset} zoom={this.props.zoom} threshold={this.props.clusterThreshold}>
					{markers}
				</Clusters>
				{objects}
			</div>
		);
	}
}
