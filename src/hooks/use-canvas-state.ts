"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TargetCard } from "@/types/database";

export function useCanvasState(themeId: string, initialCards: TargetCard[]) {
  const [cards, setCards] = useState(initialCards);
  const [isSyncing, setIsSyncing] = useState(false);
  const revealedIdsRef = useRef<Set<string>>(new Set());
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const revealCard = useCallback((cardId: string) => {
    revealedIdsRef.current.add(cardId);
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, revealed: true } : card
      )
    );
  }, []);

  const resetCards = useCallback(() => {
    revealedIdsRef.current.clear();
    setCards((prev) =>
      prev.map((card) => ({
        ...card,
        revealed: false,
      }))
    );
  }, []);

  useEffect(() => {
    const ids = revealedIdsRef.current;
    if (ids.size === 0) return;

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(async () => {
      const idsToSync = Array.from(ids);
      if (idsToSync.length === 0) return;

      setIsSyncing(true);
      const supabase = createClient();

      for (const cardId of idsToSync) {
        await supabase
          .from("target_cards")
          .update({ revealed: true })
          .eq("id", cardId);
      }

      setIsSyncing(false);
    }, 500);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [cards]);

  return {
    cards,
    revealCard,
    resetCards,
    isSyncing,
  };
}