// ─────────────────────────────────────────────
// QPay интеграц
// TODO: QPay-тай гэрээ байгуулсны дараа
//   QPAY_USERNAME, QPAY_PASSWORD, QPAY_INVOICE_CODE
//   env-д тохируулна.
// Официал docs: https://docs.qpay.mn
// ─────────────────────────────────────────────

export interface QPayInvoice {
  invoiceId: string;
  qrCode: string;       // base64 PNG
  qrText: string;
  urls: { name: string; description: string; logo: string; link: string }[];
}

export interface QPayCheckResult {
  paid: boolean;
  paidAmount?: number;
}

// ── Token cache ──
let _token: string | null = null;
let _tokenExpiry = 0;

async function getToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpiry) return _token;

  const base = process.env.QPAY_BASE_URL ?? "https://merchant.qpay.mn/v2";
  const res = await fetch(`${base}/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(
        `${process.env.QPAY_USERNAME}:${process.env.QPAY_PASSWORD}`
      ).toString("base64")}`,
    },
  });
  if (!res.ok) throw new Error("QPay auth failed");
  const data = await res.json();
  _token = data.access_token as string;
  _tokenExpiry = Date.now() + 50 * 60 * 1000; // 50 min
  return _token;
}

export async function createInvoice(
  submissionId: string,
  amount: number,
  description: string
): Promise<QPayInvoice> {
  const isStub =
    !process.env.QPAY_USERNAME ||
    process.env.QPAY_USERNAME === "REPLACE_ME";

  // ── STUB MODE ──
  if (isStub) {
    return {
      invoiceId: `STUB-${submissionId}`,
      qrCode:    "",
      qrText:    "QPay stub mode — тохиргоо хийгдээгүй",
      urls:      [],
    };
  }

  // ── REAL MODE ──
  const token = await getToken();
  const base  = process.env.QPAY_BASE_URL ?? "https://merchant.qpay.mn/v2";

  const res = await fetch(`${base}/invoice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      invoice_code:        process.env.QPAY_INVOICE_CODE,
      sender_invoice_no:   submissionId,
      invoice_receiver_code: "terminal",
      invoice_description: description,
      amount,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback`,
    }),
  });

  if (!res.ok) throw new Error(`QPay invoice error: ${res.status}`);
  const data = await res.json();

  return {
    invoiceId: data.invoice_id,
    qrCode:    data.qr_image,
    qrText:    data.qr_text,
    urls:      data.urls ?? [],
  };
}

export async function checkPayment(invoiceId: string): Promise<QPayCheckResult> {
  if (invoiceId.startsWith("STUB-")) {
    // stub: always return unpaid (manual confirm needed)
    return { paid: false };
  }

  const token = await getToken();
  const base  = process.env.QPAY_BASE_URL ?? "https://merchant.qpay.mn/v2";

  const res = await fetch(`${base}/payment/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ object_type: "INVOICE", object_id: invoiceId }),
  });

  if (!res.ok) return { paid: false };
  const data = await res.json();

  const paid = data.count > 0 && data.rows?.[0]?.payment_status === "PAID";
  return { paid, paidAmount: paid ? data.rows[0].payment_amount : undefined };
}
