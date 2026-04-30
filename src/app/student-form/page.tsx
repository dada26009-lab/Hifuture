import FormWizard from "@/components/form/FormWizard";
import { STUDENT_QUESTIONS } from "@/lib/questions";

export const metadata = { title: "Сурагчийн форм — Hi Future" };

export default function StudentFormPage() {
  return <FormWizard formType="student" questions={STUDENT_QUESTIONS} />;
}
