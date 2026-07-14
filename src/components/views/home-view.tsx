"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGalleryData } from "@/lib/use-gallery-data";
import { PhotoGrid } from "@/components/photo-grid";
import { Lightbox } from "@/components/lightbox";
import { Slideshow } from "@/components/slideshow";
import { BottomNav } from "@/components/bottom-nav";
import { Chip } from "@/components/chip";
import { siteConfig } from "@/lib/site-config";
import { downloadAllPhotos } from "@/lib/download";

export function HomeView() {
  const { locations, photos, loading } = useGalleryData();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [filterSlug, setFilterSlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!filterSlug) return photos;
    const loc = locations.find((l) => l.slug === filterSlug);
    if (!loc) return photos;
    return photos.filter((p) => p.location_id === loc.id);
  }, [photos, locations, filterSlug]);

  const toggleFilter = (slug: string) => {
    setFilterSlug((current) => (current === slug ? null : slug));
  };

  const handleDownloadAll = async () => {
    if (downloadingAll || filtered.length === 0) return;
    setDownloadingAll(true);
    setProgress({ done: 0, total: filtered.length });
    try {
      await downloadAllPhotos(filtered, (done, total) => setProgress({ done, total }));
    } finally {
      setDownloadingAll(false);
    }
  };

  return (
    <div className="animate-fade-up pb-[100px]">
      <div className="relative h-[360px] overflow-hidden bg-[#3f4b38]">
        <Image
          src="/chateau-tresserve.jpg"
          alt={siteConfig.venue}
          fill
          priority
          sizes="(max-width: 480px) 100vw, 480px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/55" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 pb-6 pt-14 text-center text-cream">
          <div className="mb-5 flex h-[58px] w-[58px] items-center justify-center rounded-full border border-cream/55 font-serif text-[22px] tracking-wide">
            {siteConfig.partner1.charAt(0)}
            <span className="mx-0.5 text-[14px] opacity-70">&amp;</span>
            {siteConfig.partner2.charAt(0)}
          </div>
          <div className="text-[11px] uppercase tracking-[4px] opacity-85">Se sont dit oui</div>
          <div className="mt-3 font-serif text-[40px] font-medium leading-[1.05]">
            {siteConfig.partner1}
            <br />
            <span className="text-[24px] italic opacity-90">&amp;</span>
            <br />
            {siteConfig.partner2}
          </div>
          <div className="mt-3 text-[12px] tracking-[3px] opacity-90">
            {siteConfig.dateLabel} — {siteConfig.venue.toUpperCase()}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[50px] bg-gradient-to-t from-cream to-transparent" />
      </div>

      <div className="px-6 pb-4 pt-1 text-center">
        <p className="mb-1.5 font-serif text-[20px] italic leading-snug text-sage-dark">
          {siteConfig.tagline}
        </p>
        <p className="text-[13px] leading-relaxed text-muted-2">{siteConfig.subtitle}</p>
      </div>

      <div className="flex gap-2.5 px-6 pb-5">
        <Link
          href="/ajouter?lieu=aucun"
          className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl bg-sage text-[14.5px] font-medium text-cream"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Ajouter des photos
        </Link>
        <Link
          href="/livre-or"
          className="flex h-[52px] w-[56px] items-center justify-center rounded-2xl border border-line bg-card text-sage-dark"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 20l1.4-4.2A8.38 8.38 0 0 1 3.5 12 8.5 8.5 0 0 1 12 3.5a8.5 8.5 0 0 1 9 8z" />
          </svg>
        </Link>
      </div>

      <div className="flex items-baseline justify-between px-6 pb-3">
        <h2 className="font-serif text-[26px] font-medium text-ink">Les souvenirs</h2>
        <span className="text-[12px] tracking-wide text-muted">{filtered.length} photos</span>
      </div>

      {locations.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-6 pb-4">
          {locations.map((loc) => (
            <Chip
              key={loc.id}
              label={loc.name}
              active={filterSlug === loc.slug}
              onClick={() => toggleFilter(loc.slug)}
            />
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex gap-2.5 px-6 pb-4">
          <button
            onClick={handleDownloadAll}
            disabled={downloadingAll}
            className="flex h-[46px] flex-1 items-center justify-center gap-2 rounded-2xl border border-line bg-card text-[13px] font-medium text-sage-dark disabled:opacity-60"
          >
            {downloadingAll ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M12 3a9 9 0 1 0 9 9" />
                </svg>
                {progress.total > 0 ? `${progress.done} / ${progress.total}` : "Préparation…"}
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16" />
                </svg>
                Tout télécharger
              </>
            )}
          </button>
          <button
            onClick={() => setSlideshowOpen(true)}
            className="flex h-[46px] flex-1 items-center justify-center gap-2 rounded-2xl border border-line bg-card text-[13px] font-medium text-sage-dark"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 4v16l14-8z" />
            </svg>
            Diaporama
          </button>
        </div>
      )}

      {!loading && <PhotoGrid photos={filtered} onOpen={setOpenIndex} />}

      {openIndex !== null && (
        <Lightbox
          photos={filtered}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onIndexChange={setOpenIndex}
        />
      )}

      {slideshowOpen && (
        <Slideshow photos={filtered} onClose={() => setSlideshowOpen(false)} />
      )}

      <BottomNav />
    </div>
  );
}
