"use client";

import { photoPublicUrl } from "@/lib/supabase/client";
import type { Photo } from "@/lib/types";

export interface GridPhoto extends Photo {
  locationName: string;
  commentCount?: number;
}

export function PhotoGrid({
  photos,
  onOpen,
}: {
  photos: GridPhoto[];
  onOpen: (index: number) => void;
}) {
  if (photos.length === 0) {
    return (
      <div className="px-6 py-16 text-center text-[13px] text-muted">
        Aucune photo pour le moment. Soyez le premier à en ajouter une !
      </div>
    );
  }

  return (
    <div className="columns-2 gap-[10px] px-5 pb-8">
      {photos.map((photo, i) => (
        <button
          key={photo.id}
          onClick={() => onOpen(i)}
          className="relative mb-[10px] block w-full break-inside-avoid overflow-hidden rounded-xl text-left shadow-sm"
        >
          <img
            src={photoPublicUrl(photo.storage_path)}
            alt={photo.caption ?? ""}
            loading="lazy"
            className="block w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-[9px] right-[9px] flex flex-col gap-0.5">
            {photo.caption && (
              <span className="font-serif text-[15px] italic leading-tight text-cream">
                {photo.caption}
              </span>
            )}
            {photo.locationName && (
              <span className="text-[10px] uppercase tracking-wider text-cream/85">
                {photo.locationName}
              </span>
            )}
          </div>
          {!!photo.commentCount && (
            <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-cream/90 px-[7px] py-[3px] text-[10.5px] font-medium text-sage-dark">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 20l1.4-4.2A8.38 8.38 0 0 1 3.5 12 8.5 8.5 0 0 1 12 3.5a8.5 8.5 0 0 1 9 8z" />
              </svg>
              {photo.commentCount}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
