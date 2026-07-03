import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, isValidAdminToken } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminQrCodes } from "@/components/admin/admin-qrcodes";

export default async function AdminQrCodesPage() {
  const cookieStore = await cookies();
  const authed = isValidAdminToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);

  return authed ? <AdminQrCodes /> : <AdminLogin />;
}
