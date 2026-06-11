"use client";

import { useState, useCallback, useRef } from "react";

type DragState = {
  isDragging: boolean;
  deltaX: number;
  deltaY: number;
};

type UseDragOptions = {
  revealThreshold?: number;
  onReveal?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
};

export function useDrag(options: UseDragOptions = {}) {
  const { revealThreshold = 150, onReveal, onDragStart, onDragEnd } = options;

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    deltaX: 0,
    deltaY: 0,
  });

  const hasRevealed = useRef(false);
  const dragRef = useRef<{
    isDragging: boolean;
    originX: number;
    originY: number;
  }>({ isDragging: false, originX: 0, originY: 0 });

  const pendingReveal = useRef(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = {
        isDragging: true,
        originX: e.clientX,
        originY: e.clientY,
      };
      hasRevealed.current = false;
      setDragState({ isDragging: true, deltaX: 0, deltaY: 0 });
      onDragStart?.();
    },
    [onDragStart]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const ref = dragRef.current;
      if (!ref.isDragging || hasRevealed.current) return;

      const dx = e.clientX - ref.originX;
      const dy = e.clientY - ref.originY;
      const displacement = Math.sqrt(dx * dx + dy * dy);

      if (displacement >= revealThreshold && !hasRevealed.current) {
        hasRevealed.current = true;
        pendingReveal.current = true;
      }

      setDragState({ isDragging: true, deltaX: dx, deltaY: dy });
    },
    [revealThreshold]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      e.currentTarget.releasePointerCapture(e.pointerId);
      dragRef.current.isDragging = false;

      setDragState((prev) => ({ ...prev, isDragging: false }));
      onDragEnd?.();

      if (pendingReveal.current) {
        pendingReveal.current = false;
        onReveal?.();
      }
    },
    [onReveal, onDragEnd]
  );

  const resetReveal = useCallback(() => {
    hasRevealed.current = false;
    pendingReveal.current = false;
    setDragState({ isDragging: false, deltaX: 0, deltaY: 0 });
  }, []);

  return {
    dragState,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
    },
    resetReveal,
  };
}