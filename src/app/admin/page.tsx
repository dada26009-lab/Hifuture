"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleLogin = async () => {
    if (!password) return;
    setLoading(true);
    setError("");

    try {
      const res  = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (res.ok) {
        router.replace("/admin/dashboard");
      } else {
        setAttempts((a) => a + 1);
        setError(data.error ?? "Нууц үг буруу байна");
        setPassword("");
      }
    } catch {
      setError("Сүлжээний алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5"
      style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl mb-2">
            Hi <span style={{ color: "var(--accent)" }}>Future</span>
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Админ нэвтрэх</p>
        </div>

        <div className="rounded-2xl border p-6"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Нууц үг"
            className="w-full px-4 py-3.5 rounded-xl text-sm outline-none mb-3"
            style={{
              background: "var(--surface2)",
              border: `1px solid ${error ? "#ef4444" : "var(--border)"}`,
              color: "var(--text)",
            }}
          />

          {error && (
            <p className="text-xs text-red-400 mb-3">{error}</p>
          )}

          {attempts >= 3 && (
            <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
              ⚠️ Олон удаа буруу оролдвол түр хаагдана
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading || !password}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#6ee7b7,#38bdf8)", color: "#06080f" }}>
            {loading ? "Нэвтэрж байна..." : "Нэвтрэх →"}
          </button>
        </div>
      </div>
    </div>
  );
}
