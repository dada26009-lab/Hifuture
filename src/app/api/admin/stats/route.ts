import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { computeStats } from "@/lib/stats";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
  }
  const stats = await computeStats();
  return NextResponse.json(stats);
}