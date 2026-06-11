"use client";

import { useCanvasState } from "@/hooks/use-canvas-state";
import { MysteryCover } from "./mystery-cover";
import { RevealedCard } from "./revealed-card";
import { CanvasControls } from "./canvas-controls";
import { useState } from "react";
import type { Theme, TargetCard } from "@/types/database";

type SessionCanvasProps = {
  theme: Theme;
  initialCards: TargetCard[];
};

export function SessionCanvas({ theme, initialCards }: SessionCanvasProps) {
  const { cards, revealCard, resetCards, isSyncing } = useCanvasState(
    theme.id,
    initialCards
  );
  const [isFullscreen, setIsFullscreen] = useState(false);

  const revealedCount = cards.filter((c) => c.revealed).length;
  const totalCount = cards.length;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <CanvasControls
        revealedCount={revealedCount}
        totalCount={totalCount}
        isSyncing={isSyncing}
        onReset={resetCards}
        onFullscreen={toggleFullscreen}
      />

      <div className="relative flex-1 overflow-hidden rounded-lg border bg-muted">
        {theme.background_url ? (
          <img
            src={theme.background_url}
            alt={theme.title}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-sky-50">
            <p className="text-xl font-semibold text-muted-foreground">
              {theme.title}
            </p>
          </div>
        )}

        {cards.map((card) =>
          card.revealed ? (
            <RevealedCard key={card.id} card={card} />
          ) : (
            <MysteryCover
              key={card.id}
              card={card}
              onReveal={() => revealCard(card.id)}
            />
          )
        )}
      </div>
    </div>
  );
}