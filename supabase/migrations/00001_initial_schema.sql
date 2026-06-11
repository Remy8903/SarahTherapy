-- =============================================
-- TherapySarah: Initial Database Schema
-- Run this in the Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. profiles (1:1 with auth.users)
-- =============================================
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at  TIMESTAMPTZ DEFAULT now(),
  email       TEXT NOT NULL,
  full_name   TEXT
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Therapists can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 2. themes
-- =============================================
CREATE TABLE public.themes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  background_url  TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can view own themes"
  ON public.themes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Therapists can insert own themes"
  ON public.themes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Therapists can update own themes"
  ON public.themes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Therapists can delete own themes"
  ON public.themes FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 3. target_cards
-- =============================================
CREATE TABLE public.target_cards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id        UUID NOT NULL REFERENCES public.themes(id) ON DELETE CASCADE,
  word_text       TEXT NOT NULL,
  image_url       TEXT,
  cover_image_url TEXT,
  cover_color     TEXT NOT NULL DEFAULT '#6366f1',
  cover_shape     TEXT NOT NULL DEFAULT 'circle',
  x_position     FLOAT NOT NULL DEFAULT 0.5,
  y_position     FLOAT NOT NULL DEFAULT 0.5,
  revealed        BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order      INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.target_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can view cards of own themes"
  ON public.target_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.themes
      WHERE themes.id = target_cards.theme_id
      AND themes.user_id = auth.uid()
    )
  );

CREATE POLICY "Therapists can insert cards into own themes"
  ON public.target_cards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.themes
      WHERE themes.id = target_cards.theme_id
      AND themes.user_id = auth.uid()
    )
  );

CREATE POLICY "Therapists can update cards of own themes"
  ON public.target_cards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.themes
      WHERE themes.id = target_cards.theme_id
      AND themes.user_id = auth.uid()
    )
  );

CREATE POLICY "Therapists can delete cards of own themes"
  ON public.target_cards FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.themes
      WHERE themes.id = target_cards.theme_id
      AND themes.user_id = auth.uid()
    )
  );

-- =============================================
-- 4. Storage buckets & Corrected Policies
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('backgrounds', 'backgrounds', true),
       ('card-images', 'card-images', true)
ON CONFLICT (id) DO NOTHING;

-- INSERT POLICIES
CREATE POLICY "Therapists can upload backgrounds"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'backgrounds'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Therapists can upload card images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'card-images'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- DELETE POLICIES
CREATE POLICY "Therapists can delete own backgrounds"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'backgrounds'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Therapists can delete own card images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'card-images'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- SELECT POLICIES
CREATE POLICY "Anyone can view backgrounds"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'backgrounds');

CREATE POLICY "Anyone can view card images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'card-images');