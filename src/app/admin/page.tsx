"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [pw, setPw]       = useState("");
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!pw) { setErr("Нууц үг оруулна уу"); return; }
    setLoading(true); setErr("");
    const res  = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setErr(data.error ?? "Алдаа"); return; }
    router.replace("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm rounded-3xl border p-10" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <p className="font-serif text-2xl mb-1 text-center">Hi <span style={{ color: "var(--accent)" }}>Future</span></p>
        <p className="text-sm text-center mb-8" style={{ color: "var(--muted)" }}>Админ нэвтрэх</p>

        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          placeholder="Нууц үг" className="w-full px-5 py-3.5 rounded-2xl outline-none mb-2 text-sm"
          style={{ background: "var(--surface2)", border: `1px solid ${err ? "#ef4444" : "var(--border)"}`, color: "var(--text)" }} />
        {err && <p className="text-xs text-red-400 mb-3">{err}</p>}

        <button onClick={handleLogin} disabled={loading}
          className="w-full py-3.5 rounded-2xl font-bold text-sm transition disabled:opacity-50 mt-2"
          style={{ background: "linear-gradient(135deg,#6ee7b7,#38bdf8)", color: "#06080f" }}>
          {loading ? "Нэвтэрч байна..." : "Нэвтрэх →"}
        </button>

        <p className="text-xs text-center mt-5" style={{ color: "var(--muted)" }}>
          Анхдагч нууц үг: <code>admin123</code><br/>
          <span style={{ color: "#fbbf24" }}>Үйлдвэрлэлд ADMIN_PASSWORD_HASH тохируулна уу</span>
        </p>
      </div>
    </div>
  );
}
