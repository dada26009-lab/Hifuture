import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export const ADMIN_COOKIE = "admin_token";  // ← энэ мөрийг нэмнэ

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return false;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    return payload.role === "admin";
  } catch {
    return false;
  }
}