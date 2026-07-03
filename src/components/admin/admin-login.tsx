"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Mot de passe incorrect");
      return;
    }
    router.refresh();
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-8">
      <div className="mb-8 text-center">
        <div className="text-[11px] uppercase tracking-[4px] text-muted">Espace privé</div>
        <h1 className="mt-1 font-serif text-[30px] font-medium text-ink">Administration</h1>
      </div>
      <form onSubmit={submit} className="w-full max-w-xs">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe admin"
          autoFocus
          className="mb-3 h-[50px] w-full rounded-2xl border border-line bg-card px-4 text-[14px] text-ink placeholder:text-muted-3"
        />
        {error && <p className="mb-3 text-[13px] text-red-600">{error}</p>}
        <button
          disabled={loading || !password}
          className="h-[50px] w-full rounded-2xl bg-sage text-[14.5px] font-medium text-cream disabled:opacity-50"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
