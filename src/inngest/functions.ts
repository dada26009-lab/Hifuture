import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { findById, updateField } from "@/lib/storage";
import { generateResult } from "@/lib/claude";
import { sendResultEmail } from "@/lib/email";

export const generateResultFn = inngest.createFunction(
  {
    id: "generate-result",
    retries: 3,
    triggers: [{ event: "hifuture/result.generate" }],
  },
  async ({ event, step }) => {
    const { submissionId } = event.data as { submissionId: string };

    const sub = await step.run("get-submission", () => findById(submissionId));

    if (!sub) throw new NonRetriableError(`Submission ${submissionId} олдсонгүй`);
    if (sub.result) return { already: true };

    const result = await step.run("generate-with-claude", () => {
      const answers = Array.isArray(sub.answers) ? sub.answers : [];
      return generateResult(sub.formType, answers);
    });

    await step.run("save-result", () => updateField(submissionId, "result", result));

    await step.run("send-email", async () => {
      await sendResultEmail(sub.email, sub.formType, result);
      await updateField(submissionId, "emailStatus", "sent");
    });

    return { success: true, submissionId };
  }
);