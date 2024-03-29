import React from "react";
import { SlippyMap, Clusters, Label, Marker } from "../src/index.js";

const user = { coords: { latitude: 53.909689, longitude: 27.57244 } };

const drivers = [
  { id: "2606", coords: { latitude: 53.938787, longitude: 27.584183 } },
  { id: "2601", coords: { latitude: 53.903757, longitude: 27.547987 } },
  { id: "2602", coords: { latitude: 53.85691, longitude: 27.516632 } },
  { id: "2605", coords: { latitude: 53.904469, longitude: 27.504182 } },
  { id: "2603", coords: { latitude: 53.869937, longitude: 27.497484 } },
  { id: "2604", coords: { latitude: 53.927968, longitude: 27.525654 } },
];

const orders = [
  { coords: { latitude: 53.90296355003832, longitude: 27.559806978802214 } },
  { coords: { latitude: 53.903689931819486, longitude: 27.56444176390902 } },
  { coords: { latitude: 53.90804802568297, longitude: 27.561096715085373 } },
  { coords: { latitude: 53.90761027928621, longitude: 27.556838702632835 } },
  { coords: { latitude: 53.90709315593021, longitude: 27.561499687161323 } },
  { coords: { latitude: 53.90100615400766, longitude: 27.55706148657135 } },
  { coords: { latitude: 53.908955988671416, longitude: 27.55669124185427 } },
  { coords: { latitude: 53.906273261768796, longitude: 27.56545966433497 } },
  { coords: { latitude: 53.908507555124025, longitude: 27.56393545697117 } },
  { coords: { latitude: 53.903867035315564, longitude: 27.56452545061912 } },
  { coords: { latitude: 53.90598579766926, longitude: 27.557039927959572 } },
  { coords: { latitude: 53.90060229253878, longitude: 27.556207692316573 } },
  { coords: { latitude: 53.90840976601857, longitude: 27.560728986424333 } },
  { coords: { latitude: 53.905734598488095, longitude: 27.556806262637124 } },
  { coords: { latitude: 53.90893783637087, longitude: 27.55742158643696 } },
  { coords: { latitude: 53.90824133919154, longitude: 27.563984938382173 } },
  { coords: { latitude: 53.90823388423552, longitude: 27.557592381335 } },
  { coords: { latitude: 53.90923303785389, longitude: 27.55928765451716 } },
  { coords: { latitude: 53.90279618479734, longitude: 27.56475873073345 } },
  { coords: { latitude: 53.905981777806005, longitude: 27.562723790027288 } },
  { coords: { latitude: 53.90874530194332, longitude: 27.56430789243165 } },
  { coords: { latitude: 53.902753914290386, longitude: 27.56497244853907 } },
].map(function (o) {
  o.latitude += (Math.random() - 0.5) * 0.1;
  o.longitude += (Math.random() - 0.5) * 0.1;
  return o;
});

const driverStyle = {
  background: "rgba(255, 255, 255, 0.8)",
  padding: "1em",
  boxShadow: "1px 1px 2px #666",
};

const orderStyle = {
  background: "green",
  width: "24px",
  height: "24px",
  borderRadius: "12px",
  color: "white",
  fontWeight: "bold",
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

function renderDriverCluster(cluster) {
  let ids = [];
  for (let d of cluster.objects) {
    ids.push(d.id);
  }
  return <div style={driverStyle}>{ids.join(", ")}</div>;
}

function renderOrdersCluster(cluster) {
  if (cluster.objects.length == 1) {
    return <div style={orderStyle} />;
  }
  return <div style={orderStyle}>{cluster.objects.length}</div>;
}

class Taxi extends React.Component {
  constructor() {
    super();
    this.state = {
      showLabel: true,
    };
    this.toggleLabel = this.toggleLabel.bind(this);
  }

  toggleLabel() {
    this.setState((ps) => ({ showLabel: !ps.showLabel }));
  }

  render() {
    const { showLabel } = this.state;

    return (
      <SlippyMap
        defaultCenter={user.coords}
        defaultZoom={14}
        zoomStep={0.1}
        baseTilesUrl="https://b.tile.openstreetmap.org"
      >
        <Clusters objects={orders} render={renderOrdersCluster} />
        <Clusters objects={drivers} render={renderDriverCluster} />

        {showLabel && (
          <Label
            text="You are here"
            coords={user.coords}
            onClick={() => alert("You are here")}
          />
        )}
        <Marker coords={user.coords} onClick={this.toggleLabel} />
      </SlippyMap>
    );
  }
}

export default Taxi;
