import React from 'react';

// A div that tracks its own dragging and calls its onMove
// callback with preprocessed drag events.
export default class DraggableDiv extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			prevMousePos: [0, 0],
			mouseDown: false,
			dragStarted: false
		};

		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onClick = this.onClick.bind(this);
	}

	preventSelection(e) {
		e.preventDefault();
	}

	componentDidMount() {
		this.element.addEventListener("selectstart", this.preventSelection);
	}

	componentWillUnmount() {
		this.element.removeEventListener("selectstart", this.preventSelection);
	}

	onMouseDown(event) {
		this.setState({
			mouseDown: true,
			dragStarted: false,
			prevMousePos: [event.pageX, event.pageY]
		});
	}

	onMouseUp(event) {
		this.setState({mouseDown: false});
	}

	onMouseMove(event) {
		let s = this.state;

		if (!s.mouseDown) {
			return;
		}

		let x = event.pageX;
		let y = event.pageY;
		let dx = x - s.prevMousePos[0];
		let dy = y - s.prevMousePos[1];

		// Mousemove can occur during a legitimate click too.
		// To account for that we let some limited mousemove
		// before considering the gesture as a dragging.

		// If this is a dragging, call the onMove handler
		// and update our pixel tracking.
		if (s.dragStarted) {
			this.props.onMove({dx, dy});
			this.setState({
				prevMousePos: [x, y]
			});
		}
		// If the "gesture" is not yet qualified as dragging,
		// see if it already qualifies by looking if the mouse
		// has travalled far enough.
		else {
			if (Math.abs(dx) >= 5 || Math.abs(dy) >= 5) {
				this.setState({dragStarted: true});
			}
		}
	}

	onClick(event) {
		if (this.state.dragStarted) {
			return;
		}
		this.props.onClick(event);
	}

	render() {
		let otherProps = Object.assign({}, this.props);
		delete otherProps.onClick;
		delete otherProps.onMove;

		return (
			<div ref={d => {this.element = d}}
				onMouseDown={this.onMouseDown}
				onMouseUp={this.onMouseUp}
				onMouseMove={this.onMouseMove}
				onMouseLeave={this.onMouseUp}
				onClick={this.onClick}
				onDragStart={(e) => e.preventDefault()}
				{...otherProps}>{this.props.children}</div>
		);
	}
}
