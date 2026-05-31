import { z } from "zod";
import { assertOpenAIConfig, openai } from "./openai";
import type { AgentResponse, ChatMessage, LeadData, LeadSubmission } from "../types/index.ts";

const LEAD_KEYWORDS = ["pricing", "price", "quote", "demo", "contact", "sales", "enterprise", "plan"];

const agentResponseSchema = z.object({
  message: z.string(),
  leadCaptured: z.boolean(),
  lead: z
    .object({
      name: z.string(),
      email: z.string(),
      company: z.string().nullable(),
    })
    .nullable(),
});

export const supportAgentPrompt = `
You are a helpful B2B SaaS support assistant for FlowCRM.
You help users understand our product, pricing, and features.
When a user expresses interest in a demo, trial, or wants to be contacted,
extract their name, email, and company from the conversation naturally.
Always be concise and professional.
If you detect contact information, include it in your response.
Always respond with valid JSON in this exact shape:
{
  "message": "your reply to the user",
  "leadCaptured": false,
  "lead": null
}
OR if lead detected:
{
  "message": "your reply",
  "leadCaptured": true,
  "lead": { "name": "...", "email": "...", "company": "..." }
}
`.trim();

export function shouldCollectLead(messages: ChatMessage[]) {
  const transcript = messages.map((message) => message.content).join(" ").toLowerCase();
  return LEAD_KEYWORDS.some((keyword) => transcript.includes(keyword));
}

export function buildConversationTranscript(messages: ChatMessage[]) {
  return messages.map((message) => `${message.role.toUpperCase()}: ${message.content}`).join("\n");
}

function getFallbackMessage(messages: ChatMessage[], needsLeadCapture: boolean) {
  if (needsLeadCapture) {
    return "I can help with that. Share your name, email, and company so I can connect you with the right person.";
  }

  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content || "";
  return lastUserMessage
    ? `Thanks. I have the request: ${lastUserMessage}. I can help further if you want me to break this down.`
    : "Thanks. Tell me a bit more and I will help you sort it out.";
}

function toAgentResponse(message: string, leadCaptured: boolean, lead: LeadData | null): AgentResponse {
  return {
    message,
    leadCaptured,
    lead,
  };
}

function createFallbackResponse(messages: ChatMessage[]): AgentResponse {
  const needsLeadCapture = shouldCollectLead(messages);
  return toAgentResponse(getFallbackMessage(messages, needsLeadCapture), false, null);
}

export async function buildAgentResponse(messages: ChatMessage[]): Promise<AgentResponse> {
  const fallbackResponse = createFallbackResponse(messages);

  console.log('Calling Groq with key:', process.env.GROQ_API_KEY ? 'EXISTS' : 'MISSING');

  try {
    assertOpenAIConfig();

    const completion = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: supportAgentPrompt },
        ...messages.map((message) => ({ role: message.role, content: message.content })),
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
      temperature: 0.3,
    });

    const rawText = completion.choices[0]?.message?.content?.trim() || "";

    try {
      const parsed = JSON.parse(rawText) as unknown;
      const validated = agentResponseSchema.parse(parsed);

      return toAgentResponse(validated.message, validated.leadCaptured, validated.lead);
    } catch (error) {
      console.error('GROQ API ERROR:', error);
      return toAgentResponse(rawText || fallbackResponse.message, false, null);
    }
  } catch (error) {
    console.error('GROQ API ERROR:', error);
    return fallbackResponse;
  }
}

export const agent = buildAgentResponse;

export function getFallbackReply(messages: ChatMessage[], needsLeadCapture: boolean) {
  return getFallbackMessage(messages, needsLeadCapture);
}

export function buildLeadNotificationMessage(lead: LeadSubmission) {
  const companyLine = lead.company ? `Company: ${lead.company}\n` : "";

  return [
    "A new lead was submitted from the AI support chatbot.",
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    companyLine.trimEnd(),
  ]
    .filter(Boolean)
    .join("\n");
}