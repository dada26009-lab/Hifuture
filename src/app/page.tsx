"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

/* ── small reusable badge ── */
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase border"
      style={{ background: "rgba(110,231,183,.08)", borderColor: "rgba(110,231,183,.25)", color: "var(--accent)" }}>
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
      {children}
    </span>
  );
}

/* ── FAQ item ── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border transition-colors duration-200"
      style={{ background: "var(--surface)", borderColor: open ? "rgba(110,231,183,.25)" : "var(--border)" }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left font-semibold text-sm hover:text-[var(--accent)] transition-colors">
        {q}
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-transform duration-300 ${open ? "rotate-45" : ""}`}
          style={{ background: open ? "rgba(110,231,183,.15)" : "var(--surface2)", color: open ? "var(--accent)" : "var(--muted)" }}>
          +
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-48 pb-4" : "max-h-0"}`}>
        <p className="px-5 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{a}</p>
      </div>
    </div>
  );
}

/* ── reveal hook ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} style={{ transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms`, opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)" }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────── */
export default function Home() {
  const [navSolid, setNavSolid] = useState(false);
  useEffect(() => {
    const handler = () => setNavSolid(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* animated bars in why-section */
  const { ref: whyRef, visible: whyVisible } = useReveal();

  const faqs = [
    { q: "Зөвлөгөө хэр нарийн байдаг вэ?", a: "AI чиний 30 гаруй асуултын хариуд суурилан дүн шинжилгээ хийж, тохирох топ  мэргэжлийн чиглэл, ур чадвар, анхаарах зүйлс, дараагийн алхмуудыг нарийвчлан гаргана. Энэ нь зөвлөгөө бөгөөд эцсийн шийдвэр биш гэдгийг санаарай." },
    { q: "Нэвтрэх, бүртгэл шаардлагатай юу?", a: "Үгүй. Зөвхөн имэйл хаяг оруулахад хангалттай." },
    { q: "Форм бөглөхөд хэр удаан вэ?", a: "Дунджаар 15–20 минут. Нэг дэлгэц дээр нэг асуулт байдаг тул хялбар, тасалдуулахгүй бөглөнө." },
    { q: "Төлбөр төлсний дараа зөвлөгөө хэзээ ирдэг вэ?", a: "Төлбөр амжилттай баталгаажмагц дэлгэц дээр шууд харагдана. Мөн оруулсан имэйл хаягт автоматаар илгээгдэнэ." },
    { q: "Сурагч болон эцэг эх хоёулаа бөглөх нь зүйтэй юу?", a: "Тийм. Хоёр өнцгөөс хийсэн дүн шинжилгээ нэгтгэгдэхэд илүү бодитой, иж бүрэн зөвлөгөө гарна." },
    { q: "Хувийн мэдээлэл хэрхэн хадгалагддаг вэ?", a: "Ямар нэг хувийн мэдээлэл огт хадгалагдахгүй." },
  ];

  const whyItems = [
    { icon: "🤖", t: "AI дүн шинжилгээ", d: "Хиймэл оюун ухаан чиний хариултуудыг гүнзгий шинжлэж, хувийн зөвлөгөө өгнө." },
    { icon: "⚡", t: "Шуурхай хариу", d: "Төлбөр төлмөгц зөвлөгөө шууд бэлэн болно. Хүлээх шаардлагагүй." },
    { icon: "🔒", t: "Мэдээлэл аюулгүй", d: "Зөвхөн имэйл хаяг авна. Нэр, утасны дугаар гэх мэт хувийн мэдээлэл цуглуулдаггүй." },
    { icon: "📊", t: "Дэлгэрэнгүй тайлан", d: "Яагаад тохирох, ур чадвар, дараагийн алхам — бүгдийг нарийвчлан гаргана." },
    { icon: "📱", t: "Утснаас хялбар", d: "Нэг дэлгэц дээр нэг асуулт. Утсан дээр ч тухтайгаар бөглөнө." },
    { icon: "🎯", t: "Монголд зориулсан", d: "Монголын их дээд сургуулиудын мэргэжлүүдтэй уялдуулсан зөвлөгөө." },
  ];

  const bars = [
    { name: "Дижитал Маркетинг", pct: 93, cls: "from-[#6ee7b7] to-[#38bdf8]" },
    { name: "Бизнесийн Удирдлага", pct: 81, cls: "from-[#38bdf8] to-[#a78bfa]" },
    { name: "Олон Улсын Харилцаа", pct: 74, cls: "from-[#a78bfa] to-[#ec4899]" },
  ];

  return (
    <>
      {/* ── mesh bg ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute w-[700px] h-[700px] rounded-full opacity-20" style={{ background: "radial-gradient(circle,rgba(110,231,183,.4),transparent 70%)", top: -200, left: -200, animation: "drift1 18s ease-in-out infinite" }} />
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-20" style={{ background: "radial-gradient(circle,rgba(56,189,248,.35),transparent 70%)", bottom: -100, right: -150, animation: "drift2 22s ease-in-out infinite" }} />
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-15" style={{ background: "radial-gradient(circle,rgba(167,139,250,.3),transparent 70%)", top: "50%", left: "60%", animation: "drift3 26s ease-in-out infinite" }} />
      </div>
      <style>{`
        @keyframes drift1{0%,100%{transform:translate(0,0)}50%{transform:translate(60px,40px)}}
        @keyframes drift2{0%,100%{transform:translate(0,0)}50%{transform:translate(-40px,-60px)}}
        @keyframes drift3{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-50px)}}
      `}</style>

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 transition-all duration-300"
        style={{ height: 68, background: navSolid ? "rgba(6,8,15,.96)" : "rgba(6,8,15,.75)", backdropFilter: "blur(24px)", borderBottom: "1px solid var(--border)" }}>
        <span className="font-serif text-2xl tracking-tight">
          Hi <span style={{ color: "var(--accent)" }}>Future</span>
        </span>
        <Link href="/student-form"
          className="px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: "var(--accent)", color: "#06080f", boxShadow: "0 0 24px rgba(110,231,183,.25)" }}>
          Эхлэх
        </Link>
      </nav>

      <main className="relative z-10">

        {/* ── HERO ── */}
        <section className="min-h-screen flex items-center justify-center text-center px-5 pt-28 pb-20">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 flex justify-center" style={{ animation: "fadeUp .6s ease both" }}>
              <Badge>12-р ангийн сурагчдад зориулсан</Badge>
            </div>
            <h1 className="font-serif mb-6 leading-[1.08] tracking-tight"
              style={{ fontSize: "clamp(2.6rem,7vw,5rem)", animation: "fadeUp .7s ease .1s both" }}>
              12-р анги<br />
              төгсөж байна уу?<br />
              Мэргэжлээ сонгоход<br />
              <em className="italic" style={{ background: "linear-gradient(135deg,#6ee7b7,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>тусалъя.</em>
            </h1>
            <p className="mb-12 leading-relaxed mx-auto" style={{ fontSize: "clamp(1rem,2.2vw,1.18rem)", color: "var(--muted)", maxWidth: 540, animation: "fadeUp .7s ease .2s both" }}>
              20 минутын дотор чиний ур чадвар, зан чанар, сонирхолд тохирсон мэргэжлийн зөвлөгөөг имэйлээр аваарай. AI-д суурилсан дүн шинжилгээ.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-16" style={{ animation: "fadeUp .7s ease .3s both" }}>
              <Link href="/student-form"
                className="px-9 py-4 rounded-full font-bold text-base transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg,#6ee7b7,#38bdf8)", color: "#06080f", boxShadow: "0 0 32px rgba(110,231,183,.3)" }}>
                Форм бөглөж эхлэх →
              </Link>
              <a href="#how" className="px-8 py-4 rounded-full font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                style={{ border: "1px solid var(--border)" }}>
                Яаж ажилладаг?
              </a>
            </div>
            <div className="flex flex-wrap gap-10 justify-center pt-10" style={{ borderTop: "1px solid var(--border)", animation: "fadeUp .7s ease .4s both" }}>
              {[["20 мин", "Зарцуулах хугацаа"], ["10+", "Мэргэжлийн чиглэл"], ["100%", "Хувийн зөвлөгөө"]].map(([n, l]) => (
                <div key={l} className="text-center">
                  <div className="font-serif text-3xl" style={{ background: "linear-gradient(135deg,#6ee7b7,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{n}</div>
                  <div className="text-xs mt-1.5 tracking-wide" style={{ color: "var(--muted)" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,var(--border),transparent)" }} />

        {/* ── HOW ── */}
        <section id="how" className="py-24">
          <div className="max-w-5xl mx-auto px-5">
            <Reveal>
              <div className="text-center mb-14">
                <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "var(--accent)" }}>Яаж ажилладаг</p>
                <h2 className="font-serif text-4xl md:text-5xl mb-4">Ердөө 3 алхам</h2>
                <p className="text-base leading-relaxed mx-auto" style={{ color: "var(--muted)", maxWidth: 420 }}>Бүртгэл шаардлагагүй. Зөвхөн имэйл хаягаа оруулаад эхэл.</p>
              </div>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { n: "01", e: "📋", t: "Форм бөглө", d: "Дуртай хичээл, зан чанар, зорилгоо тухайлсан асуултуудад хариулна. Нэг дэлгэц — нэг асуулт. Хялбар, хурдан." },
                { n: "02", e: "💳", t: "Төлбөр төл", d: "QPay-р нэг удаагийн төлбөр төл. Аюулгүй, хурдан." },
                { n: "03", e: "📩", t: "Зөвлөгөө ав", d: "Төлбөр амжилттай болмогц дэлгэрэнгүй зөвлөгөө дэлгэц дээр гарч, таны имэйлд автоматаар илгээгдэнэ." },
              ].map((s, i) => (
                <Reveal key={s.n} delay={i * 100}>
                  <div className="rounded-2xl p-8 border group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                    <div className="absolute top-0 left-0 right-0 h-0.5 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                      style={{ background: "linear-gradient(90deg,#6ee7b7,#38bdf8)" }} />
                    <div className="font-serif text-6xl opacity-10 mb-5" style={{ color: "var(--accent)" }}>{s.n}</div>
                    <div className="text-3xl mb-3">{s.e}</div>
                    <div className="font-bold text-base mb-2">{s.t}</div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{s.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,var(--border),transparent)" }} />

        {/* ── FORMS ── */}
        <section id="forms" className="py-24">
          <div className="max-w-5xl mx-auto px-5">
            <Reveal>
              <div className="text-center mb-14">
                <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "var(--accent2)" }}>Формууд</p>
                <h2 className="font-serif text-4xl md:text-5xl mb-4">Аль форм танд тохирох вэ?</h2>
                <p className="text-base leading-relaxed mx-auto" style={{ color: "var(--muted)", maxWidth: 500 }}>Сурагч өөрөө бөглөх форм болон эцэг эх бөглөх форм — хоёулаа өөр өнцгөөс дүн шинжилгээ хийнэ.</p>
              </div>
            </Reveal>

            <div className="grid md:grid-cols-2 gap-5 mb-4">
              {/* student */}
              <Reveal>
                <div className="rounded-3xl p-10 border hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
                  style={{ background: "linear-gradient(145deg,rgba(110,231,183,.1),rgba(56,189,248,.06))", borderColor: "rgba(110,231,183,.22)" }}>
                  <div className="text-4xl mb-5">🎓</div>
                  <h3 className="font-serif text-2xl mb-3">Сурагчийн форм</h3>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--muted)" }}>Өөрийн сонирхол, ур чадвараа өөрөө үнэлж, тохирох мэргэжлийг олно.</p>
                  <ul className="flex flex-col gap-2 mb-8">
                    {["Дуртай болон дургүй хичээлүүд","Зан чанар, харилцааны хэв маяг","Ирээдүйн зорилго, сонирхол","Бие даан суралцах чадвар","Бүтээлч болон шинжилгээний хандлага"].map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "var(--muted)" }}>
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                          style={{ background: "rgba(110,231,183,.12)", color: "var(--accent)" }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <p className="font-serif text-3xl mb-1">₮5,000</p>
                  <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>нэг удаагийн төлбөр</p>
                  <Link href="/student-form"
                    className="block text-center py-3.5 rounded-full font-bold text-sm transition-all duration-200 hover:scale-[1.02]"
                    style={{ background: "var(--accent)", color: "#06080f", boxShadow: "0 0 24px rgba(110,231,183,.2)" }}>
                    Сурагчийн форм бөглөх →
                  </Link>
                </div>
              </Reveal>

              {/* parent */}
              <Reveal delay={100}>
                <div className="rounded-3xl p-10 border hover:-translate-y-1.5 transition-all duration-300"
                  style={{ background: "linear-gradient(145deg,rgba(167,139,250,.1),rgba(56,189,248,.06))", borderColor: "rgba(167,139,250,.22)" }}>
                  <div className="text-4xl mb-5">👨‍👩‍👦</div>
                  <h3 className="font-serif text-2xl mb-3">Эцэг эхийн форм</h3>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--muted)" }}>Хүүхдийнхээ зан чанарыг гаднаас нь харж, илүү бодитой дүн шинжилгээ хийнэ.</p>
                  <ul className="flex flex-col gap-2 mb-8">
                    {["Хүүхдийн хүчтэй болон сул талууд","Гэрт ажиглагдах ур чадварууд","Нийгмийн хандлага болон сэтгэл хөдлөл","Хариуцлага, дадал зуршил","Удирдах, бүтээх чадварын байдал"].map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "var(--muted)" }}>
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                          style={{ background: "rgba(167,139,250,.12)", color: "var(--accent3)" }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <p className="font-serif text-3xl mb-1">₮5,000</p>
                  <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>нэг удаагийн төлбөр</p>
                  <Link href="/parent-form"
                    className="block text-center py-3.5 rounded-full font-bold text-sm transition-all duration-200 hover:scale-[1.02]"
                    style={{ background: "var(--accent3)", color: "#06080f", boxShadow: "0 0 24px rgba(167,139,250,.2)" }}>
                    Эцэг эхийн форм бөглөх →
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* bundle */}
            <Reveal>
              <div className="rounded-2xl border p-7 flex flex-wrap items-center justify-between gap-5"
                style={{ background: "var(--surface2)", borderColor: "rgba(56,189,248,.25)" }}>
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-2"
                    style={{ background: "linear-gradient(135deg,#38bdf8,#a78bfa)" }}>✨ Хамгийн сайн сонголт</span>
                  <h3 className="font-bold text-lg mb-1">Хоёр формыг хамт авах</h3>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>Сурагч болон эцэг эх хоёулаа бөглөж, нэгтгэсэн дүн шинжилгээ авна.</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="font-serif text-3xl">₮8,000</p>
                  <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>₮5,000 хэмнэнэ</p>
                  <Link href="/bundle-form"
                    className="px-7 py-3 rounded-full font-bold text-sm text-white transition-all duration-200 hover:scale-[1.04]"
                    style={{ background: "linear-gradient(135deg,#38bdf8,#a78bfa)", boxShadow: "0 0 24px rgba(56,189,248,.25)" }}>
                    Bundle авах →
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,var(--border),transparent)" }} />

        {/* ── WHY ── */}
        <section className="py-24">
          <div className="max-w-5xl mx-auto px-5">
            <div className="grid md:grid-cols-2 gap-16 items-start">
              <div>
                <Reveal>
                  <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "var(--accent)" }}>Яагаад Hi Future?</p>
                  <h2 className="font-serif text-4xl md:text-5xl mb-5">Зөвхөн тест биш —<br /><em className="italic" style={{ color: "var(--accent2)" }}>жинхэнэ</em> зөвлөгөө</h2>
                  <p className="text-base leading-relaxed mb-8" style={{ color: "var(--muted)" }}>Монголын сурагчдад тохирсон, AI-д суурилсан гүнзгий дүн шинжилгээ.</p>
                </Reveal>
                <div className="grid grid-cols-2 gap-3">
                  {whyItems.map((w, i) => (
                    <Reveal key={w.t} delay={i * 80}>
                      <div className="rounded-2xl p-5 border hover:-translate-y-0.5 transition-all duration-300"
                        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                        <div className="text-2xl mb-3">{w.icon}</div>
                        <div className="font-bold text-sm mb-1.5">{w.t}</div>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{w.d}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>

              {/* visual */}
              <div ref={whyRef} className="rounded-3xl border p-7 relative overflow-hidden"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle,rgba(110,231,183,.1),transparent 70%)", transform: "translate(30%,-30%)" }} />
                <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: "var(--accent2)" }}>Үр дүнгийн жишээ</p>
                <div className="rounded-2xl border p-5 mb-5" style={{ background: "var(--bg)", borderColor: "rgba(110,231,183,.15)" }}>
                  <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>Топ мэргэжлийн тохирол</p>
                  {bars.map((b) => (
                    <div key={b.name} className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-semibold w-36 flex-shrink-0">{b.name}</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.06)" }}>
                        <div className={`h-full rounded-full bg-gradient-to-r ${b.cls} transition-all duration-1000`}
                          style={{ width: whyVisible ? `${b.pct}%` : "0%" }} />
                      </div>
                      <span className="text-xs font-bold w-8 text-right" style={{ color: "var(--accent)" }}>{b.pct}%</span>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {["Санаачлагч","Нийгэмч","Сониуч","Удирдагч"].map((t) => (
                      <span key={t} className="px-2.5 py-1 rounded-full text-xs font-semibold border"
                        style={{ background: "rgba(110,231,183,.08)", borderColor: "rgba(110,231,183,.2)", color: "var(--accent)" }}>{t}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border p-4" style={{ background: "var(--bg)", borderColor: "var(--border)" }}>
                  <p className="text-xs font-bold mb-3">Дараагийн алхмууд</p>
                  {["МУИС-ийн элсэлтийн шаардлагыг шалга","Coursera дээр үнэгүй курс эхэл","Startup event-д нэгд"].map((s, i) => (
                    <div key={s} className="flex items-center gap-2 mb-2 text-xs" style={{ color: "var(--muted)" }}>
                      <span className="w-4 h-4 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                        style={{ background: "linear-gradient(135deg,#6ee7b7,#38bdf8)", color: "#06080f", fontSize: 9 }}>{i + 1}</span>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,var(--border),transparent)" }} />

        {/* ── FAQ ── */}
        <section className="py-24">
          <div className="max-w-5xl mx-auto px-5">
            <div className="grid md:grid-cols-[280px_1fr] gap-16">
              <Reveal>
                <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "var(--accent3)" }}>Асуулт & Хариулт</p>
                <h2 className="font-serif text-4xl mb-4">Түгээмэл асуулт</h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>Нэмэлт асуулт байвал бидэнд хандаарай.</p>
              </Reveal>
              <Reveal delay={100}>
                <div className="flex flex-col gap-3">
                  {faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,var(--border),transparent)" }} />

        {/* ── CTA ── */}
        <section className="py-24">
          <div className="max-w-3xl mx-auto px-5">
            <Reveal>
              <div className="rounded-3xl border p-16 text-center relative overflow-hidden"
                style={{ background: "var(--surface)", borderColor: "rgba(110,231,183,.2)" }}>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at center,rgba(110,231,183,.05),transparent 70%)" }} />
                <h2 className="font-serif text-4xl md:text-5xl mb-4 relative">Өнөөдөр эхлэх нь<br />хамгийн тохиромжтой үе</h2>
                <p className="text-base leading-relaxed mb-10 mx-auto relative" style={{ color: "var(--muted)", maxWidth: 420 }}>
                  Элсэлтийн шалгалт ойртож байна. 20 минут зарцуулж, ирээдүйн чиглэлээ тодорхойл.
                </p>
                <div className="flex flex-wrap gap-3 justify-center relative">
                  <Link href="/student-form"
                    className="px-9 py-4 rounded-full font-bold text-base transition-all duration-200 hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg,#6ee7b7,#38bdf8)", color: "#06080f", boxShadow: "0 0 32px rgba(110,231,183,.3)" }}>
                    Сурагчийн форм бөглөх →
                  </Link>
                  <Link href="/parent-form"
                    className="px-8 py-4 rounded-full font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    style={{ border: "1px solid var(--border)" }}>
                    Эцэг эхийн форм →
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 flex flex-wrap items-center justify-between gap-4 px-8 py-8 border-t" style={{ borderColor: "var(--border)" }}>
        <span className="font-serif text-xl">Hi <span style={{ color: "var(--accent)" }}>Future</span></span>
        <span className="text-xs" style={{ color: "var(--muted)" }}>© 2025 Hi Future.</span>
        <div className="flex gap-5">
          {["Нууцлалын бодлого", "Үйлчилгээний нөхцөл"].map((l) => (
            <a key={l} href="#" className="text-xs transition-colors hover:text-[var(--accent)]" style={{ color: "var(--muted)" }}>{l}</a>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </>
  );
}
