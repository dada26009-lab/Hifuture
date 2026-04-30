"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { ResultData, FormType } from "@/types";

interface ResultResponse {
  formType: FormType;
  email: string;
  result: ResultData | null;
  createdAt: string;
}

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData]     = useState<ResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/result?id=${id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setData(json);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Алдаа гарлаа");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5" style={{ background: "var(--bg)" }}>
      <p className="font-serif text-2xl">Hi <span style={{ color: "var(--accent)" }}>Future</span></p>
      <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface2)" }}>
        <div className="h-full rounded-full animate-[loading_1.5s_ease_infinite]"
          style={{ background: "linear-gradient(90deg,#6ee7b7,#38bdf8)", animation: "pulse 1.5s ease infinite" }} />
      </div>
      <p style={{ color: "var(--muted)", fontSize: 13 }}>Зөвлөгөө ачааллаж байна...</p>
    </div>
  );

  if (error || !data?.result) return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: "var(--bg)" }}>
      <p className="text-red-400 text-center">{error || "Үр дүн олдсонгүй"}</p>
    </div>
  );

  const { result, formType, email } = data;
  const label = formType === "student" ? "Сурагчийн форм" : "Эцэг эхийн форм";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* top */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b"
        style={{ background: "rgba(6,8,15,.92)", backdropFilter: "blur(20px)", borderColor: "var(--border)" }}>
        <span className="font-serif text-xl">Hi <span style={{ color: "var(--accent)" }}>Future</span></span>
        <span className="px-3 py-1 rounded-full text-xs font-semibold border"
          style={{ background: "rgba(110,231,183,.08)", borderColor: "rgba(110,231,183,.2)", color: "var(--accent)" }}>
          ✓ Таны зөвлөгөө бэлэн
        </span>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-12 pb-20">
        {/* hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-5"
            style={{ background: "linear-gradient(135deg,rgba(110,231,183,.15),rgba(56,189,248,.1))", border: "1px solid rgba(110,231,183,.3)" }}>🎯</div>
          <h1 className="font-serif text-3xl mb-2">Таны мэргэжлийн зөвлөгөө</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>{label} · {email}</p>
        </div>

        {/* summary */}
        <Section label="Ерөнхий дүгнэлт" color="var(--accent)">
          <div className="rounded-2xl border p-6 text-sm leading-relaxed" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "#cbd5e1" }}>
            {result.summary}
          </div>
        </Section>

        {/* majors */}
        <Section label="Тохиромжтой топ 3 мэргэжлийн чиглэл" color="var(--accent2)">
          <div className="flex flex-col gap-3">
            {result.majors.map((m, i) => (
              <div key={m.rank} className="rounded-2xl border p-5 flex gap-4"
                style={{ background: m.rank === 1 ? "linear-gradient(135deg,rgba(110,231,183,.06),rgba(56,189,248,.03))" : "var(--surface)", borderColor: m.rank === 1 ? "rgba(110,231,183,.28)" : "var(--border)", animationDelay: `${i * 120}ms` }}>
                <div className="font-serif text-2xl leading-none flex-shrink-0 w-8"
                  style={m.rank === 1 ? { background: "linear-gradient(135deg,#6ee7b7,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } : { color: "rgba(255,255,255,.25)" }}>
                  {m.rank}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-base mb-2">{m.name}</div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {m.universities.map((u) => (
                      <span key={u} className="px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                        style={{ background: "rgba(56,189,248,.08)", borderColor: "rgba(56,189,248,.2)", color: "var(--accent2)" }}>{u}</span>
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--muted)" }}>{m.why}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: "var(--muted)" }}>Тохирол</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.06)" }}>
                      <div className="h-full rounded-full" style={{ width: `${m.match}%`, background: "linear-gradient(90deg,#6ee7b7,#38bdf8)", transition: "width 1.2s ease .3s" }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>{m.match}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* strengths */}
        <Section label="Таны ур чадварууд" color="var(--accent)">
          <div className="grid grid-cols-2 gap-3">
            {result.strengths.map((s, i) => (
              <div key={s.name} className="rounded-2xl border p-4 flex gap-3"
                style={{ background: "var(--surface)", borderColor: "var(--border)", animationDelay: `${i * 80}ms` }}>
                <span className="text-xl flex-shrink-0 mt-0.5">{s.icon}</span>
                <div>
                  <div className="font-bold text-sm mb-1">{s.name}</div>
                  <div className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* cautions */}
        <Section label="Анхаарах зүйлс" color="#fbbf24">
          <div className="flex flex-col gap-2">
            {result.cautions.map((c) => (
              <div key={c} className="rounded-xl border p-4 flex gap-3 text-sm"
                style={{ background: "rgba(251,191,36,.05)", borderColor: "rgba(251,191,36,.14)", color: "#cbd5e1" }}>
                <span className="flex-shrink-0">⚠️</span>
                <span className="leading-relaxed">{c}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* next steps */}
        <Section label="Цаашид..." color="var(--accent3)">
          <div className="flex flex-col gap-2">
            {result.next_steps.map((s, i) => (
              <div key={s} className="rounded-xl border p-4 flex gap-3 text-sm"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#6ee7b7,#38bdf8)", color: "#06080f", fontSize: 11 }}>{i + 1}</span>
                <span className="leading-relaxed" style={{ color: "#cbd5e1" }}>{s}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* disclaimer */}
        <div className="rounded-2xl border p-5 text-center text-xs leading-relaxed"
          style={{ background: "rgba(148,163,184,.04)", borderColor: "rgba(148,163,184,.1)", color: "var(--muted)" }}>
          ⚠️ Энэ зөвлөгөө таны хариултад суурилсан <strong>чиглүүлэх зөвлөмж</strong> бөгөөд эцсийн шийдвэр биш. Эцэг эх, багш, зөвлөхтэйгөө нэмэлтээр ярилцахыг зөвлөж байна.
        </div>
      </div>
    </div>
  );
}

function Section({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color }}>{label}</span>
        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
      </div>
      {children}
    </div>
  );
}
