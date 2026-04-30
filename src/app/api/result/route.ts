import { type NextRequest, NextResponse } from "next/server";
import { findById } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id шаардлагатай" }, { status: 400 });

  const sub = await findById(id);
  if (!sub) return NextResponse.json({ error: "Олдсонгүй" }, { status: 404 });

  console.log("[result] paymentStatus:", sub.paymentStatus, "hasResult:", !!sub.result);

  // paymentStatus strict check
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