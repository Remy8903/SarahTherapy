"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CoverAssigner } from "./cover-assigner";
import { Plus, Trash2, ImageIcon, X } from "lucide-react";
import type { CardFormData, CoverShape } from "@/types/database";

const COVER_COLORS = [
  { name: "Indigo", value: "#6366f1" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Emerald", value: "#10b981" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Purple", value: "#a855f7" },
  { name: "Orange", value: "#f97316" },
  { name: "Teal", value: "#14b8a6" },
];

type WordListEditorProps = {
  cards: CardFormData[];
  onCardsChange: (cards: CardFormData[]) => void;
};

export function WordListEditor({ cards, onCardsChange }: WordListEditorProps) {
  const addCard = () => {
    const colorIndex = cards.length % COVER_COLORS.length;
    onCardsChange([
      ...cards,
      {
        word_text: "",
        cover_color: COVER_COLORS[colorIndex].value,
        cover_shape: "circle" as CoverShape,
        x_position: Math.random() * 0.8 + 0.1,
        y_position: Math.random() * 0.8 + 0.1,
      },
    ]);
  };

  const removeCard = (index: number) => {
    onCardsChange(cards.filter((_, i) => i !== index));
  };

  const updateCard = (index: number, field: keyof CardFormData, value: string | number) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], [field]: value };
    onCardsChange(updated);
  };

  const handleImageSelect = (index: number, file: File | undefined) => {
    const updated = [...cards];
    if (file) {
      updated[index] = {
        ...updated[index],
        image_file: file,
        image_url: URL.createObjectURL(file),
      };
    } else {
      const prevUrl = updated[index].image_url;
      if (prevUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(prevUrl);
      }
      updated[index] = {
        ...updated[index],
        image_file: undefined,
        image_url: undefined,
      };
    }
    onCardsChange(updated);
  };

  const removeImage = (index: number) => {
    const updated = [...cards];
    const prevUrl = updated[index].image_url;
    if (prevUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(prevUrl);
    }
    updated[index] = {
      ...updated[index],
      image_file: undefined,
      image_url: undefined,
    };
    onCardsChange(updated);
  };

  const handleCoverImageChange = (index: number, url: string | undefined, file: File | undefined) => {
    const updated = [...cards];
    const prevUrl = updated[index].cover_image_url;
    if (prevUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(prevUrl);
    }
    updated[index] = {
      ...updated[index],
      cover_image_url: url,
      cover_image_file: file,
    };
    onCardsChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Target Words
          <Button type="button" variant="outline" size="sm" onClick={addCard}>
            <Plus className="mr-1 h-4 w-4" />
            Add Word
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cards.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Add target words for the child to reveal and practice saying
          </p>
        )}
        {cards.map((card, index) => (
          <div
            key={index}
            className="rounded-lg border p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor={`word-${index}`} className="text-xs">
                    Word / Sound
                  </Label>
                  <Input
                    id={`word-${index}`}
                    placeholder="e.g., car, dog, /r/"
                    value={card.word_text}
                    onChange={(e) => updateCard(index, "word_text", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Picture (what the child sees)</Label>
                  {card.image_url ? (
                    <div className="relative inline-block">
                      <img
                        src={card.image_url}
                        alt={card.word_text || "Card image"}
                        className="h-24 w-24 rounded-lg border object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white shadow"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor={`image-${index}`}
                      className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:bg-muted/50"
                    >
                      <ImageIcon className="h-6 w-6" />
                      <span className="mt-1 text-[10px]">Upload</span>
                      <Input
                        id={`image-${index}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageSelect(index, file);
                        }}
                      />
                    </label>
                  )}
                </div>

                <CoverAssigner
                  color={card.cover_color}
                  shape={card.cover_shape}
                  coverImageUrl={card.cover_image_url}
                  coverImageFile={card.cover_image_file}
                  onColorChange={(c) => updateCard(index, "cover_color", c)}
                  onShapeChange={(s) => updateCard(index, "cover_shape", s)}
                  onCoverImageChange={(url, file) => handleCoverImageChange(index, url, file)}
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground"
                onClick={() => removeCard(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}