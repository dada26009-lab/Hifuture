import nodemailer from "nodemailer";
import type { ResultData, FormType } from "@/types";

function createTransport() {
  console.log("EMAIL CONFIG:", process.env.GMAIL_USER, "PASS:", process.env.GMAIL_PASS?.slice(0, 4));
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
}

const FORM_LABEL: Record<FormType, string> = {
  student: "Сурагчийн форм",
  parent:  "Эцэг эхийн форм",
};

export async function sendResultEmail(
  to: string,
  formType: FormType,
  result: ResultData
): Promise<void> {
  console.log("SENDING EMAIL TO:", to);

  const transporter = createTransport();
  const label = FORM_LABEL[formType];

  const majorRows = result.majors
    .map(
      (m) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #1e293b;">
          <strong style="color:#6ee7b7;">#${m.rank} ${m.name}</strong><br/>
          <span style="color:#94a3b8;font-size:13px;">${m.universities.join(", ")} · Тохирол ${m.match}%</span><br/>
          <span style="color:#cbd5e1;font-size:13px;margin-top:4px;display:block;">${m.why}</span>
        </td>
      </tr>`
    )
    .join("");

  const strengthItems = result.strengths
    .map((s) => `<li style="margin-bottom:8px;color:#cbd5e1;">${s.icon} <strong>${s.name}</strong> — ${s.desc}</li>`)
    .join("");

  const stepItems = result.next_steps
    .map((s, i) => `<li style="margin-bottom:8px;color:#cbd5e1;">${i + 1}. ${s}</li>`)
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="background:#06080f;margin:0;padding:0;font-family:'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">

    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:28px;color:#f0f4ff;margin:0;">Hi Future</h1>
      <p style="color:#94a3b8;margin:8px 0 0;">Таны мэргэжлийн зөвлөгөө бэлэн боллоо</p>
    </div>

    <div style="background:#111624;border:1px solid rgba(110,231,183,0.15);border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <span style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#6ee7b7;">📋 ${label}</span>
    </div>

    <div style="background:#111624;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:#6ee7b7;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 10px;">Ерөнхий дүгнэлт</p>
      <p style="color:#cbd5e1;line-height:1.7;margin:0;">${result.summary}</p>
    </div>

    <div style="background:#111624;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:#38bdf8;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 14px;">Топ 3 мэргэжлийн чиглэл</p>
      <table width="100%" cellpadding="0" cellspacing="0">${majorRows}</table>
    </div>

    <div style="background:#111624;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:#6ee7b7;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 12px;">Таны хүч чадлууд</p>
      <ul style="margin:0;padding-left:0;list-style:none;">${strengthItems}</ul>
    </div>

    <div style="background:#111624;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:#a78bfa;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 12px;">Дараагийн алхмууд</p>
      <ul style="margin:0;padding-left:0;list-style:none;">${stepItems}</ul>
    </div>

    <div style="background:rgba(148,163,184,0.05);border:1px solid rgba(148,163,184,0.1);border-radius:10px;padding:14px 18px;margin-bottom:32px;">
      <p style="color:#64748b;font-size:12px;line-height:1.6;margin:0;">
        Энэ зөвлөгөө таны хариултад суурилсан чиглүүлэх зөвлөмж бөгөөд эцсийн шийдвэр биш. Эцэг эх, багш, зөвлөхтэйгөө нэмэлтээр ярилцахыг зөвлөж байна.
      </p>
    </div>

    <p style="text-align:center;color:#334155;font-size:12px;">© 2025 Hi Future</p>
  </div>
</body>
</html>`;

  try {
    const info = await transporter.sendMail({
      from: `"Hi Future" <${process.env.GMAIL_USER}>`,
      to,
      subject: `Hi Future — Таны мэргэжлийн зөвлөгөө бэлэн боллоо`,
      html,
    });
    console.log("EMAIL SENT SUCCESS:", info.messageId);
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    throw err;
  }
}