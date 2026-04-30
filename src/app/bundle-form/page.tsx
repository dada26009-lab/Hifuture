"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { STUDENT_QUESTIONS, PARENT_QUESTIONS } from "@/lib/questions";
import type { Question } from "@/lib/questions";
import type { Answer } from "@/types";

type Stage = "email" | "student" | "parent" | "review" | "submitting";

export default function BundleFormPage() {
  const router = useRouter();
  const [stage, setStage]           = useState<Stage>("email");
  const [email, setEmail]           = useState("");
  const [emailErr, setEmailErr]     = useState("");
  const [currentQ, setCurrentQ]     = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string | string[]>>({});
  const [parentAnswers, setParentAnswers]   = useState<Record<string, string | string[]>>({});
  const [error, setError]           = useState("");
  const [submitting, setSubmitting] = useState(false);

  const studentQs = STUDENT_QUESTIONS;
  const parentQs  = PARENT_QUESTIONS;

  const isStudentStage = stage === "student";
  const questions: Question[] = isStudentStage ? studentQs : parentQs;
  const answers = isStudentStage ? studentAnswers : parentAnswers;
  const setAnswers = isStudentStage ? setStudentAnswers : setParentAnswers;
  const totalQ = questions.length;
  const q = questions[currentQ];

  const studentTotal = studentQs.length;
  const parentTotal  = parentQs.length;
  const totalAll     = studentTotal + parentTotal;
  const progressNum  = stage === "student"
    ? currentQ
    : stage === "parent"
    ? studentTotal + currentQ
    : stage === "review" ? totalAll : 0;
  const progressPct  = Math.round((progressNum / totalAll) * 100);

  /* ── EMAIL ── */
  const handleEmailNext = () => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) { setEmailErr("Имэйл хаяг буруу байна"); return; }
    setEmailErr("");
    setStage("student");
    setCurrentQ(0);
  };

  /* ── ANSWER ── */
  const setAnswer = useCallback((id: string, val: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  }, [setAnswers]);

  const toggleMulti = useCallback((id: string, opt: string) => {
    setAnswers((prev) => {
      const cur = (prev[id] as string[] | undefined) ?? [];
      return { ...prev, [id]: cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt] };
    });
  }, [setAnswers]);

  const canNext = () => {
    if (!q) return false;
    const a = answers[q.id];
    if (q.type === "multi") return Array.isArray(a) && a.length > 0;
    return !!a;
  };

  const handleNext = () => {
    if (currentQ < totalQ - 1) {
      setCurrentQ((c) => c + 1);
    } else {
      if (stage === "student") {
        setStage("parent");
        setCurrentQ(0);
      } else {
        setStage("review");
      }
    }
  };

  const handleBack = () => {
    if (currentQ === 0) {
      if (stage === "student") setStage("email");
      else if (stage === "parent") { setStage("student"); setCurrentQ(studentTotal - 1); }
    } else {
      setCurrentQ((c) => c - 1);
    }
  };

  /* ── SUBMIT ── */
  const handleSubmit = async () => {
    setSubmitting(true); setError("");
    try {
      const sPayload: Answer[] = studentQs.map((q) => ({
        questionId: q.id, question: q.question, answer: studentAnswers[q.id] ?? "",
      }));
      const pPayload: Answer[] = parentQs.map((q) => ({
        questionId: q.id, question: q.question, answer: parentAnswers[q.id] ?? "",
      }));

      // Submit student form
      const r1 = await fetch("/api/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formType: "student", email, answers: sPayload, bundlePrice: 12500 }),
      });
      const d1 = await r1.json();
      if (!r1.ok) throw new Error(d1.error);

      // Submit parent form
      const r2 = await fetch("/api/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formType: "parent", email, answers: pPayload, bundlePrice: 12500 }),
      });
      const d2 = await r2.json();
      if (!r2.ok) throw new Error(d2.error);

      // Go to bundle payment page with both IDs
      router.push(`/payment/bundle?s=${d1.submissionId}&p=${d2.submissionId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Алдаа гарлаа");
    } finally {
      setSubmitting(false);
    }
  };

  const optBtnBase = "w-full text-left px-5 py-3.5 rounded-xl border text-sm font-medium transition-all duration-150 hover:-translate-y-0.5";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* topbar */}
      <div className="sticky top-0 z-10 px-6 py-4 flex items-center gap-4 border-b"
        style={{ background: "rgba(6,8,15,.9)", backdropFilter: "blur(20px)", borderColor: "var(--border)" }}>
        <span className="font-serif text-xl">Hi <span style={{ color: "var(--accent)" }}>Future</span></span>
        <span className="px-3 py-1 rounded-full text-xs font-bold border ml-1"
          style={{ background: "linear-gradient(135deg,rgba(56,189,248,.1),rgba(167,139,250,.1))", borderColor: "rgba(56,189,248,.3)", color: "var(--accent2)" }}>
          ✨ Bundle
        </span>
        {(stage === "student" || stage === "parent") && (
          <div className="flex-1 flex items-center gap-3 ml-2">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.06)" }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#6ee7b7,#38bdf8)" }} />
            </div>
            <span className="text-xs font-semibold flex-shrink-0" style={{ color: "var(--muted)" }}>
              {stage === "student" ? "🎓 Сурагч" : "👨‍👩‍👦 Эцэг эх"} {currentQ + 1}/{totalQ}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-lg">

          {/* EMAIL */}
          {stage === "email" && (
            <div>
              <div className="mb-6">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4"
                  style={{ background: "linear-gradient(135deg,#38bdf8,#a78bfa)", color: "white" }}>
                  ✨ Bundle — ₮25,000
                </span>
                <h1 className="font-serif text-3xl mb-2">Имэйл хаяг оруулна уу</h1>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  Сурагч болон эцэг эх хоёулааны үр дүн энэ имэйлд илгээгдэнэ.
                </p>
              </div>

              <div className="rounded-2xl border p-4 mb-6 flex gap-3"
                style={{ background: "rgba(56,189,248,.05)", borderColor: "rgba(56,189,248,.2)" }}>
                <div className="text-center flex-1">
                  <div className="text-2xl mb-1">🎓</div>
                  <div className="text-xs font-bold" style={{ color: "var(--accent)" }}>Сурагчийн форм</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>{studentTotal} асуулт</div>
                </div>
                <div className="flex items-center" style={{ color: "var(--muted)" }}>→</div>
                <div className="text-center flex-1">
                  <div className="text-2xl mb-1">👨‍👩‍👦</div>
                  <div className="text-xs font-bold" style={{ color: "var(--accent3)" }}>Эцэг эхийн форм</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>{parentTotal} асуулт</div>
                </div>
                <div className="flex items-center" style={{ color: "var(--muted)" }}>→</div>
                <div className="text-center flex-1">
                  <div className="text-2xl mb-1">📩</div>
                  <div className="text-xs font-bold" style={{ color: "var(--accent2)" }}>2 үр дүн</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>нэг имэйлд</div>
                </div>
              </div>

              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailNext()}
                placeholder="example@gmail.com"
                className="w-full px-5 py-4 rounded-2xl text-base outline-none mb-2"
                style={{ background: "var(--surface)", border: `1px solid ${emailErr ? "#ef4444" : "var(--border)"}`, color: "var(--text)" }} />
              {emailErr && <p className="text-xs text-red-400 mb-4">{emailErr}</p>}

              <button onClick={handleEmailNext}
                className="w-full py-4 rounded-2xl font-bold text-base transition hover:-translate-y-0.5 mt-2"
                style={{ background: "linear-gradient(135deg,#38bdf8,#a78bfa)", color: "white" }}>
                Эхлэх — Сурагчийн форм →
              </button>
            </div>
          )}

          {/* QUESTIONS */}
          {(stage === "student" || stage === "parent") && q && (
            <div key={`${stage}-${q.id}`}>
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-bold"
                  style={stage === "student"
                    ? { background: "rgba(110,231,183,.1)", color: "var(--accent)" }
                    : { background: "rgba(167,139,250,.1)", color: "var(--accent3)" }}>
                  {stage === "student" ? "🎓 Сурагчийн форм" : "👨‍👩‍👦 Эцэг эхийн форм"}
                </span>
                <span className="text-xs" style={{ color: "var(--muted)" }}>{currentQ + 1} / {totalQ}</span>
              </div>

              <h2 className="font-serif text-2xl md:text-3xl mb-8 leading-snug">{q.question}</h2>

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

              {q.type === "scale" && (
                <div>
                  <div className="flex justify-between text-xs mb-4" style={{ color: "var(--muted)" }}>
                    <span>{q.scaleMin}</span><span>{q.scaleMax}</span>
                  </div>
                  <div className="flex gap-3 justify-center">
                    {[1,2,3,4,5].map((v) => {
                      const sel = answers[q.id] === String(v);
                      return (
                        <button key={v} onClick={() => setAnswer(q.id, String(v))}
                          className="w-14 h-14 rounded-2xl font-bold text-lg border transition-all hover:-translate-y-1"
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

              <div className="flex gap-3 mt-8">
                <button onClick={handleBack}
                  className="px-6 py-3.5 rounded-2xl font-semibold text-sm border"
                  style={{ background: "transparent", borderColor: "var(--border)", color: "var(--muted)" }}>
                  ← Буцах
                </button>
                <button onClick={handleNext} disabled={!canNext()}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-sm transition disabled:opacity-40 hover:-translate-y-0.5"
                  style={{ background: stage === "student" ? "var(--accent)" : "var(--accent3)", color: "#06080f" }}>
                  {currentQ === totalQ - 1
                    ? stage === "student" ? "Эцэг эхийн форм руу →" : "Дуусгах →"
                    : "Дараах →"}
                </button>
              </div>
            </div>
          )}

          {/* REVIEW */}
          {stage === "review" && (
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>Хариултаа шалгах</p>
              <h2 className="font-serif text-3xl mb-2">Бүгд зөв үү?</h2>
              <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Имэйл: <strong style={{ color: "var(--text)" }}>{email}</strong></p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="rounded-2xl border p-4" style={{ background: "var(--surface)", borderColor: "rgba(110,231,183,.2)" }}>
                  <p className="text-xs font-bold mb-2" style={{ color: "var(--accent)" }}>🎓 Сурагчийн форм</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>{Object.keys(studentAnswers).length} / {studentTotal} асуулт</p>
                </div>
                <div className="rounded-2xl border p-4" style={{ background: "var(--surface)", borderColor: "rgba(167,139,250,.2)" }}>
                  <p className="text-xs font-bold mb-2" style={{ color: "var(--accent3)" }}>👨‍👩‍👦 Эцэг эхийн форм</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>{Object.keys(parentAnswers).length} / {parentTotal} асуулт</p>
                </div>
              </div>

              <div className="rounded-2xl border p-4 mb-6" style={{ background: "var(--surface2)", borderColor: "rgba(56,189,248,.2)" }}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">Bundle — хоёр форм</p>
                    <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>2 үр дүн → {email}-д илгээгдэнэ</p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl">₮25,000</p>
                    <p className="text-xs" style={{ color: "var(--accent)" }}>₮5,000 хэмнэнэ</p>
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

              <div className="flex gap-3">
                <button onClick={() => { setStage("parent"); setCurrentQ(parentTotal - 1); }}
                  className="px-6 py-3.5 rounded-2xl font-semibold text-sm border"
                  style={{ background: "transparent", borderColor: "var(--border)", color: "var(--muted)" }}>
                  ← Засах
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-sm transition disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#38bdf8,#a78bfa)", color: "white" }}>
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
