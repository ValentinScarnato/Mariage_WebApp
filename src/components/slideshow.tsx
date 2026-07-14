"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const next = useCallback(() => {
    setIndex((i) => (i + 1 < photos.length ? i + 1 : i));
  }, [photos.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  useEffect(() => {
    if (index === photos.length - 1) {
      if (!playing) return;
      const t = setTimeout(onClose, SLIDE_DURATION);
      return () => clearTimeout(t);
    }
    if (!playing || photos.length < 2) return;
    const t = setTimeout(next, SLIDE_DURATION);
    return () => clearTimeout(t);
  }, [index, playing, photos.length, next, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, next, prev]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 45) {
      if (dx < 0) next();
      else prev();
    }
  };

  if (photos.length === 0) return null;
  const photo = photos[index];

  return createPortal(
    <div className="fixed inset-0 z-50 mx-auto flex h-[100dvh] max-w-md animate-lb-in flex-col overflow-hidden bg-black">
      {photos.map((p, i) =>
        i === index ? (
          <div key={p.id} className="absolute inset-0 animate-slide-fade overflow-hidden bg-black">
            <img
              src={photoPublicUrl(p.storage_path)}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl"
            />
            <img
              src={photoPublicUrl(p.storage_path)}
              alt={p.caption ?? ""}
              className="relative h-full w-full animate-ken-burns object-contain"
            />
          </div>
        ) : null
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/45" />

      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="absolute inset-0 z-10 flex"
      >
        <button
          aria-label="Photo précédente"
          onClick={prev}
          className="h-full w-1/3"
        />
        <button
          aria-label="Photo suivante"
          onClick={next}
          className="h-full w-2/3"
        />
      </div>

      <div className="relative z-20 flex items-center justify-between px-5 pb-3 pt-12">
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

      <div className="pointer-events-none relative z-20 mt-auto px-6 pb-10 text-cream">
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
    </div>,
    document.body
  );
}
