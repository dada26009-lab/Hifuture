import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { readAll, updateField, findById } from "@/lib/storage";
import { inngest } from "@/inngest/client";
import { sendResultEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
  }

  const sp     = req.nextUrl.searchParams;
  let list     = await readAll();
  const type   = sp.get("type");
  const status = sp.get("status");
  const email  = sp.get("email");
  const page   = Math.max(1, Number(sp.get("page") ?? 1));
  const limit  = 20;

  if (type)   list = list.filter((s) => s.formType === type);
  if (status) list = list.filter((s) => s.paymentStatus === status);
  if (email)  list = list.filter((s) => s.email.includes(email));

  const total = list.length;
  const items = list.slice((page - 1) * limit, page * limit);
  return NextResponse.json({ items, total, page, limit });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, action, value } = body;

  const authRequired = action !== "markPaid";
  if (authRequired && !(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
  }

  const sub = await findById(id);
  if (!sub) return NextResponse.json({ error: "Олдсонгүй" }, { status: 404 });

  if (action === "note") {
    await updateField(id, "adminNote", value as string);
    return NextResponse.json({ ok: true });
  }

  if (action === "markPaid") {
    await updateField(id, "paymentStatus", "paid");

    // Inngest-д дамжуулна
    await inngest.send({
      name: "hifuture/result.generate",
      data: { submissionId: id },
    });

    return NextResponse.json({ ok: true });
  }

  if (action === "resendEmail") {
    const fresh = await findById(id);
    if (!fresh?.result) {
      return NextResponse.json({ error: "Үр дүн байхгүй" }, { status: 400 });
    }
    try {
      await sendResultEmail(fresh.email, fresh.formType, fresh.result);
      await updateField(id, "emailStatus", "sent");
      return NextResponse.json({ ok: true });
    } catch (e) {
      await updateField(id, "emailStatus", "failed");
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Үйлдэл тодорхойгүй" }, { status: 400 });
}
