import { useRef } from "react";
import report from "./report";

export const useStabilizer = (xs) => {
  const val = useRef([]);
  if (!deepEq(xs, val.current)) {
    val.current = xs;
  }
  return val.current;
};

const deepEq = (a, b) => {
  if (a === b) {
    return true;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length == b.length && a.every((x, i) => deepEq(x, b[i]));
  }
  if (typeof a == "object" && typeof b == "object") {
    const kk = Object.keys(a);
    return (
      kk.length == Object.keys(b).length && kk.every((k) => deepEq(a[k], b[k]))
    );
  }
  return false;
};

export const useTracker = (props) => {
  const prev = useRef({}).current;
  const changes = Object.fromEntries(
    Object.entries(props).filter(([k, v]) => prev[k] !== v)
  );
  Object.assign(prev, changes);
};

export const warnDefault = (message, def) => {
  report.propsFault(message);
  return def;
};
