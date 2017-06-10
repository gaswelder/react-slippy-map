import React from 'react';

export default class ObjectsLayer extends React.Component {
	render() {
		let {offset, zoom} = this.props;
		let children = React.Children.toArray(this.props.objects);

		let ch = children.map(function(ch, i) {
			return withProps(ch, {offset, zoom}, i);
		});

		return (
			<div className="objects-container">
				{ch}
			</div>
		);
	}
}

function withProps(ch, more, key) {
	let props = Object.assign({}, ch.props, more);
	let C = ch.type;
	return <C key={key} {...props}>{ch.props.children}</C>;
}
