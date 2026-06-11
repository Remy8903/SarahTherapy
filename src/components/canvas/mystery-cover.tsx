"use client";

import { useDrag } from "@/hooks/use-drag";
import type { TargetCard } from "@/types/database";
import { SHAPE_STYLES } from "./shape-styles";

type MysteryCoverProps = {
  card: TargetCard;
  onReveal: () => void;
};

export function MysteryCover({ card, onReveal }: MysteryCoverProps) {
  const { dragState, handlers } = useDrag({
    onReveal,
  });

  const hasCustomCover = !!card.cover_image_url;

  const shapeStyle =
    SHAPE_STYLES[card.cover_shape as keyof typeof SHAPE_STYLES] ??
    SHAPE_STYLES.circle;

  const translateX = dragState.isDragging ? dragState.deltaX : 0;
  const translateY = dragState.isDragging ? dragState.deltaY : 0;
  const isDisplacing =
    dragState.isDragging &&
    (Math.abs(dragState.deltaX) > 10 || Math.abs(dragState.deltaY) > 10);

  if (hasCustomCover) {
    return (
      <div
        {...handlers}
        className="absolute z-10 touch-none select-none cursor-grab active:cursor-grabbing"
        style={{
          left: `${card.x_position * 100}%`,
          top: `${card.y_position * 100}%`,
          transform: `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px))`,
          transition: dragState.isDragging ? "none" : "transform 0.2s ease-out",
          opacity: isDisplacing ? 0.7 : 1,
        }}
      >
        <img
          src={card.cover_image_url!}
          alt="Mystery cover"
          draggable={false}
          className="shadow-lg"
          style={{
            width: "min(24vw, 140px)",
            height: "min(24vw, 140px)",
            objectFit: "cover",
            ...shapeStyle,
          }}
        />
      </div>
    );
  }

  return (
    <div
      {...handlers}
      className="absolute z-10 touch-none select-none cursor-grab active:cursor-grabbing"
      style={{
        left: `${card.x_position * 100}%`,
        top: `${card.y_position * 100}%`,
        transform: `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px))`,
        transition: dragState.isDragging ? "none" : "transform 0.2s ease-out",
        opacity: isDisplacing ? 0.7 : 1,
      }}
    >
      <div
        className="flex items-center justify-center shadow-lg"
        style={{
          ...shapeStyle,
          backgroundColor: card.cover_color,
          width: "min(20vw, 120px)",
          height: "min(20vw, 120px)",
        }}
      >
        <span className="text-3xl font-bold text-white drop-shadow-md">?</span>
      </div>
    </div>
  );
}