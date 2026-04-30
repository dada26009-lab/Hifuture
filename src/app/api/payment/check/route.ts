import { NextRequest, NextResponse } from "next/server";
import { findById, updateField } from "@/lib/storage";
import { checkPayment } from "@/lib/qpay";
import { generateResult } from "@/lib/claude";
import { sendResultEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { submissionId } = await req.json();
    const sub = await findById(submissionId);
    if (!sub) return NextResponse.json({ error: "Олдсонгүй" }, { status: 404 });

    // Аль хэдийн төлсөн бол result бэлэн эсэхийг шалга
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

    // answers-г зөв array болгох
    const answers = Array.isArray(sub.answers) ? sub.answers : [];

    // Result үүсгэнэ
    let result = sub.result;
    if (!result) {
      try {
        result = await generateResult(sub.formType, answers);
        await updateField(submissionId, "result", result);
      } catch (e) {
        console.error("[claude error]", e);
        return NextResponse.json({ paid: true, resultReady: false });
      }
    }

    // Имэйл илгээнэ
    if (result) {
      sendResultEmail(sub.email, sub.formType, result)
        .then(() => updateField(submissionId, "emailStatus", "sent"))
        .catch((e) => {
          console.error("[email error]", e);
          updateField(submissionId, "emailStatus", "failed");
        });
    }

    return NextResponse.json({ paid: true, resultReady: !!result });
  } catch (err) {
    console.error("[payment/check]", err);
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}