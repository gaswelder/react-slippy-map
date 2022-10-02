import React, { useMemo } from "react";
import { ControlledSlippyMap } from "./ControlledSlippyMap";
import withOwnCenter from "./withOwnCenter";
import withOwnZoom from "./withOwnZoom";

export const SlippyMap = (props) => {
  const M = useMemo(() => {
    let M = ControlledSlippyMap;
    if (props.center == undefined) {
      M = withOwnCenter(M);
    }
    if (props.zoom == undefined) {
      M = withOwnZoom(M);
    }
    return M;
  }, [props.center == undefined, props.zoom == undefined]);
  return <M {...props} />;
};
