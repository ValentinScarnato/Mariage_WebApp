import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/require-admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;

  const { data: photo } = await supabaseAdmin
    .from("photos")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (photo?.storage_path) {
    await supabaseAdmin.storage.from("photos").remove([photo.storage_path]);
  }

  const { error } = await supabaseAdmin.from("photos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
