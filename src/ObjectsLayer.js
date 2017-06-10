import React from 'react';
import {Marker, Pin} from './Objects';
import Clusters from './Clusters';
import {Pin_} from './Pin';

export default class ObjectsLayer extends React.Component {
	render() {
		let {offset, zoom} = this.props;
		let children = React.Children.toArray(this.props.objects);

		let ch = children.map(function(ch, i) {
			let children = ch.props.children;
			let props = Object.assign({}, ch.props);
			props.offset = offset;
			props.zoom = zoom;
			let C = ch.type;
			return <C key={i} {...props}>{children}</C>;
		});

		return (
			<div className="objects-container">
				{ch}
			</div>
		);
	}
}
