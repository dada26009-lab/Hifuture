import { NextRequest, NextResponse } from "next/server";
import { findById } from "@/lib/storage";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id шаардлагатай" }, { status: 400 });

  const sub = await findById(id);
  if (!sub) return NextResponse.json({ error: "Олдсонгүй" }, { status: 404 });

  if (sub.paymentStatus !== "paid") {
    return NextResponse.json({ error: "Төлбөр төлөгдөөгүй" }, { status: 403 });
  }

  if (!sub.result) {
    return NextResponse.json({ error: "Үр дүн олдсонгүй" }, { status: 404 });
  }

  return NextResponse.json({
    formType:  sub.formType,
    email:     sub.email,
    result:    sub.result,
    createdAt: sub.createdAt,
  });
}