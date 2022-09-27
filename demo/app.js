import React, { useState } from "react";
import ReactDOM from "react-dom";
import Houses from "./Houses.js";
import Taxi from "./Taxi.js";
import { SlippyMap, Clusters, Label, Marker } from "../src/index.js";

const Basic = () => {
  const [area, setArea] = useState(null);

  return (
    <article>
      <h3>
        <code>onAreaChange</code> callback
      </h3>
      <div style={{ display: "flex" }}>
        <div style={{ width: 400, height: 300 }}>
          <SlippyMap
            defaultCenter={{ latitude: 53.909689, longitude: 27.57244 }}
            defaultZoom={18}
            zoomStep={0.1}
            baseTilesUrl="https://b.tile.openstreetmap.org"
            onAreaChange={setArea}
          />
        </div>
        <pre>{JSON.stringify(area, "", 2)}</pre>
      </div>
    </article>
  );
};

function Test() {
  return (
    <main>
      <div style={{ display: "flex", height: 500 }}>
        <div style={{ border: "thin solid red", flex: 1 }}>
          <Taxi />
        </div>
        <div style={{ border: "thin solid green", flex: 1 }}>
          <Houses />
        </div>
      </div>
      <section>
        <Basic />
      </section>
    </main>
  );
}

const container = document.getElementById("container");
document.body.appendChild(container);
ReactDOM.render(<Test />, container);
