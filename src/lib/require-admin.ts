import "server-only";
import { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, isValidAdminToken } from "@/lib/admin-auth";

export function isAdminRequest(req: NextRequest) {
  return isValidAdminToken(req.cookies.get(ADMIN_COOKIE_NAME)?.value);
}
