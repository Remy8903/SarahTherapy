"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadBackground, uploadCardImage, uploadCoverImage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WordListEditor } from "./word-list-editor";
import type { CardFormData } from "@/types/database";

export function ThemeForm() {
  const [title, setTitle] = useState("");
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(
    null
  );
  const [cards, setCards] = useState<CardFormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBackgroundFile(file);
    const reader = new FileReader();
    reader.onload = () => setBackgroundPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let backgroundUrl: string | null = null;
      if (backgroundFile) {
        backgroundUrl = await uploadBackground(backgroundFile, user.id);
      }

      const { data: theme, error: themeError } = await supabase
        .from("themes")
        .insert({
          title,
          background_url: backgroundUrl,
          user_id: user.id,
        })
        .select()
        .single();

      if (themeError) throw themeError;

      if (cards.length > 0) {
        const cardsToInsert = [];

        for (const card of cards) {
          let imageUrl: string | null = null;
          if (card.image_file) {
            imageUrl = await uploadCardImage(card.image_file, user.id);
          } else if (card.image_url) {
            imageUrl = card.image_url;
          }

          let coverImageUrl: string | null = null;
          if (card.cover_image_file) {
            coverImageUrl = await uploadCoverImage(card.cover_image_file, user.id);
          } else if (card.cover_image_url) {
            coverImageUrl = card.cover_image_url;
          }

          cardsToInsert.push({
            theme_id: theme.id,
            word_text: card.word_text,
            image_url: imageUrl,
            cover_image_url: coverImageUrl,
            cover_color: card.cover_color,
            cover_shape: card.cover_shape,
            sort_order: cardsToInsert.length,
            x_position: card.x_position ?? Math.random() * 0.8 + 0.1,
            y_position: card.y_position ?? Math.random() * 0.8 + 0.1,
          });
        }

        const { error: cardsError } = await supabase
          .from("target_cards")
          .insert(cardsToInsert);

        if (cardsError) throw cardsError;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-8">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Theme Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Theme Title</Label>
              <Input
                id="title"
                placeholder="e.g., Ocean Adventure, Space Explorers"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="background">Background Image</Label>
              <Input
                id="background"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {backgroundPreview && (
                <div className="mt-2 overflow-hidden rounded-lg border">
                  <img
                    src={backgroundPreview}
                    alt="Background preview"
                    className="h-48 w-full object-cover"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <WordListEditor cards={cards} onCardsChange={setCards} />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !title}>
            {loading ? "Creating..." : "Create Theme"}
          </Button>
        </div>
      </div>
    </form>
  );
}