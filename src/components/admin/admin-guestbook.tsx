"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { GuestbookMessage } from "@/lib/types";

export function AdminGuestbook() {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("guestbook_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setMessages(data ?? []);
        setLoading(false);
      });
  }, []);

  const remove = async (id: string) => {
    const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    if (res.ok) setMessages((m) => m.filter((x) => x.id !== id));
  };

  if (loading) return <p className="px-6 py-8 text-center text-muted">Chargement…</p>;

  return (
    <div className="flex flex-col gap-2 px-4 pb-10">
      {messages.length === 0 && (
        <p className="px-2 py-8 text-center text-[13px] text-muted">Aucun message pour le moment.</p>
      )}
      {messages.map((m) => (
        <div key={m.id} className="flex items-start justify-between gap-3 rounded-xl border border-line bg-card px-3.5 py-3">
          <div>
            <div className="text-[13px] font-medium text-ink">{m.author_name}</div>
            <div className="mt-0.5 text-[13px] italic text-ink/75">« {m.text} »</div>
          </div>
          <button onClick={() => remove(m.id)} className="flex-none text-[12px] font-medium text-red-600">
            Supprimer
          </button>
        </div>
      ))}
    </div>
  );
}
