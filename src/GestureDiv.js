import React, { useEffect, useRef, useCallback } from "react";

const prevent = (e) => e.preventDefault();

export const GestureDiv = ({
  onMove,
  onMoveEnd,
  onClick,
  onPinch,
  onWheel,
  style,
}) => {
  const elementRef = useRef();
  const state = useRef({
    prevMousePos: [0, 0],
    mouseDown: false,
    dragStarted: false,
    pinchDistance: 0,
    dragSpeed: [0, 0],
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
      dragSpeed: [0, 0],
    });
  }, []);

  const $onMouseMove = useCallback(
    (event) => {
      if (!state.mouseDown) {
        return;
      }
      state.dx = event.pageX - state.prevMousePos[0];
      state.dy = event.pageY - state.prevMousePos[1];

      // Mousemove can occur during a legitimate click too.
      // To account for that we let some limited mousemove
      // before considering the gesture as a dragging.

      // If this is a dragging, call the onMove handler
      // and update our pixel tracking.
      if (state.dragStarted) {
        onMove({ dx: state.dx, dy: state.dy });
        state.prevMousePos = [event.pageX, event.pageY];
      }
      // If the "gesture" is not yet qualified as dragging,
      // see if it already qualifies by looking if the mouse
      // has travalled far enough.
      else {
        if (Math.abs(state.dx) >= 5 || Math.abs(state.dy) >= 5) {
          state.dragStarted = true;
        }
      }
    },
    [onMove]
  );

  const $onMouseUp = useCallback(() => {
    if (!state.mouseDown) {
      return;
    }
    state.mouseDown = false;
    if (!state.dragStarted) {
      return;
    }
    state.dragStarted = false;
    onMoveEnd && onMoveEnd({ dx: state.dx, dy: state.dy });
  }, [onMoveEnd]);

  const $onClick = useCallback(
    (event) => {
      if (state.dragStarted) {
        return;
      }
      onClick(event);
    },
    [onClick]
  );

  const dist = (t1, t2) =>
    Math.sqrt((t1.pageX - t2.pageX) ** 2 + (t1.pageY - t2.pageY) ** 2);

  return (
    <div
      style={style}
      ref={elementRef}
      onPointerDown={$onMouseDown}
      onPointerUp={$onMouseUp}
      onPointerMove={$onMouseMove}
      onPointerLeave={$onMouseUp}
      onTouchStart={(e) => {
        if (e.touches.length == 2) {
          state.pinchDistance = dist(e.touches[0], e.touches[1]);
        }
      }}
      onTouchMove={(e) => {
        if (e.touches.length == 2) {
          const d = state.pinchDistance;
          state.pinchDistance = dist(e.touches[0], e.touches[1]);
          onPinch && onPinch({ pinch: state.pinchDistance - d });
        }
      }}
      onClick={$onClick}
      onDragStart={prevent}
      onWheel={onWheel}
    ></div>
  );
};
