"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useGuestName } from "@/lib/guest-name";
import { BottomNav } from "@/components/bottom-nav";
import { useToast } from "@/components/toast";
import type { GuestbookMessage } from "@/lib/types";

function relativeDate(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `il y a ${d} j`;
}

export function GuestbookView() {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { name, setName } = useGuestName();
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("guestbook_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!cancelled) {
          setMessages(data ?? []);
          setLoading(false);
        }
      });

    const channel = supabase
      .channel("public:guestbook_messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "guestbook_messages" },
        (payload) => {
          const incoming = payload.new as GuestbookMessage;
          setMessages((prev) => (prev.some((m) => m.id === incoming.id) ? prev : [incoming, ...prev]));
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const initial = (s: string) => (s || "?").trim().charAt(0).toUpperCase();

  const submit = async () => {
    const text = draft.trim();
    if (!text || posting) return;
    const authorName = name.trim() || "Un invité";
    setPosting(true);
    const { error } = await supabase
      .from("guestbook_messages")
      .insert({ author_name: authorName, text });
    setPosting(false);
    if (!error) {
      setDraft("");
      showToast("Merci pour votre joli mot !");
    }
  };

  return (
    <div className="animate-fade-up px-6 pb-[110px] pt-14">
      <div className="mb-6 text-center">
        <div className="text-[11px] uppercase tracking-[4px] text-muted">Vos mots doux</div>
        <h1 className="mt-1 font-serif text-[32px] font-medium text-ink">Livre d&apos;or</h1>
      </div>

      <div className="mb-7 rounded-[18px] bg-sage-light p-5">
        <div className="mb-3.5 text-center font-serif text-[21px] text-ink">
          Laissez votre mot
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Votre prénom"
          className="mb-2.5 h-[46px] w-full rounded-xl border border-line bg-card px-3.5 text-[14px] text-ink placeholder:text-muted-3"
        />
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Votre message aux mariés…"
          className="mb-3 min-h-[72px] w-full resize-none rounded-xl border border-line bg-card p-3.5 text-[14px] text-ink placeholder:text-muted-3"
        />
        <button
          onClick={submit}
          disabled={!draft.trim() || posting}
          className="h-[48px] w-full rounded-xl bg-sage text-[14.5px] font-medium text-cream disabled:opacity-50"
        >
          Signer le livre d&apos;or
        </button>
      </div>

      {!loading && (
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <div key={m.id} className="rounded-2xl border border-line bg-card px-[18px] py-4 shadow-sm">
              <div className="mb-2.5 flex items-center gap-[11px]">
                <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-sage-light font-serif text-[19px] text-sage-dark">
                  {initial(m.author_name)}
                </div>
                <div>
                  <div className="text-[14px] font-medium text-ink">{m.author_name}</div>
                  <div className="text-[11px] text-muted-3">{relativeDate(m.created_at)}</div>
                </div>
              </div>
              <p className="font-serif text-[18px] italic leading-snug text-ink/85">
                « {m.text} »
              </p>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
