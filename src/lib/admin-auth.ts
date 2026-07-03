import "server-only";
import crypto from "crypto";

export const ADMIN_COOKIE_NAME = "admin_session";

function secret() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD is not set");
  return password;
}

export function computeAdminToken() {
  return crypto.createHmac("sha256", secret()).update("mariage-admin-session").digest("hex");
}

export function checkAdminPassword(password: string) {
  return password === secret();
}

export function isValidAdminToken(token: string | undefined) {
  if (!token) return false;
  const expected = computeAdminToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
