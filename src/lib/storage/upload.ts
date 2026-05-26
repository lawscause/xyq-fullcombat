import { createClient } from "@/lib/supabase/client";

export type UploadBucket = "lesson-media" | "seminar-media" | "event-images" | "documents";

interface UploadResult {
  path: string;
  publicUrl: string;
}

/**
 * Upload a file to Supabase Storage.
 * Returns the storage path and public URL.
 */
export async function uploadFile(
  file: File,
  bucket: UploadBucket,
  folder?: string
): Promise<UploadResult> {
  const supabase = createClient();

  // Generate unique filename to avoid collisions
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = folder
    ? `${folder}/${timestamp}-${sanitizedName}`
    : `${timestamp}-${sanitizedName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return {
    path: data.path,
    publicUrl,
  };
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFile(
  bucket: UploadBucket,
  path: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Get accepted file types for different media categories.
 */
export const ACCEPTED_TYPES = {
  video: "video/mp4,video/quicktime,video/webm",
  image: "image/jpeg,image/png,image/webp,image/gif",
  pdf: "application/pdf",
  audio: "audio/mpeg,audio/mp4,audio/wav,audio/ogg",
  document: "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

/**
 * Max file sizes in bytes.
 */
export const MAX_FILE_SIZES = {
  video: 500 * 1024 * 1024, // 500MB
  image: 10 * 1024 * 1024, // 10MB
  pdf: 50 * 1024 * 1024, // 50MB
  audio: 100 * 1024 * 1024, // 100MB
  document: 50 * 1024 * 1024, // 50MB
} as const;
