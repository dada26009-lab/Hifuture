"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  const [stats, setStats]   = useState<AdminStats | null>(null);
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
        <StatCard label="Нийт форм"     value={stats.totalSubmissions} />
        <StatCard label="Төлбөр төлсөн" value={stats.paidSubmissions}  accent="var(--accent)" />
        <StatCard label="Сурагчийн форм" value={stats.studentForms} />
        <StatCard label="Эцэг эхийн форм" value={stats.parentForms} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Имэйл илгээсэн" value={stats.emailSentCount}   accent="var(--accent)" />
        <StatCard label="Имэйл алдаатай" value={stats.emailFailedCount} accent="#ef4444" />
      </div>

      <div className="mt-8 flex gap-3">
        <Link href="/admin/submissions"
          className="px-6 py-3 rounded-xl font-bold text-sm transition hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg,#6ee7b7,#38bdf8)", color: "#06080f" }}>
          Формуудыг харах →
        </Link>
      </div>
    </AdminShell>
  );
}

/* ── shared admin shell ── */
export function AdminShell({ title, children, onLogout }: { title: string; children: React.ReactNode; onLogout?: () => void }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <nav className="flex items-center justify-between px-6 py-4 border-b"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-6">
          <span className="font-serif text-lg">Hi <span style={{ color: "var(--accent)" }}>Future</span></span>
          <span className="text-xs font-bold tracking-widest uppercase px-2 py-1 rounded"
            style={{ background: "rgba(251,191,36,.1)", color: "#fbbf24" }}>Admin</span>
          <div className="hidden md:flex gap-4">
            <Link href="/admin/dashboard" className="text-sm hover:text-[var(--accent)] transition" style={{ color: "var(--muted)" }}>Dashboard</Link>
            <Link href="/admin/submissions" className="text-sm hover:text-[var(--accent)] transition" style={{ color: "var(--muted)" }}>Формууд</Link>
          </div>
        </div>
        {onLogout && (
          <button onClick={onLogout} className="text-xs px-4 py-2 rounded-xl border transition hover:border-red-500 hover:text-red-400"
            style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
            Гарах
          </button>
        )}
      </nav>
      <div className="max-w-5xl mx-auto px-5 py-8">
        <h1 className="font-serif text-2xl mb-6">{title}</h1>
        {children}
      </div>
    </div>
  );
}
