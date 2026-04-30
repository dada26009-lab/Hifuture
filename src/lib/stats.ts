import { readAll } from "./storage";
import type { AdminStats } from "@/types";

function startOf(unit: "day" | "week" | "month"): Date {
  const d = new Date();
  if (unit === "day") {
    d.setHours(0, 0, 0, 0);
  } else if (unit === "week") {
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
  } else {
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

export async function computeStats(): Promise<AdminStats> {
  const all  = await readAll();
  const paid = all.filter((s) => s.paymentStatus === "paid");

  const todayStart = startOf("day").getTime();
  const weekStart  = startOf("week").getTime();
  const monthStart = startOf("month").getTime();

  const rev = (from: number) =>
    paid
      .filter((s) => new Date(s.createdAt).getTime() >= from)
      .reduce((sum, s) => sum + s.paymentAmount, 0);

  return {
    totalSubmissions:  all.length,
    paidSubmissions:   paid.length,
    unpaidSubmissions: all.filter((s) => s.paymentStatus !== "paid").length,
    studentForms:      all.filter((s) => s.formType === "student").length,
    parentForms:       all.filter((s) => s.formType === "parent").length,
    todayRevenue:      rev(todayStart),
    weekRevenue:       rev(weekStart),
    monthRevenue:      rev(monthStart),
    totalRevenue:      paid.reduce((sum, s) => sum + s.paymentAmount, 0),
    emailSentCount:    all.filter((s) => s.emailStatus === "sent").length,
    emailFailedCount:  all.filter((s) => s.emailStatus === "failed").length,
  };
}