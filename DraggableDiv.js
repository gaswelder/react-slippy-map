import React from 'react';

// A div that tracks its own dragging and calls its onMove
// callback with preprocessed drag events.
export default class DraggableDiv extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			prevDragPos: [0, 0],
			mouseDown: false
		};

		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onClick = this.onClick.bind(this);
	}

	onMouseDown(event) {
		this.setState({
			mouseDown: true,
			prevDragPos: [event.pageX, event.pageY]
		});
	}

	onMouseUp() {
		this.setState({mouseDown: false});
	}

	onMouseMove(event) {
		if (!this.state.mouseDown) {
			return;
		}

		let x = event.pageX;
		let y = event.pageY;
		let dx = x - this.state.prevDragPos[0];
		let dy = y - this.state.prevDragPos[1];

		this.props.onMove({dx, dy});
		this.setState({
			prevDragPos: [x, y]
		});
	}

	onClick(event) {
		this.props.onClick(event);
	}

	render() {
		let otherProps = Object.assign({}, this.props);
		delete otherProps.onClick;
		delete otherProps.onMove;

		return (
			<div
				onMouseDown={this.onMouseDown}
				onMouseUp={this.onMouseUp}
				onMouseMove={this.onMouseMove}
				onClick={this.onClick}
				onDragStart={(e) => e.preventDefault()}
				{...otherProps}>{this.props.children}</div>
		);
	}
}
