"use client";

import { useMemo, useState } from "react";
import { useGalleryData } from "@/lib/use-gallery-data";
import { PhotoGrid } from "@/components/photo-grid";
import { Lightbox } from "@/components/lightbox";
import { BottomNav } from "@/components/bottom-nav";
import { Chip } from "@/components/chip";

export function GalleryView({ initialSlug }: { initialSlug?: string }) {
  const { locations, photos, loading } = useGalleryData();
  const [filter, setFilter] = useState<string>(initialSlug ?? "all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return photos;
    const loc = locations.find((l) => l.slug === filter);
    if (!loc) return photos;
    return photos.filter((p) => p.location_id === loc.id);
  }, [photos, locations, filter]);

  const filterLabel =
    filter === "all"
      ? "Toutes les tables et lieux"
      : locations.find((l) => l.slug === filter)?.name ?? "";

  return (
    <div className="animate-fade-up pb-[100px]">
      <div className="px-6 pb-1.5 pt-14 text-center">
        <h1 className="font-serif text-[32px] font-medium text-ink">Galerie</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto px-6 py-4">
        <Chip label="Toutes" active={filter === "all"} onClick={() => setFilter("all")} />
        {locations.map((loc) => (
          <Chip
            key={loc.id}
            label={loc.name}
            active={filter === loc.slug}
            onClick={() => setFilter(loc.slug)}
          />
        ))}
      </div>
      <div className="mb-3 -mt-1 text-center text-[12.5px] text-muted">{filterLabel}</div>

      {!loading && <PhotoGrid photos={filtered} onOpen={setOpenIndex} />}

      {openIndex !== null && (
        <Lightbox
          photos={filtered}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onIndexChange={setOpenIndex}
        />
      )}

      <BottomNav />
    </div>
  );
}
