import { NextRequest, NextResponse } from "next/server";
import { findById, updateField } from "@/lib/storage";
import { createInvoice } from "@/lib/qpay";

export async function POST(req: NextRequest) {
  try {
    const { submissionId } = await req.json();
    if (!submissionId) {
      return NextResponse.json({ error: "submissionId шаардлагатай" }, { status: 400 });
    }

    const sub = await findById(submissionId);  // ← await нэмсэн
    if (!sub) {
      return NextResponse.json({ error: "Форм олдсонгүй" }, { status: 404 });
    }

    if (sub.paymentStatus === "paid") {
      return NextResponse.json({ alreadyPaid: true });
    }

    const desc = sub.formType === "student"
      ? "Hi Future — Сурагчийн форм"
      : "Hi Future — Эцэг эхийн форм";

    const invoice = await createInvoice(submissionId, sub.paymentAmount, desc);
    await updateField(submissionId, "paymentRef", invoice.invoiceId);  // ← await нэмсэн

    return NextResponse.json({ invoice });
  } catch (err) {
    console.error("[payment]", err);
    return NextResponse.json({ error: "Төлбөр үүсгэхэд алдаа гарлаа" }, { status: 500 });
  }
}