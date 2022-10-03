import React, { useEffect, useRef, useCallback } from "react";

const prevent = (e) => e.preventDefault();

export const GestureDiv = ({ onMove, onClick, onWheel, children }) => {
  const elementRef = useRef();
  const state = useRef({
    prevMousePos: [0, 0],
    mouseDown: false,
    dragStarted: false,
  }).current;

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }
    elementRef.current.addEventListener("selectstart", prevent);
    return () => {
      elementRef.current.removeEventListener("selectstart", prevent);
    };
  }, [elementRef.current]);

  const $onMouseDown = useCallback((event) => {
    Object.assign(state, {
      mouseDown: true,
      dragStarted: false,
      prevMousePos: [event.pageX, event.pageY],
    });
  }, []);

  const $onMouseUp = useCallback(() => {
    state.mouseDown = false;
  }, []);

  const $onMouseMove = useCallback(
    (event) => {
      if (!state.mouseDown) {
        return;
      }
      const x = event.pageX;
      const y = event.pageY;
      const dx = x - state.prevMousePos[0];
      const dy = y - state.prevMousePos[1];

      // Mousemove can occur during a legitimate click too.
      // To account for that we let some limited mousemove
      // before considering the gesture as a dragging.

      // If this is a dragging, call the onMove handler
      // and update our pixel tracking.
      if (state.dragStarted) {
        onMove({ dx, dy });
        state.prevMousePos = [x, y];
      }
      // If the "gesture" is not yet qualified as dragging,
      // see if it already qualifies by looking if the mouse
      // has travalled far enough.
      else {
        if (Math.abs(dx) >= 5 || Math.abs(dy) >= 5) {
          state.dragStarted = true;
        }
      }
    },
    [onMove]
  );

  const $onClick = useCallback(
    (event) => {
      if (state.dragStarted) {
        return;
      }
      onClick(event);
    },
    [onClick]
  );

  return (
    <div
      ref={elementRef}
      onMouseDown={$onMouseDown}
      onMouseUp={$onMouseUp}
      onMouseMove={$onMouseMove}
      onMouseLeave={$onMouseUp}
      onClick={$onClick}
      onDragStart={prevent}
      onWheel={onWheel}
      style={{ outline: "thin solid red" }}
    >
      {children}
    </div>
  );
};
