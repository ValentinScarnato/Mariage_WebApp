"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabase/client";
import type { Location } from "@/lib/types";

const PER_PAGE = 9;

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

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

  const allReady = locations.length > 0 && locations.every((loc) => codes[loc.id]);
  const pages = chunk(locations, PER_PAGE);

  return (
    <div className="min-h-dvh px-5 pb-10 pt-10 print:p-0">
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          html, body { background: #fff !important; }
        }
        .print-page {
          break-after: page;
          page-break-after: always;
        }
        .print-page:last-child {
          break-after: auto;
          page-break-after: auto;
        }
      `}</style>

      <div className="print:hidden">
        <Link href="/admin" className="text-[12.5px] text-muted underline">
          ← Retour
        </Link>
        <h1 className="mb-1 mt-3 font-serif text-[26px] font-medium text-ink">QR codes</h1>
        <p className="mb-5 text-[13px] text-muted">
          Un QR code par table/lieu, à imprimer et poser sur place. Chacun ouvre directement la
          galerie de son lieu.
        </p>

        <div className="mb-6 flex gap-2">
          <button
            onClick={downloadAll}
            className="h-[44px] flex-1 rounded-xl border border-line bg-card text-[13.5px] font-medium text-sage-dark"
          >
            Télécharger
          </button>
          <button
            onClick={() => window.print()}
            disabled={!allReady}
            className="h-[44px] flex-1 rounded-xl bg-sage text-[13.5px] font-medium text-cream disabled:opacity-50"
          >
            Imprimer (9 / page A4)
          </button>
        </div>

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

      {/* Mise en page impression : 3x3 QR codes par feuille A4, invisible à l'écran */}
      <div className="hidden print:block">
        {pages.map((page, pageIndex) => (
          <div key={pageIndex} className="print-page grid grid-cols-3 grid-rows-3 gap-[6mm]">
            {page.map((loc) => (
              <div
                key={loc.id}
                className="flex flex-col items-center justify-center border border-[#ccc] p-[4mm] text-center"
              >
                {codes[loc.id] && (
                  <img src={codes[loc.id]} alt={loc.name} className="mb-[3mm] w-full max-w-[55mm]" />
                )}
                <div className="text-[14px] font-medium text-black">{loc.name}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
