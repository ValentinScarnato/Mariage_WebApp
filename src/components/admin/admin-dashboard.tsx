"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Location } from "@/lib/types";
import { AdminPhotos } from "@/components/admin/admin-photos";
import { AdminLocations } from "@/components/admin/admin-locations";
import { AdminGuestbook } from "@/components/admin/admin-guestbook";

const tabs = [
  { id: "photos", label: "Photos" },
  { id: "lieux", label: "Lieux" },
  { id: "livre-or", label: "Livre d'or" },
] as const;

type Tab = (typeof tabs)[number]["id"];

export function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("photos");
  const [locations, setLocations] = useState<Location[]>([]);

  const loadLocations = async () => {
    const { data } = await supabase.from("locations").select("*").order("sort_order");
    setLocations(data ?? []);
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  };

  return (
    <div className="min-h-dvh pb-10">
      <div className="flex items-center justify-between px-5 pb-3 pt-10">
        <h1 className="font-serif text-[26px] font-medium text-ink">Administration</h1>
        <button onClick={logout} className="text-[12.5px] text-muted underline">
          Déconnexion
        </button>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 px-5 pb-4">
        <Link href="/" className="text-[13px] font-medium text-sage-dark underline">
          ← Retour à l&apos;accueil
        </Link>
        <Link href="/admin/qrcodes" className="text-[13px] font-medium text-sage-dark underline">
          Générer les QR codes →
        </Link>
      </div>

      <div className="mb-4 flex gap-2 border-b border-line px-4 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={
              "rounded-full px-3.5 py-1.5 text-[13px] font-medium " +
              (tab === t.id ? "bg-sage text-cream" : "text-muted")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "photos" && <AdminPhotos locations={locations} />}
      {tab === "lieux" && <AdminLocations locations={locations} onChange={loadLocations} />}
      {tab === "livre-or" && <AdminGuestbook />}
    </div>
  );
}
