import React from "react";

const containerStyle = {
  position: "relative",
  height: "100%"
};

const zoomStyle = {
  position: "absolute",
  right: "10px",
  bottom: "10px"
};

function ZoomControl(props) {
  const { value, min, max, step, onChange } = props;

  const handleChange = e => {
    onChange(e.target.value);
  };

  return (
    <div style={zoomStyle}>
      ({value})
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}

export default function withOwnZoom(M) {
  class WithOwnZoom extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        zoom: props.defaultZoom
      };
      this.handleChange = this.handleChange.bind(this);
      this.onWheel = this.onWheel.bind(this);
    }

    handleChange(val) {
      const { minZoom, maxZoom } = this.props;

      const fixRounding = num => Math.round(num * 100) / 100;
      const zoom = Math.min(maxZoom, Math.max(minZoom, fixRounding(val)));
      this.setState({ zoom });
    }

    onWheel(event) {
      // Throttle barrier
      if (this.ignoreWheelUntil && event.timeStamp < this.ignoreWheelUntil) {
        return;
      }

      const { zoomStep } = this.props;
      const { zoom } = this.state;

      let delay = 33 + this.props.zoomStep * 166;
      if (delay > 200) delay = 200;
      this.ignoreWheelUntil = event.timeStamp + delay;

      this.handleChange(event.deltaY > 0 ? zoom - zoomStep : zoom + zoomStep);
    }

    render() {
      return (
        <div style={containerStyle}>
          <M zoom={this.state.zoom} onWheel={this.onWheel} {...this.props} />
          <ZoomControl
            onChange={this.handleChange}
            min={this.props.minZoom}
            max={this.props.maxZoom}
            value={this.state.zoom}
            step={this.props.zoomStep}
          />
        </div>
      );
    }
  }
  WithOwnZoom.defaultProps = {
    defaultZoom: 16,
    minZoom: 0,
    maxZoom: 20,
    zoomStep: 0.1
  };
  return WithOwnZoom;
}
