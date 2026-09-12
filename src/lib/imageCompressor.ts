/**
 * JANSETU CLIENT-SIDE IMAGE COMPRESSION UTILITY
 * Resizes large high-res camera photos down to max 1280px and compresses to WebP/JPEG,
 * reducing a 5MB image to ~250KB before upload over mobile network.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

export const ALLOWED_MIME_TYPES = {
  images: ["image/jpeg", "image/png", "image/webp", "image/jpg"],
  audio: ["audio/webm", "audio/mp3", "audio/wav", "audio/ogg", "audio/m4a"],
  video: ["video/mp4", "video/webm"],
  documents: ["application/pdf"],
};

export const FILE_SIZE_LIMITS_MB = {
  image: 5,
  audio: 25,
  video: 25,
  document: 10,
};

/**
 * Compresses an image file client-side using HTML5 Canvas
 */
export async function compressImageFile(
  file: File,
  options: CompressionOptions = { maxWidth: 1280, maxHeight: 1280, quality: 0.8, maxSizeMB: 5 }
): Promise<File> {
  // Return non-image or tiny image files directly
  if (!file.type.startsWith("image/") || file.size < 200 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const maxWidth = options.maxWidth || 1280;
        const maxHeight = options.maxHeight || 1280;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to Blob
        const outputMime = file.type === "image/png" ? "image/png" : "image/jpeg";
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
              type: outputMime,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          outputMime,
          options.quality || 0.8
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

/**
 * Validates file size and type against production policy
 */
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const isImage = file.type.startsWith("image/");
  const isAudio = file.type.startsWith("audio/");
  const isVideo = file.type.startsWith("video/");
  const isPdf = file.type === "application/pdf";

  if (!isImage && !isAudio && !isVideo && !isPdf) {
    return {
      valid: false,
      error: `Invalid file format (${file.type}). Allowed formats: JPG, PNG, WEBP, MP3, WEBM, PDF.`,
    };
  }

  const sizeMB = file.size / (1024 * 1024);
  let limitMB = FILE_SIZE_LIMITS_MB.image;
  if (isAudio || isVideo) limitMB = FILE_SIZE_LIMITS_MB.audio;
  if (isPdf) limitMB = FILE_SIZE_LIMITS_MB.document;

  if (sizeMB > limitMB) {
    return {
      valid: false,
      error: `File size exceeds production limit of ${limitMB}MB (Current size: ${sizeMB.toFixed(1)}MB).`,
    };
  }

  return { valid: true };
}

