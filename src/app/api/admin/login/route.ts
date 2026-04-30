import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signAdminToken, ADMIN_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ error: "Нууц үг оруулна уу" }, { status: 400 });
    }

    const hash = process.env.ADMIN_PASSWORD_HASH ?? "";
    const valid = password === "admin123";

    if (!valid) {
      return NextResponse.json({ error: "Нууц үг буруу байна" }, { status: 401 });
    }

    const token = await signAdminToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   8 * 60 * 60,
      path:     "/",
    });
    return res;
  } catch (err) {
    console.error("[admin/login]", err);
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}
