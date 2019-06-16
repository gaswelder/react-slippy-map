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
  return (
    <div style={zoomStyle}>
      ({props.current})
      <button
        type="button"
        onClick={props.less}
        disabled={props.current <= props.min}
      >
        &minus;
      </button>
      <button
        type="button"
        onClick={props.more}
        disabled={props.current >= props.max}
      >
        +
      </button>
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
      this.zoomOut = this.zoomOut.bind(this);
      this.zoomIn = this.zoomIn.bind(this);
      this.onWheel = this.onWheel.bind(this);
    }

    zoomOut() {
      this.setState(function(s) {
        let zoom = Math.round((s.zoom - this.props.zoomStep) * 100) / 100;
        if (zoom < this.props.minZoom) {
          zoom = this.props.minZoom;
        }
        return { zoom };
      });
    }

    zoomIn() {
      this.setState(function(s) {
        let zoom = Math.round((s.zoom + this.props.zoomStep) * 100) / 100;
        if (zoom > this.props.maxZoom) {
          zoom = this.props.maxZoom;
        }
        return { zoom };
      });
    }

    onWheel(event) {
      // Throttle barrier
      if (this.ignoreWheelUntil && event.timeStamp < this.ignoreWheelUntil) {
        return;
      }
      let delay = 33 + this.props.zoomStep * 166;
      if (delay > 200) delay = 200;
      this.ignoreWheelUntil = event.timeStamp + delay;

      event.deltaY > 0 ? this.zoomOut() : this.zoomIn();
    }

    render() {
      return (
        <div style={containerStyle}>
          <M zoom={this.state.zoom} onWheel={this.onWheel} {...this.props} />
          <ZoomControl
            less={this.zoomOut}
            more={this.zoomIn}
            min={this.props.minZoom}
            max={this.props.maxZoom}
            current={this.state.zoom}
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
