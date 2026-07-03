import imageCompression from "browser-image-compression";

export async function compressPhoto(file: File): Promise<File> {
  try {
    return await imageCompression(file, {
      maxWidthOrHeight: 1600,
      maxSizeMB: 1.2,
      initialQuality: 0.8,
      useWebWorker: true,
      fileType: "image/jpeg",
    });
  } catch {
    return file;
  }
}

export function randomPhotoFilename(originalName: string) {
  const ext = originalName.includes(".") ? originalName.split(".").pop() : "jpg";
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return `${id}.${ext || "jpg"}`;
}
