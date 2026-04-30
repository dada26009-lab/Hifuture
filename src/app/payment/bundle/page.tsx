"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function BundlePaymentPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const studentId    = searchParams.get("s") ?? "";
  const parentId     = searchParams.get("p") ?? "";

  const [status, setStatus]   = useState<"waiting" | "generating" | "done">("waiting");
  const [polling, setPolling] = useState(false);
  const [error, setError]     = useState("");

  const confirmPayment = useCallback(async () => {
    setPolling(true);
    setStatus("generating");

    // Mark both as paid
    await fetch("/api/admin/submissions", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: studentId, action: "markPaid" }),
    });
    await fetch("/api/admin/submissions", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: parentId, action: "markPaid" }),
    });

    // Poll until both results ready
    const wait = setInterval(async () => {
      const [r1, r2] = await Promise.all([
        fetch(`/api/result?id=${studentId}`).then((r) => r.json()),
        fetch(`/api/result?id=${parentId}`).then((r) => r.json()),
      ]);
      if (r1.result && r2.result) {
        clearInterval(wait);
        router.replace(`/result/bundle?s=${studentId}&p=${parentId}`);
      }
    }, 3000);
  }, [studentId, parentId, router]);

  if (!studentId || !parentId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <p className="text-red-400">Буруу холбоос</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-16" style={{ background: "var(--bg)" }}>
      <span className="font-serif text-2xl mb-10">Hi <span style={{ color: "var(--accent)" }}>Future</span></span>

      <div className="w-full max-w-sm rounded-3xl border p-8 text-center"
        style={{ background: "var(--surface)", borderColor: "rgba(56,189,248,.25)" }}>

        {status === "generating" ? (
          <>
            <div className="text-4xl mb-4">🤖</div>
            <h1 className="font-serif text-2xl mb-3">Зөвлөгөө үүсгэж байна...</h1>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
              Сурагч болон эцэг эхийн хариултуудыг шинжилж байна.<br/>
              30-60 секунд хүлээнэ үү.
            </p>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface2)" }}>
              <div className="h-full rounded-full animate-pulse"
                style={{ width: "60%", background: "linear-gradient(90deg,#38bdf8,#a78bfa)" }} />
            </div>
            <p className="text-xs mt-3 animate-pulse" style={{ color: "var(--muted)" }}>Хуудсыг хаахгүй байна уу...</p>
          </>
        ) : (
          <>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4"
              style={{ background: "linear-gradient(135deg,#38bdf8,#a78bfa)", color: "white" }}>
              ✨ Bundle — ₮25,000
            </span>
            <h1 className="font-serif text-2xl mb-2">Төлбөр төлнө үү</h1>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
              Сурагч болон эцэг эхийн хоёр үр дүн нэг дор авна.
            </p>

            <div className="rounded-2xl border p-4 mb-6 text-left"
              style={{ background: "rgba(251,191,36,.05)", borderColor: "rgba(251,191,36,.2)" }}>
              <p className="text-xs font-bold mb-1" style={{ color: "#fbbf24" }}>⚠️ QPay тохируулаагүй байна</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Тест горимд ажиллаж байна.</p>
            </div>

            {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

            <button onClick={confirmPayment} disabled={polling}
              className="w-full py-4 rounded-2xl font-bold text-sm transition disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#38bdf8,#a78bfa)", color: "white" }}>
              {polling ? "Боловсруулж байна..." : "Тест: Төлбөр баталгаажуулах →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
