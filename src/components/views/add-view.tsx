"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useGuestName } from "@/lib/guest-name";
import { useGalleryData } from "@/lib/use-gallery-data";
import { compressPhoto, randomPhotoFilename } from "@/lib/image";
import { Chip } from "@/components/chip";
import { BottomNav } from "@/components/bottom-nav";
import { useToast } from "@/components/toast";

export function AddView({ initialSlug }: { initialSlug?: string }) {
  const router = useRouter();
  const { locations } = useGalleryData();
  const { name, setName } = useGuestName();
  const { showToast } = useToast();

  const [locationSlug, setLocationSlug] = useState(initialSlug ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveSlug = locationSlug || locations[0]?.slug || "";

  const onPickFile = (f: File | null) => {
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  };

  const submit = async () => {
    if (!file || !effectiveSlug || submitting) return;
    const location = locations.find((l) => l.slug === effectiveSlug);
    if (!location) return;

    setSubmitting(true);
    try {
      const compressed = await compressPhoto(file);
      const filename = randomPhotoFilename(file.name || "photo.jpg");
      const path = `${location.slug}/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(path, compressed, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;

      const authorName = name.trim() || null;
      const { error: insertError } = await supabase.from("photos").insert({
        location_id: location.id,
        storage_path: path,
        caption: caption.trim() || null,
        author_name: authorName,
      });
      if (insertError) throw insertError;

      showToast("Photo ajoutée à la galerie !");
      router.push(`/lieu/${location.slug}`);
    } catch {
      showToast("Une erreur est survenue, réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-up px-6 pb-[110px] pt-14">
      <div className="mb-6 text-center">
        <div className="text-[11px] uppercase tracking-[4px] text-muted">Partagez</div>
        <h1 className="mt-1 font-serif text-[32px] font-medium text-ink">Ajouter une photo</h1>
      </div>

      <label className="mb-2.5 block text-[12.5px] font-medium tracking-wide text-sage-dark">
        1 · VOTRE PRÉNOM
      </label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Votre prénom"
        className="mb-6 h-[50px] w-full rounded-2xl border border-line bg-card px-4 text-[14px] text-ink placeholder:text-muted-3"
      />

      <label className="mb-2.5 block text-[12.5px] font-medium tracking-wide text-sage-dark">
        2 · VOTRE TABLE / LIEU
      </label>
      <div className="mb-6 flex flex-wrap gap-2">
        {locations.map((loc) => (
          <Chip
            key={loc.id}
            label={loc.name}
            active={effectiveSlug === loc.slug}
            onClick={() => setLocationSlug(loc.slug)}
          />
        ))}
      </div>

      <label className="mb-2.5 block text-[12.5px] font-medium tracking-wide text-sage-dark">
        3 · VOTRE PHOTO
      </label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="mb-6 block w-full overflow-hidden rounded-[18px] border-[1.5px] border-dashed border-[#b6bca6] bg-card"
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Aperçu" className="max-h-72 w-full object-cover" />
        ) : (
          <div className="px-5 py-9 text-center">
            <div className="mx-auto mb-3.5 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-sage-light">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8c9a7b" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <div className="font-serif text-[21px] text-ink">Prendre ou choisir une photo</div>
            <div className="mt-1 text-[12.5px] text-muted">Appuyez ici pour ouvrir votre appareil</div>
          </div>
        )}
      </button>

      <label className="mb-2.5 block text-[12.5px] font-medium tracking-wide text-sage-dark">
        4 · UN PETIT MOT <span className="font-normal normal-case tracking-normal text-muted-3">(facultatif)</span>
      </label>
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Un souvenir, une anecdote…"
        className="mb-6 min-h-[74px] w-full resize-none rounded-2xl border border-line bg-card p-3.5 text-[14px] text-ink placeholder:text-muted-3"
      />

      <button
        onClick={submit}
        disabled={!file || submitting}
        className="h-[54px] w-full rounded-2xl bg-sage text-[15px] font-medium tracking-wide text-cream disabled:opacity-50"
      >
        {submitting ? "Envoi en cours…" : "Partager avec les mariés"}
      </button>
      <p className="mt-3.5 text-center text-[11.5px] leading-relaxed text-muted-3">
        Votre photo apparaîtra immédiatement dans la galerie.
      </p>

      <BottomNav />
    </div>
  );
}
