"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import type { AdminStats } from "@/types";

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: accent ?? "var(--muted)" }}>{label}</p>
      <p className="font-serif text-3xl mb-1">{value}</p>
      {sub && <p className="text-xs" style={{ color: "var(--muted)" }}>{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats]     = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => { if (r.status === 401) { router.replace("/admin"); return null; } return r.json(); })
      .then((d) => { if (d) setStats(d); })
      .finally(() => setLoading(false));
  }, [router]);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin");
  };

  if (loading) return <AdminShell title="Dashboard"><p style={{ color: "var(--muted)" }}>Ачааллаж байна...</p></AdminShell>;
  if (!stats) return null;

  const fmt = (n: number) => `₮${n.toLocaleString()}`;

  return (
    <AdminShell title="Dashboard" onLogout={logout}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Өнөөдрийн орлого"  value={fmt(stats.todayRevenue)}  accent="var(--accent)" />
        <StatCard label="7 хоногийн орлого"  value={fmt(stats.weekRevenue)}   accent="var(--accent2)" />
        <StatCard label="Сарын орлого"        value={fmt(stats.monthRevenue)}  accent="var(--accent3)" />
        <StatCard label="Нийт орлого"         value={fmt(stats.totalRevenue)}  accent="#fbbf24" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Нийт форм"      value={stats.totalSubmissions} />
        <StatCard label="Төлбөр төлсөн"  value={stats.paidSubmissions}  accent="var(--accent)" />
        <StatCard label="Сурагчийн форм" value={stats.studentForms} />
        <StatCard label="Эцэг эхийн форм" value={stats.parentForms} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Имэйл илгээсэн" value={stats.emailSentCount}   accent="var(--accent)" />
        <StatCard label="Имэйл алдаатай" value={stats.emailFailedCount} accent="#ef4444" />
      </div>
      <div className="mt-8">
        <Link href="/admin/submissions"
          className="px-6 py-3 rounded-xl font-bold text-sm transition hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg,#6ee7b7,#38bdf8)", color: "#06080f" }}>
          Формуудыг харах →
        </Link>
      </div>
    </AdminShell>
  );
}
