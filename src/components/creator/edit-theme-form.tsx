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
import type { Theme, TargetCard, CardFormData } from "@/types/database";

type EditThemeFormProps = {
  theme: Theme;
  cards: TargetCard[];
};

export function EditThemeForm({ theme, cards: initialCards }: EditThemeFormProps) {
  const [title, setTitle] = useState(theme.title);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(
    theme.background_url
  );
  const [cardForms, setCardForms] = useState<CardFormData[]>(
    initialCards.map((c) => ({
      word_text: c.word_text,
      image_url: c.image_url ?? undefined,
      cover_image_url: c.cover_image_url ?? undefined,
      cover_color: c.cover_color,
      cover_shape: c.cover_shape as CardFormData["cover_shape"],
      x_position: c.x_position,
      y_position: c.y_position,
    }))
  );
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

      let backgroundUrl = theme.background_url;
      if (backgroundFile) {
        backgroundUrl = await uploadBackground(backgroundFile, user.id);
      }

      const { error: themeError } = await supabase
        .from("themes")
        .update({ title, background_url: backgroundUrl })
        .eq("id", theme.id);

      if (themeError) throw themeError;

      await supabase.from("target_cards").delete().eq("theme_id", theme.id);

      if (cardForms.length > 0) {
        const cardsToInsert = [];

        for (const card of cardForms) {
          let imageUrl: string | null = null;
          if (card.image_file) {
            imageUrl = await uploadCardImage(card.image_file, user.id);
          } else if (card.image_url && !card.image_url.startsWith("blob:")) {
            imageUrl = card.image_url;
          }

          let coverImageUrl: string | null = null;
          if (card.cover_image_file) {
            coverImageUrl = await uploadCoverImage(card.cover_image_file, user.id);
          } else if (card.cover_image_url && !card.cover_image_url.startsWith("blob:")) {
            coverImageUrl = card.cover_image_url;
          }

          cardsToInsert.push({
            word_text: card.word_text,
            image_url: imageUrl,
            cover_image_url: coverImageUrl,
            cover_color: card.cover_color,
            cover_shape: card.cover_shape,
            theme_id: theme.id,
            sort_order: cardsToInsert.length,
            x_position: card.x_position ?? Math.random() * 0.8 + 0.1,
            y_position: card.y_position ?? Math.random() * 0.8 + 0.1,
            revealed: false,
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Theme</h1>
        <p className="text-muted-foreground">
          Update your theme settings and target words
        </p>
      </div>

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

          <WordListEditor cards={cardForms} onCardsChange={setCardForms} />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}