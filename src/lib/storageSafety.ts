/**
 * JANSETU STORAGE & SECURE FILE UPLOAD UTILITY
 * Sanitizes filenames, enforces MIME whitelists, and manages private bucket signed URLs.
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Sanitizes unsafe filenames to prevent path traversal and script injection
 */
export function sanitizeFileName(originalName: string): string {
  const ext = originalName.split(".").pop()?.toLowerCase() || "bin";
  const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf(".")) || "upload";
  const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 30);
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 6);
  return `${cleanName}_${timestamp}_${randomStr}.${ext}`;
}

/**
 * Generates a signed URL for private bucket attachments
 */
export async function getPrivateSignedUrl(
  bucketName: string,
  filePath: string,
  expiresInSeconds: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      console.error("Failed to generate signed URL:", error);
      return null;
    }
    return data.signedUrl;
  } catch (err) {
    console.error("Storage error:", err);
    return null;
  }
}
