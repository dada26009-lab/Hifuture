export type FormType = "student" | "parent";
export type PaymentStatus = "pending" | "paid" | "failed";
export type EmailStatus = "pending" | "sent" | "failed";

export interface Answer {
  questionId: string;
  question: string;
  answer: string | string[];
}

export interface Submission {
  id: string;
  formType: FormType;
  email: string;
  answers: Answer[];
  paymentStatus: PaymentStatus;
  paymentRef: string | null;
  paymentAmount: number;
  result: ResultData | null;
  emailStatus: EmailStatus;
  createdAt: string;
  updatedAt: string;
  adminNote: string;
}

export interface ResultData {
  summary: string;
  majors: {
    rank: number;
    name: string;
    match: number;
    universities: string[];
    why: string;
  }[];
  strengths: { icon: string; name: string; desc: string }[];
  cautions: string[];
  next_steps: string[];
}

export interface AdminStats {
  totalSubmissions: number;
  paidSubmissions: number;
  unpaidSubmissions: number;
  studentForms: number;
  parentForms: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  totalRevenue: number;
  emailSentCount: number;
  emailFailedCount: number;
}
