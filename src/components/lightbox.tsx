"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, photoPublicUrl } from "@/lib/supabase/client";
import { useGuestName } from "@/lib/guest-name";
import type { PhotoComment } from "@/lib/types";
import type { GridPhoto } from "@/components/photo-grid";

export function Lightbox({
  photos,
  index,
  onClose,
  onIndexChange,
}: {
  photos: GridPhoto[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const photo = photos[index];
  const [comments, setComments] = useState<PhotoComment[]>([]);
  const [draftComment, setDraftComment] = useState("");
  const [posting, setPosting] = useState(false);
  const { name, setName } = useGuestName();
  const touchStartX = useRef<number | null>(null);

  const next = useCallback(() => {
    onIndexChange((index + 1) % photos.length);
  }, [index, photos.length, onIndexChange]);

  const prev = useCallback(() => {
    onIndexChange((index - 1 + photos.length) % photos.length);
  }, [index, photos.length, onIndexChange]);

  useEffect(() => {
    let cancelled = false;
    if (!photo) return;
    supabase
      .from("photo_comments")
      .select("*")
      .eq("photo_id", photo.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (!cancelled) setComments(data ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [photo?.id]);

  if (!photo) return null;

  const initial = (s: string) => (s || "?").trim().charAt(0).toUpperCase();

  const submitComment = async () => {
    const text = draftComment.trim();
    if (!text || posting) return;
    const authorName = name.trim() || "Invité·e";
    setPosting(true);
    const { data, error } = await supabase
      .from("photo_comments")
      .insert({ photo_id: photo.id, author_name: authorName, text })
      .select()
      .single();
    setPosting(false);
    if (!error && data) {
      setComments((c) => [...c, data]);
      setDraftComment("");
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -45) next();
    else if (dx > 45) prev();
    touchStartX.current = null;
  };

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-md animate-lb-in flex-col bg-[#201f1b]">
      <div className="z-10 flex items-center justify-between px-5 pb-3 pt-12">
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-cream/15 text-cream"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <div className="text-center">
          {photo.locationName && (
            <div className="text-[10px] uppercase tracking-[2px] text-cream/60">
              {photo.locationName}
            </div>
          )}
          <div className="mt-0.5 text-[12px] text-cream/85">
            {index + 1} / {photos.length}
          </div>
        </div>
        <div className="w-10" />
      </div>

      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative flex min-h-0 flex-1 items-center justify-center px-3"
      >
        <img
          src={photoPublicUrl(photo.storage_path)}
          alt={photo.caption ?? ""}
          className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
        />
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3.5 top-1/2 flex h-[46px] w-[46px] -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-cream"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-3.5 top-1/2 flex h-[46px] w-[46px] -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-cream"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>

      <div className="max-h-[300px] overflow-y-auto rounded-t-[22px] bg-cream px-[22px] pb-6 pt-5">
        {photo.caption && (
          <p className="mb-1 font-serif text-[22px] italic leading-snug text-ink">
            {photo.caption}
          </p>
        )}
        {photo.author_name && (
          <p className="mb-4 text-[12px] text-muted">Photo de {photo.author_name}</p>
        )}

        <div className="mb-4 flex items-center gap-[7px] text-[12px] text-muted">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 20l1.4-4.2A8.38 8.38 0 0 1 3.5 12 8.5 8.5 0 0 1 12 3.5a8.5 8.5 0 0 1 9 8z" />
          </svg>
          {comments.length === 0
            ? "Soyez le premier à commenter"
            : comments.length === 1
              ? "1 commentaire"
              : `${comments.length} commentaires`}
        </div>

        <div className="mb-4 flex flex-col gap-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <div className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-sage-light font-serif text-[15px] text-sage-dark">
                {initial(c.author_name)}
              </div>
              <div className="flex-1 rounded-tl-[4px] rounded-r-2xl rounded-bl-2xl bg-card px-[13px] py-[9px]">
                <div className="mb-0.5 text-[12.5px] font-medium text-ink">{c.author_name}</div>
                <div className="text-[13.5px] leading-snug text-ink/80">{c.text}</div>
              </div>
            </div>
          ))}
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Votre prénom"
          className="mb-2 h-[42px] w-full rounded-xl border border-line bg-card px-3.5 text-[13.5px] text-ink placeholder:text-muted-3"
        />
        <div className="flex gap-2">
          <input
            value={draftComment}
            onChange={(e) => setDraftComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitComment()}
            placeholder="Ajouter un commentaire…"
            className="h-[46px] flex-1 rounded-full border border-line bg-card px-4 text-[14px] text-ink placeholder:text-muted-3"
          />
          <button
            onClick={submitComment}
            disabled={posting || !draftComment.trim()}
            className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-full bg-sage text-cream disabled:opacity-50"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
