import { z } from "zod";

export const OutreachDraftSchema = z.object({
  draft: z.string(),
  subject: z.string().optional(),
});

export type OutreachDraftAi = z.infer<typeof OutreachDraftSchema>;

export function buildOutreachDraftPrompt(input: {
  contactName: string;
  contactTitle: string | null;
  companyName: string | null;
  connectionDegree: string; // first | second | cold
  channel: string; // linkedin | email | other
  opportunityTitle: string | null;
  contextNote: string | null;
  priorOutreachSummaries: string[];
}): string {
  const {
    contactName,
    contactTitle,
    companyName,
    connectionDegree,
    channel,
    opportunityTitle,
    contextNote,
    priorOutreachSummaries,
  } = input;

  const isEmail = channel === "email";
  const isLinkedIn = channel === "linkedin";
  const isFirstDegree = connectionDegree === "first";
  const isSecondDegree = connectionDegree === "second";
  const isCold = connectionDegree === "cold";

  const connectionContext = isFirstDegree
    ? "You already know this person (1st-degree connection)."
    : isSecondDegree
    ? "You share mutual connections (2nd-degree)."
    : "This is a cold outreach — no prior relationship.";

  const purposeContext = opportunityTitle
    ? `The goal is to open a conversation about the "${opportunityTitle}" role or team at ${companyName ?? "this company"}.`
    : `The goal is to open a relationship-building conversation${companyName ? ` with someone at ${companyName}` : ""}.`;

  const historyContext =
    priorOutreachSummaries.length > 0
      ? `Prior messages to this person:\n${priorOutreachSummaries.map((s, i) => `${i + 1}. ${s}`).join("\n")}\nThis draft should be a natural follow-up or re-engagement, not a repeat.`
      : "";

  const channelInstruction = isLinkedIn
    ? "Channel: LinkedIn. Maximum 300 characters for a connection request note, or 3 short paragraphs for a message. Be concise and human."
    : isEmail
    ? "Channel: Email. Include a brief subject line. Keep the body to 150–220 words maximum."
    : "Channel: Other (e.g. Twitter DM or introduction note). Be brief and human.";

  const extraContext = contextNote ? `Additional context from the user:\n${contextNote}` : "";

  const schemaInstruction = isEmail
    ? `Return ONLY valid JSON:\n{ "draft": string, "subject": string }`
    : `Return ONLY valid JSON:\n{ "draft": string }`;

  return `Write an outreach message draft for the candidate to send to a professional contact.

Recipient: ${contactName}${contactTitle ? `, ${contactTitle}` : ""}${companyName ? ` at ${companyName}` : ""}
${connectionContext}
${purposeContext}
${channelInstruction}
${historyContext ? `\n${historyContext}` : ""}
${extraContext ? `\n${extraContext}` : ""}

Rules:
- First-person, from the candidate's perspective, using their positioning context (in system context)
- No hollow openers ("I hope this message finds you well", "I came across your profile")
- Specific: reference the company, role, or a real reason for reaching out
- Warm but not sycophantic; confident but not presumptuous
- For cold outreach, earn the ask — give before you get
- Do not hallucinate facts about the recipient

${schemaInstruction}`;
}
