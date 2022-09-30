import React, { useEffect, useRef, useCallback } from "react";

const prevent = (e) => e.preventDefault();

// A div that tracks its own dragging and calls its onMove
// callback with preprocessed drag events.
export const DraggableDiv = ({ onMove, onClick, children, ...otherProps }) => {
  const elementRef = useRef();
  const _state = useRef({
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
    Object.assign(_state, {
      mouseDown: true,
      dragStarted: false,
      prevMousePos: [event.pageX, event.pageY],
    });
  }, []);

  const $onMouseUp = useCallback(() => {
    _state.mouseDown = false;
  }, []);

  const $onMouseMove = useCallback(
    (event) => {
      const s = _state;
      if (!s.mouseDown) {
        return;
      }
      let x = event.pageX;
      let y = event.pageY;
      let dx = x - s.prevMousePos[0];
      let dy = y - s.prevMousePos[1];

      // Mousemove can occur during a legitimate click too.
      // To account for that we let some limited mousemove
      // before considering the gesture as a dragging.

      // If this is a dragging, call the onMove handler
      // and update our pixel tracking.
      if (s.dragStarted) {
        onMove({ dx, dy });
        _state.prevMousePos = [x, y];
      }
      // If the "gesture" is not yet qualified as dragging,
      // see if it already qualifies by looking if the mouse
      // has travalled far enough.
      else {
        if (Math.abs(dx) >= 5 || Math.abs(dy) >= 5) {
          _state.dragStarted = true;
        }
      }
    },
    [onMove]
  );

  const $onClick = useCallback(
    (event) => {
      if (_state.dragStarted) {
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
      {...otherProps}
    >
      {children}
    </div>
  );
};
