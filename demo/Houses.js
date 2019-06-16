import React from "react";
import { Path, SlippyMap } from "../src/index.js";

function House(props) {
  const { points } = props;

  return <Path points={points} />;
}

class Houses extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      houses: [],
      newHousePoints: []
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleDiscardClick = this.handleDiscardClick.bind(this);
    this.handleFinishClick = this.handleFinishClick.bind(this);
  }

  handleClick(coords) {
    this.setState(s => ({ newHousePoints: s.newHousePoints.concat(coords) }));
  }

  handleFinishClick() {
    if (this.state.newHousePoints.length == 0) {
      return;
    }

    this.setState(s => ({
      houses: s.houses.concat([s.newHousePoints]),
      newHousePoints: []
    }));
  }

  handleDiscardClick() {
    this.setState({
      newHousePoints: []
    });
  }

  render() {
    const { houses, newHousePoints } = this.state;
    const houseInProgress = this.state.newHousePoints.length > 0;

    return (
      <React.Fragment>
        <SlippyMap onClick={this.handleClick}>
          {houses.map((points, i) => (
            <House key={i} points={points} />
          ))}
          <House points={newHousePoints} />
        </SlippyMap>
        <div>
          <button
            type="button"
            disabled={!houseInProgress}
            onClick={this.handleFinishClick}
          >
            Finish
          </button>
          <button
            type="button"
            disabled={!houseInProgress}
            onClick={this.handleDiscardClick}
          >
            Discard
          </button>
        </div>
      </React.Fragment>
    );
  }
}

export default Houses;
