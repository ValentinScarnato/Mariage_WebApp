import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/require-admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const update: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) update.name = body.name.trim();
  if (body.type === "table" || body.type === "lieu") update.type = body.type;
  if (typeof body.sort_order === "number") update.sort_order = body.sort_order;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Rien à mettre à jour" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("locations")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ location: data });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;

  const { data: photos } = await supabaseAdmin
    .from("photos")
    .select("storage_path")
    .eq("location_id", id);

  if (photos && photos.length > 0) {
    await supabaseAdmin.storage.from("photos").remove(photos.map((p) => p.storage_path));
  }

  const { error } = await supabaseAdmin.from("locations").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
