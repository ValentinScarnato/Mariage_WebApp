"use client";

import { useState } from "react";
import type { Location } from "@/lib/types";

export function AdminLocations({
  locations,
  onChange,
}: {
  locations: Location[];
  onChange: () => void;
}) {
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"table" | "lieu">("table");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Record<string, string>>({});

  const addLocation = async () => {
    if (!newName.trim() || busy) return;
    setBusy(true);
    const res = await fetch("/api/admin/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.trim(),
        type: newType,
        sort_order: locations.length + 1,
      }),
    });
    setBusy(false);
    if (res.ok) {
      setNewName("");
      onChange();
    }
  };

  const rename = async (id: string) => {
    const name = editing[id];
    if (!name || !name.trim()) return;
    const res = await fetch(`/api/admin/locations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (res.ok) {
      setEditing((e) => {
        const next = { ...e };
        delete next[id];
        return next;
      });
      onChange();
    }
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Supprimer "${name}" et toutes ses photos ?`)) return;
    const res = await fetch(`/api/admin/locations/${id}`, { method: "DELETE" });
    if (res.ok) onChange();
  };

  return (
    <div className="px-4 pb-10">
      <div className="mb-5 rounded-2xl border border-line bg-card p-4">
        <div className="mb-3 text-[13px] font-medium text-sage-dark">Ajouter un lieu ou une table</div>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Ex: Table 11, Terrasse…"
          className="mb-2 h-[44px] w-full rounded-xl border border-line bg-cream px-3 text-[13.5px] text-ink placeholder:text-muted-3"
        />
        <div className="mb-3 flex gap-2">
          <button
            onClick={() => setNewType("table")}
            className={
              "flex-1 rounded-xl border px-3 py-2 text-[12.5px] " +
              (newType === "table" ? "border-sage bg-sage text-cream" : "border-line text-ink")
            }
          >
            Table
          </button>
          <button
            onClick={() => setNewType("lieu")}
            className={
              "flex-1 rounded-xl border px-3 py-2 text-[12.5px] " +
              (newType === "lieu" ? "border-sage bg-sage text-cream" : "border-line text-ink")
            }
          >
            Autre lieu
          </button>
        </div>
        <button
          onClick={addLocation}
          disabled={!newName.trim() || busy}
          className="h-[44px] w-full rounded-xl bg-sage text-[13.5px] font-medium text-cream disabled:opacity-50"
        >
          Ajouter
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {locations.map((loc) => (
          <div key={loc.id} className="flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2.5">
            <input
              value={editing[loc.id] ?? loc.name}
              onChange={(e) => setEditing((ed) => ({ ...ed, [loc.id]: e.target.value }))}
              className="min-w-0 flex-1 bg-transparent text-[13.5px] text-ink outline-none"
            />
            <span className="flex-none text-[10.5px] uppercase tracking-wide text-muted-3">
              {loc.type === "table" ? "Table" : "Lieu"}
            </span>
            {editing[loc.id] !== undefined && editing[loc.id] !== loc.name && (
              <button
                onClick={() => rename(loc.id)}
                className="flex-none text-[12px] font-medium text-sage-dark"
              >
                OK
              </button>
            )}
            <button
              onClick={() => remove(loc.id, loc.name)}
              className="flex-none text-[12px] font-medium text-red-600"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
