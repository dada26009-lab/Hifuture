"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import type { Submission } from "@/types";

const STATUS_LABEL: Record<string, string> = { paid: "Төлсөн", pending: "Хүлээгдэж байна", failed: "Амжилтгүй" };
const STATUS_COLOR: Record<string, string> = { paid: "var(--accent)", pending: "#fbbf24", failed: "#ef4444" };

export default function SubmissionsPage() {
  const router = useRouter();
  const [items, setItems]   = useState<Submission[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: "", status: "", email: "" });
  const [selected, setSelected] = useState<Submission | null>(null);
  const [note, setNote]     = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg]       = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page), ...Object.fromEntries(Object.entries(filter).filter(([, v]) => v)) });
    const res = await fetch(`/api/admin/submissions?${p}`);
    if (res.status === 401) { router.replace("/admin"); return; }
    const data = await res.json();
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, filter, router]);

  useEffect(() => { load(); }, [load]);

  const doAction = async (id: string, action: string, value?: string) => {
    setActionLoading(true); setMsg("");
    const res = await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, value }),
    });
    const data = await res.json();
    setActionLoading(false);
    if (res.ok) { setMsg("✓ Амжилттай"); load(); }
    else setMsg(`❌ ${data.error}`);
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin");
  };

  const inputCls = "px-3 py-2 rounded-xl text-xs outline-none border";
  const inputStyle = { background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" };

  return (
    <AdminShell title={`Формууд (${total})`} onLogout={logout}>
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={filter.type} onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value }))}
          className={inputCls} style={inputStyle}>
          <option value="">Бүх төрөл</option>
          <option value="student">Сурагч</option>
          <option value="parent">Эцэг эх</option>
        </select>
        <select value={filter.status} onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
          className={inputCls} style={inputStyle}>
          <option value="">Бүх статус</option>
          <option value="paid">Төлсөн</option>
          <option value="pending">Хүлээгдэж байна</option>
        </select>
        <input placeholder="Имэйл хайх..." value={filter.email}
          onChange={(e) => setFilter((f) => ({ ...f, email: e.target.value }))}
          className={inputCls} style={{ ...inputStyle, minWidth: 180 }} />
        <button onClick={() => { setPage(1); load(); }}
          className="px-4 py-2 rounded-xl text-xs font-bold transition"
          style={{ background: "var(--accent)", color: "#06080f" }}>
          Хайх
        </button>
      </div>

      {loading ? <p style={{ color: "var(--muted)" }}>Ачааллаж байна...</p> : (
        <>
          <div className="rounded-2xl border overflow-hidden mb-6" style={{ borderColor: "var(--border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs font-bold tracking-wide uppercase"
                  style={{ background: "var(--surface2)", borderColor: "var(--border)", color: "var(--muted)" }}>
                  <th className="px-4 py-3 text-left">Огноо</th>
                  <th className="px-4 py-3 text-left">Имэйл</th>
                  <th className="px-4 py-3 text-left">Төрөл</th>
                  <th className="px-4 py-3 text-left">Статус</th>
                  <th className="px-4 py-3 text-left">Имэйл</th>
                  <th className="px-4 py-3 text-left">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.id} className="border-b transition hover:bg-white/[.02] cursor-pointer"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                    onClick={() => { setSelected(s); setNote(s.adminNote); setMsg(""); }}>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>
                      {new Date(s.createdAt).toLocaleDateString("mn-MN")}
                    </td>
                    <td className="px-4 py-3 text-xs">{s.email}</td>
                    <td className="px-4 py-3 text-xs">
                      {s.formType === "student" ? "🎓 Сурагч" : "👨‍👩‍👦 Эцэг эх"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: `${STATUS_COLOR[s.paymentStatus]}20`, color: STATUS_COLOR[s.paymentStatus] }}>
                        {STATUS_LABEL[s.paymentStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: s.emailStatus === "sent" ? "rgba(110,231,183,.1)" : "rgba(148,163,184,.1)", color: s.emailStatus === "sent" ? "var(--accent)" : "var(--muted)" }}>
                        {s.emailStatus === "sent" ? "Илгээсэн" : s.emailStatus === "failed" ? "Алдаатай" : "Хүлээгдэж байна"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={(e) => { e.stopPropagation(); setSelected(s); setNote(s.adminNote); setMsg(""); }}
                        className="text-xs px-3 py-1 rounded-lg border transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                        Харах
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-3">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              className="text-xs px-3 py-2 rounded-xl border disabled:opacity-30"
              style={{ borderColor: "var(--border)", color: "var(--muted)" }}>← Өмнөх</button>
            <span className="text-xs" style={{ color: "var(--muted)" }}>Хуудас {page}</span>
            <button disabled={items.length < 20} onClick={() => setPage((p) => p + 1)}
              className="text-xs px-3 py-2 rounded-xl border disabled:opacity-30"
              style={{ borderColor: "var(--border)", color: "var(--muted)" }}>Дараах →</button>
          </div>
        </>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,.7)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-lg rounded-3xl border max-h-[90vh] overflow-y-auto"
            style={{ background: "var(--surface)", borderColor: "rgba(110,231,183,.2)" }}>
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <h2 className="font-bold">Дэлгэрэнгүй</h2>
              <button onClick={() => setSelected(null)} style={{ color: "var(--muted)" }}>✕</button>
            </div>
            <div className="p-6 space-y-4">
              <Row label="Имэйл"  value={selected.email} />
              <Row label="Төрөл"  value={selected.formType === "student" ? "Сурагч" : "Эцэг эх"} />
              <Row label="Статус" value={STATUS_LABEL[selected.paymentStatus]} />
              <Row label="Дүн"    value={`₮${selected.paymentAmount.toLocaleString()}`} />
              <Row label="Огноо"  value={new Date(selected.createdAt).toLocaleString("mn-MN")} />

              {msg && <p className="text-xs" style={{ color: msg.startsWith("✓") ? "var(--accent)" : "#ef4444" }}>{msg}</p>}

              <div className="flex flex-wrap gap-2">
                {selected.paymentStatus !== "paid" && (
                  <button disabled={actionLoading} onClick={() => doAction(selected.id, "markPaid")}
                    className="text-xs px-4 py-2 rounded-xl font-bold transition disabled:opacity-50"
                    style={{ background: "var(--accent)", color: "#06080f" }}>
                    Гараар баталгаажуулах
                  </button>
                )}
                {selected.result && (
                  <button disabled={actionLoading} onClick={() => doAction(selected.id, "resendEmail")}
                    className="text-xs px-4 py-2 rounded-xl font-bold transition disabled:opacity-50 border"
                    style={{ borderColor: "var(--accent2)", color: "var(--accent2)" }}>
                    Имэйл дахин илгээх
                  </button>
                )}
              </div>

              <div>
                <p className="text-xs font-bold mb-2" style={{ color: "var(--muted)" }}>Тэмдэглэл</p>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                  className="w-full px-4 py-3 rounded-xl text-xs outline-none resize-none"
                  style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }} />
                <button onClick={() => doAction(selected.id, "note", note)} disabled={actionLoading}
                  className="mt-2 text-xs px-4 py-2 rounded-xl border transition disabled:opacity-50"
                  style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                  Хадгалах
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
