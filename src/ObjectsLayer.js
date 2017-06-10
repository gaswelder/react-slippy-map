import React from 'react';

export default class ObjectsLayer extends React.Component {
	render() {
		let {offset, zoom} = this.props;
		let children = React.Children.toArray(this.props.objects);

		let ch = children.map(function(ch, i) {
			// Render the child as it is, but with
			// additional "offset" and "zoom" properties.
			let props = Object.assign({}, ch.props);
			props.offset = offset;
			props.zoom = zoom;
			delete props.children;

			let C = ch.type;
			let children = ch.props.children;
			return <C key={i} {...props}>{children}</C>;
		});

		return (
			<div className="objects-container">
				{ch}
			</div>
		);
	}
}
