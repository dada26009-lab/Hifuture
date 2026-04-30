import { createClient } from "@supabase/supabase-js";
import type { Submission } from "@/types";

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

function toRow(s: Submission) {
  return {
    id:             s.id,
    form_type:      s.formType,
    email:          s.email,
    answers:        s.answers,
    payment_status: s.paymentStatus,
    payment_ref:    s.paymentRef,
    payment_amount: s.paymentAmount,
    result:         s.result,
    email_status:   s.emailStatus,
    admin_note:     s.adminNote,
    created_at:     s.createdAt,
    updated_at:     s.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): Submission {
  return {
    id:            row.id,
    formType:      row.form_type,
    email:         row.email,
    answers:       row.answers ?? [],
    paymentStatus: row.payment_status,
    paymentRef:    row.payment_ref,
    paymentAmount: row.payment_amount,
    result:        row.result,
    emailStatus:   row.email_status,
    adminNote:     row.admin_note ?? "",
    createdAt:     row.created_at,
    updatedAt:     row.updated_at,
  };
}

export async function readAll(): Promise<Submission[]> {
  const { data, error } = await getClient()
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("[storage.readAll]", error); return []; }
  return (data ?? []).map(fromRow);
}

export async function findById(id: string): Promise<Submission | undefined> {
  const { data, error } = await getClient()
    .from("submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[storage.findById]", error);
    return undefined;
  }
  return data ? fromRow(data) : undefined;
}

export async function upsert(submission: Submission): Promise<void> {
  const { error } = await getClient()
    .from("submissions")
    .upsert(toRow(submission));
  if (error) console.error("[storage.upsert]", error);
}

export async function updateField<K extends keyof Submission>(
  id: string,
  field: K,
  value: Submission[K]
): Promise<Submission | null> {
  const colMap: Record<string, string> = {
    formType:      "form_type",
    email:         "email",
    answers:       "answers",
    paymentStatus: "payment_status",
    paymentRef:    "payment_ref",
    paymentAmount: "payment_amount",
    result:        "result",
    emailStatus:   "email_status",
    adminNote:     "admin_note",
    createdAt:     "created_at",
    updatedAt:     "updated_at",
  };
  const col = colMap[field as string] ?? field as string;
  const { data, error } = await getClient()
    .from("submissions")
    .update({ [col]: value, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) { console.error("[storage.updateField]", error); return null; }
  return data ? fromRow(data) : null;
}