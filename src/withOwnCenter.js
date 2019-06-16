import React from "react";

const defaultCenter = { latitude: 53.9049, longitude: 27.5609 };

export default function withOwnCenter(M) {
  return class WithOwnCenter extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        center: props.defaultCenter || defaultCenter
      };
      this.handleCenterChange = this.handleCenterChange.bind(this);
    }

    handleCenterChange(center) {
      this.setState({ center });
      if (this.props.onCenterChange) {
        this.props.onCenterChange(center);
      }
    }

    render() {
      return (
        <M
          onCenterChange={this.handleCenterChange}
          center={this.state.center}
          {...this.props}
        />
      );
    }
  };
}
