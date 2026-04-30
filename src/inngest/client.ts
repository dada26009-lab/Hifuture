import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "hifuture",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
