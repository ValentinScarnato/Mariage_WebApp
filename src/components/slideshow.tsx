"use client";

import { useEffect, useState } from "react";
import { photoPublicUrl } from "@/lib/supabase/client";
import type { GridPhoto } from "@/components/photo-grid";

const SLIDE_DURATION = 5000;

export function Slideshow({
  photos,
  onClose,
}: {
  photos: GridPhoto[];
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing || photos.length < 2) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % photos.length), SLIDE_DURATION);
    return () => clearTimeout(t);
  }, [index, playing, photos.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") setIndex((i) => (i + 1) % photos.length);
      else if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + photos.length) % photos.length);
      else if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, photos.length]);

  if (photos.length === 0) return null;
  const photo = photos[index];

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-md animate-lb-in flex-col overflow-hidden bg-black">
      {photos.map((p, i) =>
        i === index ? (
          <div key={p.id} className="absolute inset-0 animate-slide-fade overflow-hidden">
            <img
              src={photoPublicUrl(p.storage_path)}
              alt={p.caption ?? ""}
              className="h-full w-full animate-ken-burns object-cover"
            />
          </div>
        ) : null
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/45" />

      <div className="relative z-10 flex items-center justify-between px-5 pb-3 pt-12">
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-cream/15 text-cream"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <div className="text-[12px] text-cream/85">
          {index + 1} / {photos.length}
        </div>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-cream/15 text-cream"
        >
          {playing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 4v16l14-8z" />
            </svg>
          )}
        </button>
      </div>

      <div className="relative z-10 mt-auto px-6 pb-10 text-cream">
        {(photo.caption || photo.locationName) && (
          <div className="mb-4">
            {photo.caption && (
              <p className="font-serif text-[22px] italic leading-snug">{photo.caption}</p>
            )}
            {photo.locationName && (
              <p className="mt-0.5 text-[11px] uppercase tracking-[2px] text-cream/75">
                {photo.locationName}
              </p>
            )}
          </div>
        )}
        <div className="flex gap-1">
          {photos.map((p, i) => (
            <div
              key={p.id}
              className={
                "h-[3px] flex-1 overflow-hidden rounded-full bg-cream/25"
              }
            >
              {i === index && (
                <div
                  key={`${p.id}-${playing}`}
                  className="h-full bg-cream"
                  style={{
                    animation: playing ? `slideProgress ${SLIDE_DURATION}ms linear forwards` : "none",
                    width: playing ? undefined : "100%",
                  }}
                />
              )}
              {i < index && <div className="h-full w-full bg-cream" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
