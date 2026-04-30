import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { upsert } from "@/lib/storage";
import type { Submission, FormType } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { formType, email, answers } = body as {
      formType: FormType;
      email: string;
      answers: Submission["answers"];
    };

    if (!formType || !email || !answers?.length) {
      return NextResponse.json({ error: "Мэдээлэл дутуу байна" }, { status: 400 });
    }

    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(email)) {
      return NextResponse.json({ error: "Имэйл хаяг буруу байна" }, { status: 400 });
    }

    const prices: Record<FormType, number> = {
      student: Number(process.env.PRICE_STUDENT ?? 15000),
      parent:  Number(process.env.PRICE_PARENT  ?? 15000),
    };

    const submission: Submission = {
      id:            uuid(),
      formType,
      email,
      answers,
      paymentStatus: "pending",
      paymentRef:    null,
      paymentAmount: prices[formType],
      result:        null,
      emailStatus:   "pending",
      createdAt:     new Date().toISOString(),
      updatedAt:     new Date().toISOString(),
      adminNote:     "",
    };

    upsert(submission);

    return NextResponse.json({ submissionId: submission.id });
  } catch (err) {
    console.error("[submit]", err);
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}
