import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export function assertOpenAIConfig() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY. Set it in your environment before using the Groq/OpenAI-compatible client.");
  }
}