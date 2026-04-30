import { NextRequest, NextResponse } from "next/server";
import { findById, updateField } from "@/lib/storage";
import { generateResult } from "@/lib/claude";
import { sendResultEmail } from "@/lib/email";

// QPay webhook callback
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // QPay sends: { payment_id, invoice_id, object_id (= submissionId), ... }
    const submissionId: string = body.object_id ?? body.sender_invoice_no;
    if (!submissionId) return NextResponse.json({ ok: true });

    const sub = await findById(submissionId);
    if (!sub || sub.paymentStatus === "paid") return NextResponse.json({ ok: true });

    await updateField(submissionId, "paymentStatus", "paid");

    const result = await generateResult(sub.formType, sub.answers);
    updateField(submissionId, "result", result);

    try {
      await sendResultEmail(sub.email, sub.formType, result);
      updateField(submissionId, "emailStatus", "sent");
    } catch {
      updateField(submissionId, "emailStatus", "failed");
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[callback]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
