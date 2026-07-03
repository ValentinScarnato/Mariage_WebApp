import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/require-admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slugify";

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { name, type, sort_order } = await req.json();
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  }

  const baseSlug = slugify(name) || "lieu";
  let slug = baseSlug;
  let attempt = 1;
  while (true) {
    const { data: existing } = await supabaseAdmin
      .from("locations")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const { data, error } = await supabaseAdmin
    .from("locations")
    .insert({
      name: name.trim(),
      slug,
      type: type === "table" ? "table" : "lieu",
      sort_order: typeof sort_order === "number" ? sort_order : 999,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ location: data });
}
