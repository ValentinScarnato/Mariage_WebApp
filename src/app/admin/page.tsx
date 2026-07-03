import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, isValidAdminToken } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authed = isValidAdminToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);

  return authed ? <AdminDashboard /> : <AdminLogin />;
}
