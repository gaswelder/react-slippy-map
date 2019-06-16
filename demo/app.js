import React from "react";
import ReactDOM from "react-dom";
import Houses from "./Houses.js";
import Taxi from "./Taxi.js";

function Test() {
  return (
    <div style={{ display: "flex", height: 500 }}>
      <div style={{ border: "thin solid red", flex: 1 }}>
        <Taxi />
      </div>
      <div style={{ border: "thin solid green", flex: 1 }}>
        <Houses />
      </div>
    </div>
  );
}

const container = document.getElementById("container");
document.body.appendChild(container);
ReactDOM.render(<Test />, container);
