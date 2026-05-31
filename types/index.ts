import { z } from "zod";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LeadData {
  name: string;
  email: string;
  company: string | null;
}

export interface AgentResponse {
  message: string;
  leadCaptured: boolean;
  lead: LeadData | null;
}

export interface ChatRequestBody {
  messages: ChatMessage[];
  sessionId: string;
}

export interface LeadRequestBody {
  name: string;
  email: string;
  company: string | null;
  sessionId: string;
}

export interface ApiError {
  error: string;
  code: string;
}

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
});

export const chatResponseSchema = z.object({
  reply: z.string(),
  shouldCollectLead: z.boolean(),
});

export const leadSubmissionSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional().default(""),
  message: z.string().min(1),
});

export type ChatRequest = ChatRequestBody;
export type ChatResponse = AgentResponse;
export type LeadSubmission = LeadRequestBody;