import { createClient } from "@/lib/supabase/client";

export async function uploadBackground(file: File, userId: string) {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("backgrounds")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("backgrounds")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function uploadCardImage(file: File, userId: string) {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("card-images")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("card-images")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function uploadCoverImage(file: File, userId: string) {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("card-images")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("card-images")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function deleteBackground(path: string) {
  const supabase = createClient();
  const { error } = await supabase.storage.from("backgrounds").remove([path]);
  if (error) throw error;
}

export async function deleteCardImage(path: string) {
  const supabase = createClient();
  const { error } = await supabase.storage.from("card-images").remove([path]);
  if (error) throw error;
}