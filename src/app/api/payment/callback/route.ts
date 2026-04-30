import { NextRequest, NextResponse } from "next/server";
import { findById, updateField } from "@/lib/storage";
import { inngest } from "@/inngest/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const submissionId: string = body.object_id ?? body.sender_invoice_no;
    if (!submissionId) return NextResponse.json({ ok: true });

    const sub = await findById(submissionId);  // ← await нэмсэн
    if (!sub || sub.paymentStatus === "paid") return NextResponse.json({ ok: true });

    await updateField(submissionId, "paymentStatus", "paid");  // ← await нэмсэн

    // Inngest-д дамжуулна
    await inngest.send({
      name: "hifuture/result.generate",
      data: { submissionId },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[callback]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}