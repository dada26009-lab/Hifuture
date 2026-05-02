import { NextRequest, NextResponse } from "next/server";
import { findById, updateField } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const { submissionId } = await req.json();
    if (!submissionId) {
      return NextResponse.json({ error: "submissionId шаардлагатай" }, { status: 400 });
    }

    const sub = await findById(submissionId);
    if (!sub) {
      return NextResponse.json({ error: "Форм олдсонгүй" }, { status: 404 });
    }

    if (sub.paymentStatus === "paid") {
      return NextResponse.json({ alreadyPaid: true });
    }

    // Банкны шилжүүлэгт QPay invoice хэрэггүй — email, amount буцаана
    return NextResponse.json({
      email:  sub.email,
      amount: sub.paymentAmount,
    });
  } catch (err) {
    console.error("[payment]", err);
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}
