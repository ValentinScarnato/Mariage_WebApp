"use client";

import { useState } from "react";
import Link from "next/link";
import { useGalleryData } from "@/lib/use-gallery-data";
import { PhotoGrid } from "@/components/photo-grid";
import { Lightbox } from "@/components/lightbox";
import { BottomNav } from "@/components/bottom-nav";
import { siteConfig } from "@/lib/site-config";

export function HomeView() {
  const { locations, photos, loading } = useGalleryData();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const recent = photos.slice(0, 12);

  return (
    <div className="animate-fade-up pb-[100px]">
      <div className="relative h-[320px] overflow-hidden bg-gradient-to-br from-[#aab48f] via-[#8c9a7b] to-[#74815f]">
        <div
          className="absolute inset-0 opacity-[.16]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 20%, #fff 0, transparent 40%), radial-gradient(circle at 80% 70%, #fff 0, transparent 35%)",
          }}
        />
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
          href="/ajouter"
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
        <h2 className="font-serif text-[22px] font-medium text-ink">Tables &amp; lieux</h2>
        <span className="text-[12px] tracking-wide text-muted">sans QR code</span>
      </div>
      <div className="flex gap-2 overflow-x-auto px-6 pb-5">
        {locations.map((loc) => (
          <Link
            key={loc.id}
            href={`/lieu/${loc.slug}`}
            className="flex-none rounded-2xl border border-line bg-card px-4 py-3 text-center"
          >
            <div className="text-[13px] font-medium text-ink">{loc.name}</div>
          </Link>
        ))}
      </div>

      <div className="flex items-baseline justify-between px-6 pb-3">
        <h2 className="font-serif text-[26px] font-medium text-ink">Les souvenirs</h2>
        <span className="text-[12px] tracking-wide text-muted">{photos.length} photos</span>
      </div>

      {!loading && <PhotoGrid photos={recent} onOpen={setOpenIndex} />}

      {openIndex !== null && (
        <Lightbox
          photos={recent}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onIndexChange={setOpenIndex}
        />
      )}

      <BottomNav />
    </div>
  );
}
