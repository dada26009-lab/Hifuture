"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

interface Invoice {
  invoiceId: string;
  qrCode: string;
  qrText: string;
  urls: { name: string; description: string; logo: string; link: string }[];
}

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [invoice, setInvoice]   = useState<Invoice | null>(null);
  const [loading, setLoading]   = useState(true);
  const [status, setStatus]     = useState<"waiting" | "paid" | "generating">("waiting");
  const [error, setError]       = useState("");
  const [isStub, setIsStub]     = useState(false);
  const [polling, setPolling]   = useState(false);

  // Invoice үүсгэх
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ submissionId: id }),
        });
        const data = await res.json();
        if (data.alreadyPaid) { router.replace(`/result/${id}`); return; }
        if (!res.ok) throw new Error(data.error);
        setInvoice(data.invoice);
        setIsStub(!data.invoice?.qrCode);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Алдаа гарлаа");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  // Төлбөр шалгах — resultReady болтол хүлээнэ
  const checkPaid = useCallback(async () => {
    const res  = await fetch("/api/payment/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId: id }),
    });
    const data = await res.json();

    if (data.paid && data.resultReady) {
      // Result бэлэн — шилжинэ
      router.replace(`/result/${id}`);
    } else if (data.paid && !data.resultReady) {
      // Төлбөр болсон ч result үүсэж байна
      setStatus("generating");
    }
  }, [id, router]);

  useEffect(() => {
    if (!invoice) return;
    const t = setInterval(checkPaid, 3000);
    return () => clearInterval(t);
  }, [invoice, checkPaid]);

  // Stub: гараар баталгаажуулах
  const handleManualConfirm = async () => {
    setPolling(true);
    setStatus("generating");
    await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "markPaid" }),
    });
    // Result бэлэн болтол poll хийнэ
    const wait = setInterval(async () => {
      const res = await fetch("/api/payment/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: id }),
      });
      const data = await res.json();
      if (data.resultReady) {
        clearInterval(wait);
        router.replace(`/result/${id}`);
      }
    }, 2000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <p style={{ color: "var(--muted)" }}>Төлбөрийн мэдээлэл үүсгэж байна...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: "var(--bg)" }}>
      <div className="text-center max-w-sm">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={() => router.back()} className="text-sm" style={{ color: "var(--muted)" }}>← Буцах</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-16" style={{ background: "var(--bg)" }}>
      <span className="font-serif text-2xl mb-10">Hi <span style={{ color: "var(--accent)" }}>Future</span></span>

      <div className="w-full max-w-sm rounded-3xl border p-8 text-center"
        style={{ background: "var(--surface)", borderColor: "rgba(110,231,183,.2)" }}>

        {/* Generating state */}
        {status === "generating" ? (
          <>
            <div className="text-4xl mb-4">🤖</div>
            <h1 className="font-serif text-2xl mb-3">Зөвлөгөө үүсгэж байна...</h1>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
              AI таны хариултуудыг шинжилж байна. 20-30 секунд хүлээнэ үү.
            </p>
            <div className="w-full h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "var(--surface2)" }}>
              <div className="h-full rounded-full animate-pulse"
                style={{ width: "70%", background: "linear-gradient(90deg,#6ee7b7,#38bdf8)" }} />
            </div>
            <p className="text-xs animate-pulse" style={{ color: "var(--muted)" }}>Хуудсыг хаахгүй байна уу...</p>
          </>
        ) : (
          <>
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>
              Төлбөр төлөх
            </p>
            <h1 className="font-serif text-2xl mb-2">QPay-р төлнө үү</h1>

            {isStub ? (
              <div className="rounded-2xl border p-5 mb-6 text-left"
                style={{ background: "rgba(251,191,36,.05)", borderColor: "rgba(251,191,36,.2)" }}>
                <p className="text-xs font-bold mb-2" style={{ color: "#fbbf24" }}>⚠️ QPay тохируулаагүй байна</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                  Тест горимд ажиллаж байна. Доорх товчоор гараар баталгаажуулна уу.
                </p>
              </div>
            ) : (
              <>
                {invoice?.qrCode && (
                  <div className="flex justify-center mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`data:image/png;base64,${invoice.qrCode}`} alt="QPay QR" className="w-52 h-52 rounded-xl" />
                  </div>
                )}
                <p className="text-xs mb-6" style={{ color: "var(--muted)" }}>QPay апп-аараа QR уншуулна уу</p>
                {invoice?.urls?.map((u) => (
                  <a key={u.name} href={u.link} target="_blank" rel="noreferrer"
                    className="block w-full py-3 rounded-xl text-sm font-semibold mb-2 border transition hover:-translate-y-0.5"
                    style={{ background: "var(--surface2)", borderColor: "var(--border)" }}>
                    {u.name}
                  </a>
                ))}
                <p className="text-xs animate-pulse mt-4" style={{ color: "var(--muted)" }}>Төлбөр шалгаж байна...</p>
              </>
            )}

            {isStub && (
              <button onClick={handleManualConfirm} disabled={polling}
                className="w-full py-4 rounded-2xl font-bold text-sm transition disabled:opacity-50 mt-2"
                style={{ background: "linear-gradient(135deg,#6ee7b7,#38bdf8)", color: "#06080f" }}>
                {polling ? "Боловсруулж байна..." : "Тест: Төлбөр баталгаажуулах →"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
