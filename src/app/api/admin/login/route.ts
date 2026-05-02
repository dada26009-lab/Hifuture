import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

// Rate limiting — memory-based (Vercel serverless-д тохирсон)
const attempts = new Map<string, { count: number; resetAt: number }>();

function getIP(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; remainingMs?: number } {
  const now = Date.now();
  const rec = attempts.get(ip);

  if (!rec || rec.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return { allowed: true };
  }

  if (rec.count >= 5) {
    return { allowed: false, remainingMs: rec.resetAt - now };
  }

  rec.count++;
  return { allowed: true };
}

function resetRateLimit(ip: string) {
  attempts.delete(ip);
}

export async function POST(req: NextRequest) {
  const ip = getIP(req);

  // Rate limit шалгах
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    const mins = Math.ceil((limit.remainingMs ?? 0) / 60000);
    return NextResponse.json(
      { error: `Хэт олон оролдлого. ${mins} минутын дараа дахин оролдоно уу.` },
      { status: 429 }
    );
  }

  const { password } = await req.json();
  const hash = process.env.ADMIN_PASSWORD_HASH;

  if (!hash) {
    return NextResponse.json({ error: "Тохиргоо алдаатай байна" }, { status: 500 });
  }

  const valid = await bcrypt.compare(password, hash);

  if (!valid) {
    return NextResponse.json({ error: "Нууц үг буруу байна" }, { status: 401 });
  }

  // Амжилттай нэвтэрвэл rate limit цэвэрлэнэ
  resetRateLimit(ip);

  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const token  = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")  // 8 цагт дуусна
    .sign(secret);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_token", token, {
    httpOnly: true,       // XSS халдлагаас хамгаална
    secure: true,         // HTTPS-д л ажиллана
    sameSite: "strict",   // CSRF халдлагаас хамгаална
    maxAge: 60 * 60 * 8, // 8 цаг
    path: "/",
  });

  return res;
}