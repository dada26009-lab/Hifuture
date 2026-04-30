import FormWizard from "@/components/form/FormWizard";
import { PARENT_QUESTIONS } from "@/lib/questions";

export const metadata = { title: "Эцэг эхийн форм — Hi Future" };

export default function ParentFormPage() {
  return <FormWizard formType="parent" questions={PARENT_QUESTIONS} />;
}
