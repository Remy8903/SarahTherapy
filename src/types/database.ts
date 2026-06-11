export type Profile = {
  id: string;
  updated_at: string | null;
  email: string;
  full_name: string | null;
};

export type Theme = {
  id: string;
  user_id: string;
  title: string;
  background_url: string | null;
  created_at: string;
};

export type TargetCard = {
  id: string;
  theme_id: string;
  word_text: string;
  image_url: string | null;
  cover_image_url: string | null;
  cover_color: string;
  cover_shape: string;
  x_position: number;
  y_position: number;
  revealed: boolean;
  sort_order: number;
};

export type CoverShape = "circle" | "square" | "star" | "triangle" | "diamond" | "hexagon";

export type CardFormData = {
  word_text: string;
  image_url?: string;
  image_file?: File;
  cover_image_url?: string;
  cover_image_file?: File;
  cover_color: string;
  cover_shape: CoverShape;
  x_position: number;
  y_position: number;
};

export type ThemeFormData = {
  title: string;
  background_url?: string;
  cards: CardFormData[];
};