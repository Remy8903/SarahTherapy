import type { TargetCard } from "@/types/database";
import { SHAPE_STYLES } from "./shape-styles";

type RevealedCardProps = {
  card: TargetCard;
};

export function RevealedCard({ card }: RevealedCardProps) {
  const shapeStyle =
    SHAPE_STYLES[card.cover_shape as keyof typeof SHAPE_STYLES] ??
    SHAPE_STYLES.circle;

  const hasImage = !!card.image_url;

  return (
    <div
      className="absolute z-20 touch-none select-none"
      style={{
        left: `${card.x_position * 100}%`,
        top: `${card.y_position * 100}%`,
        transform: "translate(-50%, -50%)",
        animation: "revealPop 0.4s ease-out",
      }}
    >
      {hasImage ? (
        <div
          className="flex flex-col items-center gap-1"
          style={{ animation: "revealPop 0.4s ease-out" }}
        >
          <div
            className="overflow-hidden shadow-lg"
            style={{
              ...shapeStyle,
              width: "min(28vw, 160px)",
              height: "min(28vw, 160px)",
              borderWidth: "3px",
              borderColor: card.cover_color,
            }}
          >
            <img
              src={card.image_url!}
              alt={card.word_text}
              className="h-full w-full object-cover"
            />
          </div>
          <span
            className="rounded-full px-2.5 py-0.5 text-sm font-bold text-white shadow"
            style={{ backgroundColor: card.cover_color }}
          >
            {card.word_text}
          </span>
        </div>
      ) : (
        <div
          className="flex flex-col items-center gap-1"
          style={{ animation: "revealPop 0.4s ease-out" }}
        >
          <div
            className="flex items-center justify-center shadow-md"
            style={{
              ...shapeStyle,
              backgroundColor: `${card.cover_color}33`,
              borderWidth: "3px",
              borderColor: card.cover_color,
              width: "min(24vw, 140px)",
              height: "min(24vw, 140px)",
            }}
          >
            <span
              className="text-2xl font-bold"
              style={{ color: card.cover_color }}
            >
              {card.word_text}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}