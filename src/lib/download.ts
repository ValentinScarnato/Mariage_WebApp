import { photoPublicUrl } from "@/lib/supabase/client";

function filenameFor(storagePath: string, fallback: string) {
  return storagePath.split("/").pop() || fallback;
}

export async function downloadPhoto(photo: { storage_path: string }) {
  const res = await fetch(photoPublicUrl(photo.storage_path));
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filenameFor(photo.storage_path, "photo.jpg");
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}

export async function downloadAllPhotos(
  photos: { storage_path: string }[],
  onProgress?: (done: number, total: number) => void
) {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  let done = 0;

  await Promise.all(
    photos.map(async (photo, i) => {
      const res = await fetch(photoPublicUrl(photo.storage_path));
      const blob = await res.blob();
      zip.file(filenameFor(photo.storage_path, `photo-${i + 1}.jpg`), blob);
      done += 1;
      onProgress?.(done, photos.length);
    })
  );

  const content = await zip.generateAsync({ type: "blob" });
  const blobUrl = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = "photos-mariage.zip";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}
