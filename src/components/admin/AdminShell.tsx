"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  title: string;
  children: React.ReactNode;
  onLogout?: () => void;
}

export function AdminShell({ title, children, onLogout }: Props) {
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
          <button onClick={onLogout}
            className="text-xs px-4 py-2 rounded-xl border transition hover:border-red-500 hover:text-red-400"
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
