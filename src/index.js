import React from "react";
import Clusters from "./Clusters";
import Pin from "./Pin";
import SlippyMap from "./SlippyMap";
import SlippyMapWithControls from "./SlippyMapWithControls";
import {
  Marker as PureMarker,
  Label as PureLabel,
  InfoBox as PureInfoBox
} from "./elements";
import Path from "./Path";

export { Clusters, Pin, SlippyMap, SlippyMapWithControls, Path };

export function pinned(Component) {
  let f = function(props) {
    if (!props.coords) {
      console.error(
        `Missing "coords" property from the pinned version of "${
          Component.name
        }"`
      );
    }
    // The pin only requires coords, offset and zoom properties.
    // The rest is for the underlying element.
    // Remember we need offset and zoom only internally.
    let pinKeys = ["coords", "offset", "zoom"];
    let pinProps = {};
    let restProps = Object.assign({}, props);
    for (let k of pinKeys) {
      pinProps[k] = props[k];
      delete restProps[k];
    }
    return (
      <Pin {...pinProps}>
        <Component {...restProps} />
      </Pin>
    );
  };
  f._isPinned = true;
  return f;
}

export const Marker = pinned(PureMarker);
export const Label = pinned(PureLabel);
export const InfoBox = pinned(PureInfoBox);
