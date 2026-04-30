import { NextRequest, NextResponse } from "next/server";
import { findById, updateField } from "@/lib/storage";
import { checkPayment } from "@/lib/qpay";
import { inngest } from "@/inngest/client";

export async function POST(req: NextRequest) {
  try {
    const { submissionId } = await req.json();
    const sub = await findById(submissionId);
    if (!sub) return NextResponse.json({ error: "Олдсонгүй" }, { status: 404 });

    // Аль хэдийн төлсөн
    if (sub.paymentStatus === "paid") {
      return NextResponse.json({ paid: true, resultReady: !!sub.result });
    }

    if (!sub.paymentRef) {
      return NextResponse.json({ paid: false, resultReady: false });
    }

    const check = await checkPayment(sub.paymentRef);
    if (!check.paid) {
      return NextResponse.json({ paid: false, resultReady: false });
    }

    // Төлбөр баталгаажлаа
    await updateField(submissionId, "paymentStatus", "paid");

    // Inngest-д дамжуулна (шууд хариулна, background-д ажиллана)
    await inngest.send({
      name: "hifuture/result.generate",
      data: { submissionId },
    });

    return NextResponse.json({ paid: true, resultReady: false });
  } catch (err) {
    console.error("[payment/check]", err);
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}
