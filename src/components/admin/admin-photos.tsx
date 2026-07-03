"use client";

import { useEffect, useState } from "react";
import { supabase, photoPublicUrl } from "@/lib/supabase/client";
import type { Photo, Location, PhotoComment } from "@/lib/types";

export function AdminPhotos({ locations }: { locations: Location[] }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [comments, setComments] = useState<Record<string, PhotoComment[]>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("photos")
      .select("*")
      .order("created_at", { ascending: false });
    setPhotos(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const locationName = (id: string | null) =>
    id ? (locations.find((l) => l.id === id)?.name ?? "?") : "Sans lieu (mise en avant)";

  const deletePhoto = async (id: string) => {
    if (!confirm("Supprimer définitivement cette photo ?")) return;
    const res = await fetch(`/api/admin/photos/${id}`, { method: "DELETE" });
    if (res.ok) setPhotos((p) => p.filter((x) => x.id !== id));
  };

  const loadComments = async (photoId: string) => {
    if (comments[photoId]) {
      setOpenId(openId === photoId ? null : photoId);
      return;
    }
    const { data } = await supabase
      .from("photo_comments")
      .select("*")
      .eq("photo_id", photoId)
      .order("created_at", { ascending: true });
    setComments((c) => ({ ...c, [photoId]: data ?? [] }));
    setOpenId(photoId);
  };

  const deleteComment = async (photoId: string, commentId: string) => {
    const res = await fetch(`/api/admin/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) {
      setComments((c) => ({
        ...c,
        [photoId]: (c[photoId] ?? []).filter((x) => x.id !== commentId),
      }));
    }
  };

  if (loading) return <p className="px-6 py-8 text-center text-muted">Chargement…</p>;

  return (
    <div className="flex flex-col gap-3 px-4 pb-10">
      {photos.length === 0 && (
        <p className="px-2 py-8 text-center text-[13px] text-muted">Aucune photo pour le moment.</p>
      )}
      {photos.map((photo) => (
        <div key={photo.id} className="overflow-hidden rounded-2xl border border-line bg-card">
          <div className="flex gap-3 p-3">
            <img
              src={photoPublicUrl(photo.storage_path)}
              alt=""
              className="h-20 w-20 flex-none rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-ink">{locationName(photo.location_id)}</div>
              {photo.author_name && (
                <div className="text-[12px] text-muted">De {photo.author_name}</div>
              )}
              {photo.caption && (
                <div className="mt-1 truncate text-[12.5px] italic text-ink/70">{photo.caption}</div>
              )}
              <div className="mt-2 flex gap-3">
                <button
                  onClick={() => loadComments(photo.id)}
                  className="text-[12px] font-medium text-sage-dark underline"
                >
                  Commentaires
                </button>
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="text-[12px] font-medium text-red-600 underline"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
          {openId === photo.id && (
            <div className="border-t border-line bg-sage-light/50 px-4 py-3">
              {(comments[photo.id] ?? []).length === 0 && (
                <p className="text-[12px] text-muted">Aucun commentaire.</p>
              )}
              {(comments[photo.id] ?? []).map((c) => (
                <div key={c.id} className="mb-2 flex items-start justify-between gap-2 text-[12.5px]">
                  <div>
                    <span className="font-medium text-ink">{c.author_name} : </span>
                    <span className="text-ink/75">{c.text}</span>
                  </div>
                  <button
                    onClick={() => deleteComment(photo.id, c.id)}
                    className="flex-none text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
