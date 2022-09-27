import React from "react";
import { ControlledSlippyMap } from "./ControlledSlippyMap";
import withOwnCenter from "./withOwnCenter";
import withOwnZoom from "./withOwnZoom";

class SlippyMap extends React.Component {
  constructor(props) {
    super(props);
    this.M = ControlledSlippyMap;
    if (props.center == undefined) {
      this.M = withOwnCenter(this.M);
    }
    if (props.zoom == undefined) {
      this.M = withOwnZoom(this.M);
    }
  }
  render() {
    const { M } = this;
    return <M {...this.props} />;
  }
}

export default SlippyMap;
