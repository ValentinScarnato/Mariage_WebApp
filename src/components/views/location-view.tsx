"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useGalleryData } from "@/lib/use-gallery-data";
import { PhotoGrid } from "@/components/photo-grid";
import { Lightbox } from "@/components/lightbox";
import { BottomNav } from "@/components/bottom-nav";
import { Chip } from "@/components/chip";

export function LocationView({ slug }: { slug: string }) {
  const { locations, photos, loading } = useGalleryData();
  const [scope, setScope] = useState<"here" | "all">("here");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const location = locations.find((l) => l.slug === slug);

  const filtered = useMemo(() => {
    if (scope === "all") return photos;
    if (!location) return [];
    return photos.filter((p) => p.location_id === location.id);
  }, [photos, location, scope]);

  if (!loading && locations.length > 0 && !location) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="font-serif text-2xl text-ink">Ce lieu n&apos;existe plus.</p>
        <Link href="/" className="text-sage-dark underline">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-up pb-[100px]">
      <div className="px-6 pb-2 pt-14 text-center">
        <div className="text-[11px] uppercase tracking-[4px] text-muted">Vous êtes à</div>
        <h1 className="mt-1 font-serif text-[32px] font-medium text-ink">
          {location?.name ?? "…"}
        </h1>
      </div>

      <div className="px-6 pb-5 pt-3">
        <Link
          href={`/ajouter?lieu=${slug}`}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-sage text-[14.5px] font-medium text-cream"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Ajouter une photo ici
        </Link>
      </div>

      <div className="flex gap-2 px-6 pb-4">
        <Chip label={location?.name ?? "Ce lieu"} active={scope === "here"} onClick={() => setScope("here")} />
        <Chip label="Toutes les tables" active={scope === "all"} onClick={() => setScope("all")} />
      </div>

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
