"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Question } from "@/lib/questions";
import type { Answer, FormType } from "@/types";

interface Props {
  formType: FormType;
  questions: Question[];
}

export default function FormWizard({ formType, questions }: Props) {
  const router = useRouter();
  const [step, setStep]       = useState<"email" | "questions" | "review" | "loading">("email");
  const [email, setEmail]     = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState("");

  const q = questions[current];
  const total = questions.length;
  const progress = step === "questions" ? Math.round(((current) / total) * 100) : step === "review" ? 100 : 0;

  /* ── EMAIL STEP ── */
  const handleEmailNext = () => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) { setEmailErr("Имэйл хаяг буруу байна"); return; }
    setEmailErr("");
    setStep("questions");
  };

  /* ── ANSWER ── */
  const setAnswer = useCallback((id: string, val: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  }, []);

  const toggleMulti = useCallback((id: string, opt: string) => {
    setAnswers((prev) => {
      const cur = (prev[id] as string[] | undefined) ?? [];
      return { ...prev, [id]: cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt] };
    });
  }, []);

  const currentAnswer = answers[q?.id];
  const canNext = () => {
    if (!q) return false;
    const a = answers[q.id];
    if (q.type === "multi") return Array.isArray(a) && a.length > 0;
    return !!a;
  };

  const handleNext = () => {
    if (current < total - 1) { setCurrent((c) => c + 1); }
    else { setStep("review"); }
  };
  const handleBack = () => {
    if (current === 0) setStep("email");
    else setCurrent((c) => c - 1);
  };

  /* ── SUBMIT ── */
  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const payload: Answer[] = questions.map((q) => ({
        questionId: q.id,
        question:   q.question,
        answer:     answers[q.id] ?? "",
      }));
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formType, email, answers: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Алдаа гарлаа");
      router.push(`/payment/${data.submissionId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Алдаа гарлаа");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── UI helpers ── */
  const labelClass = "block text-sm font-semibold mb-3";
  const optBtnBase = "w-full text-left px-5 py-3.5 rounded-xl border text-sm font-medium transition-all duration-150 hover:-translate-y-0.5";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* top bar */}
      <div className="sticky top-0 z-10 px-6 py-4 flex items-center gap-4 border-b"
        style={{ background: "rgba(6,8,15,.9)", backdropFilter: "blur(20px)", borderColor: "var(--border)" }}>
        <span className="font-serif text-xl">Hi <span style={{ color: "var(--accent)" }}>Future</span></span>
        {step === "questions" && (
          <div className="flex-1 flex items-center gap-3 ml-4">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.06)" }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg,#6ee7b7,#38bdf8)" }} />
            </div>
            <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>{current + 1}/{total}</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-lg">

          {/* ── EMAIL ── */}
          {step === "email" && (
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>
                {formType === "student" ? "🎓 Сурагчийн форм" : "👨‍👩‍👦 Эцэг эхийн форм"}
              </p>
              <h1 className="font-serif text-3xl mb-2">Имэйл хаяг оруулна уу</h1>
              <p className="text-sm mb-8 leading-relaxed" style={{ color: "var(--muted)" }}>
                Үр дүн энэ имэйл хаягт илгээгдэнэ. Нэр, утас шаардахгүй.
              </p>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailNext()}
                placeholder="example@gmail.com"
                className="w-full px-5 py-4 rounded-2xl text-base outline-none transition-all duration-200 mb-2"
                style={{ background: "var(--surface)", border: `1px solid ${emailErr ? "#ef4444" : "var(--border)"}`, color: "var(--text)" }}
              />
              {emailErr && <p className="text-xs text-red-400 mb-4">{emailErr}</p>}
              <p className="text-xs mb-8" style={{ color: "var(--muted)" }}>
                Энэ имэйл хаягт зөвлөгөө автоматаар илгээгдэнэ.
              </p>
              <button onClick={handleEmailNext}
                className="w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg,#6ee7b7,#38bdf8)", color: "#06080f" }}>
                Эхлэх →
              </button>
            </div>
          )}

          {/* ── QUESTION ── */}
          {step === "questions" && q && (
            <div key={q.id}>
              <p className="text-xs font-semibold mb-6" style={{ color: "var(--muted)" }}>
                {current + 1} / {total}
              </p>
              <h2 className="font-serif text-2xl md:text-3xl mb-8 leading-snug">{q.question}</h2>

              {/* MULTI */}
              {q.type === "multi" && (
                <div className="flex flex-col gap-2">
                  {q.options?.map((opt) => {
                    const sel = (answers[q.id] as string[] | undefined)?.includes(opt);
                    return (
                      <button key={opt} onClick={() => toggleMulti(q.id, opt)}
                        className={optBtnBase}
                        style={{
                          background: sel ? "rgba(110,231,183,.1)" : "var(--surface)",
                          borderColor: sel ? "rgba(110,231,183,.5)" : "var(--border)",
                          color: sel ? "var(--accent)" : "var(--text)",
                        }}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* SINGLE */}
              {q.type === "single" && (
                <div className="flex flex-col gap-2">
                  {q.options?.map((opt) => {
                    const sel = answers[q.id] === opt;
                    return (
                      <button key={opt} onClick={() => setAnswer(q.id, opt)}
                        className={optBtnBase}
                        style={{
                          background: sel ? "rgba(110,231,183,.1)" : "var(--surface)",
                          borderColor: sel ? "rgba(110,231,183,.5)" : "var(--border)",
                          color: sel ? "var(--accent)" : "var(--text)",
                        }}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* SCALE */}
              {q.type === "scale" && (
                <div>
                  <div className="flex justify-between text-xs mb-4" style={{ color: "var(--muted)" }}>
                    <span>{q.scaleMin}</span>
                    <span>{q.scaleMax}</span>
                  </div>
                  <div className="flex gap-3 justify-center">
                    {[1, 2, 3, 4, 5].map((v) => {
                      const sel = answers[q.id] === String(v);
                      return (
                        <button key={v} onClick={() => setAnswer(q.id, String(v))}
                          className="w-14 h-14 rounded-2xl font-bold text-lg border transition-all duration-150 hover:-translate-y-1"
                          style={{
                            background: sel ? "linear-gradient(135deg,#6ee7b7,#38bdf8)" : "var(--surface)",
                            borderColor: sel ? "transparent" : "var(--border)",
                            color: sel ? "#06080f" : "var(--text)",
                          }}>
                          {v}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* nav */}
              <div className="flex gap-3 mt-8">
                <button onClick={handleBack}
                  className="px-6 py-3.5 rounded-2xl font-semibold text-sm border transition-all"
                  style={{ background: "transparent", borderColor: "var(--border)", color: "var(--muted)" }}>
                  ← Буцах
                </button>
                <button onClick={handleNext} disabled={!canNext()}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg,#6ee7b7,#38bdf8)", color: "#06080f" }}>
                  {current === total - 1 ? "Дуусгах →" : "Дараах →"}
                </button>
              </div>
            </div>
          )}

          {/* ── REVIEW ── */}
          {step === "review" && (
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>Хариултаа шалгах</p>
              <h2 className="font-serif text-3xl mb-2">Бүгд зөв үү?</h2>
              <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>Имэйл: <strong style={{ color: "var(--text)" }}>{email}</strong></p>

              <div className="rounded-2xl border p-5 mb-6 max-h-[60vh] overflow-y-auto" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                {questions.slice(0, 8).map((q) => (
                  <div key={q.id} className="mb-4 last:mb-0">
                    <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>{q.question}</p>
                    <p className="text-sm font-medium">
                      {Array.isArray(answers[q.id])
                        ? (answers[q.id] as string[]).join(", ")
                        : answers[q.id] ?? "—"}
                    </p>
                  </div>
                ))}
                {questions.length > 8 && (
                  <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>… болон {questions.length - 8} нэмэлт хариулт</p>
                )}
              </div>

              {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

              <div className="flex gap-3">
                <button onClick={() => { setCurrent(total - 1); setStep("questions"); }}
                  className="px-6 py-3.5 rounded-2xl font-semibold text-sm border"
                  style={{ background: "transparent", borderColor: "var(--border)", color: "var(--muted)" }}>
                  ← Засах
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#6ee7b7,#38bdf8)", color: "#06080f" }}>
                  {submitting ? "Илгээж байна..." : "Төлбөр рүү үргэлжлэх →"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
