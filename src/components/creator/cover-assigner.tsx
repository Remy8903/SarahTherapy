"use client";

import { Input } from "@/components/ui/input";
import { X, ImageIcon } from "lucide-react";
import type { CoverShape } from "@/types/database";

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

const COVER_SHAPES: { value: CoverShape; label: string }[] = [
  { value: "circle", label: "Circle" },
  { value: "square", label: "Square" },
  { value: "star", label: "Star" },
  { value: "triangle", label: "Triangle" },
  { value: "diamond", label: "Diamond" },
  { value: "hexagon", label: "Hexagon" },
];

type CoverAssignerProps = {
  color: string;
  shape: CoverShape;
  coverImageUrl?: string;
  coverImageFile?: File;
  onColorChange: (color: string) => void;
  onShapeChange: (shape: CoverShape) => void;
  onCoverImageChange: (url: string | undefined, file: File | undefined) => void;
};

export function CoverAssigner({
  color,
  shape,
  coverImageUrl,
  onColorChange,
  onShapeChange,
  onCoverImageChange,
}: CoverAssignerProps) {
  const hasCustomImage = !!coverImageUrl;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    onCoverImageChange(previewUrl, file);
  };

  const removeImage = () => {
    onCoverImageChange(undefined, undefined);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <span className="text-xs font-medium">Cover Image</span>
        <span className="text-xs text-muted-foreground ml-1">
          (upload a custom cover, or use shape + color below)
        </span>
      </div>

      {hasCustomImage ? (
        <div className="flex items-center gap-2">
          <div className="relative">
            <img
              src={coverImageUrl}
              alt="Cover preview"
              className="h-16 w-16 rounded-lg border object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-white shadow"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
          <span className="text-xs text-muted-foreground">Custom cover image</span>
        </div>
      ) : (
        <label
          htmlFor="cover-image-upload"
          className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:bg-muted/50"
        >
          <ImageIcon className="h-5 w-5" />
          <span className="text-[9px]">Upload</span>
          <Input
            id="cover-image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>
      )}

      {!hasCustomImage && (
        <>
          <div className="space-y-1">
            <span className="text-xs font-medium">Cover Color</span>
            <div className="flex flex-wrap gap-1.5">
              {COVER_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => onColorChange(c.value)}
                  className={`h-6 w-6 rounded-full border-2 transition-all ${
                    color === c.value
                      ? "scale-110 border-foreground"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium">Shape</span>
            <div className="flex flex-wrap gap-1.5">
              {COVER_SHAPES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => onShapeChange(s.value)}
                  className={`rounded-md border px-2 py-0.5 text-xs transition-all ${
                    shape === s.value
                      ? "border-foreground bg-foreground/10"
                      : "border-border"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}