"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabase/client";
import type { Location } from "@/lib/types";

export function AdminQrCodes() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [siteUrl, setSiteUrl] = useState("");
  const [codes, setCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    setSiteUrl(window.location.origin);
    supabase
      .from("locations")
      .select("*")
      .order("sort_order")
      .then(({ data }) => setLocations(data ?? []));
  }, []);

  useEffect(() => {
    if (!siteUrl) return;
    (async () => {
      const entries = await Promise.all(
        locations.map(async (loc) => {
          const url = `${siteUrl}/lieu/${loc.slug}`;
          const dataUrl = await QRCode.toDataURL(url, {
            width: 480,
            margin: 2,
            color: { dark: "#3b3a33", light: "#f5f1e8" },
          });
          return [loc.id, dataUrl] as const;
        })
      );
      setCodes(Object.fromEntries(entries));
    })();
  }, [locations, siteUrl]);

  const downloadAll = () => {
    for (const loc of locations) {
      const dataUrl = codes[loc.id];
      if (!dataUrl) continue;
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `qr-${loc.slug}.png`;
      a.click();
    }
  };

  return (
    <div className="min-h-dvh px-5 pb-10 pt-10">
      <Link href="/admin" className="text-[12.5px] text-muted underline">
        ← Retour
      </Link>
      <h1 className="mb-1 mt-3 font-serif text-[26px] font-medium text-ink">QR codes</h1>
      <p className="mb-5 text-[13px] text-muted">
        Un QR code par table/lieu, à imprimer et poser sur place. Chacun ouvre directement la
        galerie de son lieu.
      </p>
      <button
        onClick={downloadAll}
        className="mb-6 h-[44px] w-full rounded-xl bg-sage text-[13.5px] font-medium text-cream"
      >
        Télécharger tous les QR codes
      </button>

      <div className="grid grid-cols-2 gap-4">
        {locations.map((loc) => (
          <div key={loc.id} className="rounded-2xl border border-line bg-card p-3 text-center">
            {codes[loc.id] ? (
              <img src={codes[loc.id]} alt={loc.name} className="mx-auto mb-2 w-full rounded-lg" />
            ) : (
              <div className="mb-2 aspect-square w-full animate-pulse rounded-lg bg-sage-light" />
            )}
            <div className="text-[12.5px] font-medium text-ink">{loc.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
