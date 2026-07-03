"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Location, Photo } from "@/lib/types";
import type { GridPhoto } from "@/components/photo-grid";

export function useGalleryData() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [{ data: locs }, { data: pics }, { data: comments }] = await Promise.all([
        supabase.from("locations").select("*").order("sort_order", { ascending: true }),
        supabase.from("photos").select("*").order("created_at", { ascending: false }),
        supabase.from("photo_comments").select("photo_id"),
      ]);
      if (cancelled) return;
      setLocations(locs ?? []);
      setPhotos(pics ?? []);
      const counts: Record<string, number> = {};
      for (const c of comments ?? []) {
        counts[c.photo_id] = (counts[c.photo_id] ?? 0) + 1;
      }
      setCommentCounts(counts);
      setLoading(false);
    }

    load();

    const channel = supabase
      .channel("public:photos")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "photos" }, (payload) => {
        setPhotos((prev) => [payload.new as Photo, ...prev]);
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const locationById = Object.fromEntries(locations.map((l) => [l.id, l]));

  const gridPhotos: GridPhoto[] = photos.map((p) => ({
    ...p,
    locationName: locationById[p.location_id]?.name ?? "",
    commentCount: commentCounts[p.id] ?? 0,
  }));

  return { locations, photos: gridPhotos, loading };
}
