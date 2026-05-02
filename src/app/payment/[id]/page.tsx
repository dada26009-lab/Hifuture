"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [amount, setAmount]   = useState(15000);
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus]   = useState<"waiting" | "generating">("waiting");
  const [copied, setCopied]   = useState<string | null>(null);
  const [error, setError]     = useState("");

  const IBAN  = "MN29000500 5224783525";
  const NAME  = "Э.Дамбажав";
  const BANK  = "Хаан банк";

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
        if (data.email) setEmail(data.email);
        if (data.amount) setAmount(data.amount);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  // Poll result
  useEffect(() => {
    if (status !== "generating") return;
    const t = setInterval(async () => {
      const res  = await fetch(`/api/result?id=${id}`);
      const data = await res.json();
      if (data.result) {
        clearInterval(t);
        router.replace(`/result/${id}`);
      }
    }, 3000);
    return () => clearInterval(t);
  }, [status, id, router]);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <p style={{ color: "var(--muted)" }}>Ачааллаж байна...</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-16" style={{ background: "var(--bg)" }}>
      <span className="font-serif text-2xl mb-8">Hi <span style={{ color: "var(--accent)" }}>Future</span></span>

      <div className="w-full max-w-sm rounded-3xl border p-7"
        style={{ background: "var(--surface)", borderColor: "rgba(110,231,183,.2)" }}>

        {status === "generating" ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-4">🤖</div>
            <h1 className="font-serif text-2xl mb-3">Зөвлөгөө үүсгэж байна...</h1>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
              AI таны хариултуудыг шинжилж байна.<br/>30-40 секунд хүлээнэ үү.
            </p>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface2)" }}>
              <div className="h-full rounded-full animate-pulse"
                style={{ width: "65%", background: "linear-gradient(90deg,#6ee7b7,#38bdf8)" }} />
            </div>
            <p className="text-xs mt-3 animate-pulse" style={{ color: "var(--muted)" }}>Хуудсыг хаахгүй байна уу...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
                style={{ background: "rgba(110,231,183,.1)", color: "var(--accent)" }}>
                Банкны шилжүүлэг
              </span>
              <h1 className="font-serif text-2xl mb-1">Төлбөр төлөх</h1>
              <p className="text-3xl font-bold mt-2" style={{ color: "var(--accent)" }}>
                ₮{amount.toLocaleString()}
              </p>
            </div>

            {/* Bank info */}
            <div className="rounded-2xl border p-4 mb-4 space-y-3"
              style={{ background: "var(--surface2)", borderColor: "rgba(110,231,183,.15)" }}>

              {/* Bank name */}
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Банк</p>
                <p className="font-bold text-sm">{BANK}</p>
              </div>

              {/* IBAN */}
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>IBAN / Дансны дугаар</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-sm font-mono">{IBAN}</p>
                  <button onClick={() => copy(IBAN, "iban")}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 transition"
                    style={{
                      background: copied === "iban" ? "var(--accent)" : "rgba(110,231,183,.1)",
                      color: copied === "iban" ? "#06080f" : "var(--accent)",
                    }}>
                    {copied === "iban" ? "✓ Хуулсан" : "Хуулах"}
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Данс эзэмшигч</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-sm">{NAME}</p>
                  <button onClick={() => copy(NAME, "name")}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 transition"
                    style={{
                      background: copied === "name" ? "var(--accent)" : "rgba(110,231,183,.1)",
                      color: copied === "name" ? "#06080f" : "var(--accent)",
                    }}>
                    {copied === "name" ? "✓ Хуулсан" : "Хуулах"}
                  </button>
                </div>
              </div>

              {/* Email as reference */}
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Гүйлгээний утга (заавал бичнэ үү)</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-sm break-all" style={{ color: "var(--accent2)" }}>
                    {email || id}
                  </p>
                  <button onClick={() => copy(email || id, "ref")}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 transition"
                    style={{
                      background: copied === "ref" ? "var(--accent2)" : "rgba(56,189,248,.1)",
                      color: copied === "ref" ? "#06080f" : "var(--accent2)",
                    }}>
                    {copied === "ref" ? "✓ Хуулсан" : "Хуулах"}
                  </button>
                </div>
              </div>
            </div>

            {/* Info box */}
            <div className="rounded-xl border p-3 mb-5"
              style={{ background: "rgba(251,191,36,.05)", borderColor: "rgba(251,191,36,.2)" }}>
              <p className="text-xs leading-relaxed" style={{ color: "#fbbf24" }}>
                ⚠️ Гүйлгээний утганд имэйл хаягаа заавал бичнэ үү. Бид гүйлгээг шалгаад 30 минутын дотор үр дүнг илгээнэ.
              </p>
            </div>

            {/* Confirm button */}
            <button onClick={() => setStatus("generating")}
              className="w-full py-4 rounded-2xl font-bold text-sm transition hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg,#6ee7b7,#38bdf8)", color: "#06080f" }}>
              Төлбөр төллөө, хүлээх →
            </button>

            <p className="text-center text-xs mt-3" style={{ color: "var(--muted)" }}>
              Төлбөр шалгагдсаны дараа имэйлд зөвлөгөө ирнэ
            </p>
          </>
        )}
      </div>
    </div>
  );
}
