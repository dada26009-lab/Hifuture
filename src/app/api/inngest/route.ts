import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { generateResultFn } from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateResultFn],
});