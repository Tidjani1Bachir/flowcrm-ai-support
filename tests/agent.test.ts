import { beforeEach, describe, expect, it, vi } from "vitest";
import { agent } from "../lib/agent";
import { openai } from "../lib/openai";

function mockOpenAIResponse(response: {
  message: string;
  leadCaptured: boolean;
  lead: { name: string; email: string; company: string | null } | null;
}) {
  return response;
}

function mockCompletionContent(payload: unknown) {
  return {
    choices: [
      {
        message: {
          content: typeof payload === "string" ? payload : JSON.stringify(payload),
        },
      },
    ],
  };
}

describe("AI Agent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a message for a basic product question", async () => {
    vi.mocked(openai.chat.completions.create).mockResolvedValueOnce(
      mockCompletionContent(
        mockOpenAIResponse({
          message: "FlowCRM starts at $29/mo",
          leadCaptured: false,
          lead: null,
        })
      ) as never
    );

    const response = await agent([{ role: "user", content: "What is the pricing?" }]);

    expect(response.message).toBeDefined();
    expect(response.leadCaptured).toBe(false);
    expect(response.lead).toBeNull();
  });

  it("detects lead when user provides email", async () => {
    vi.mocked(openai.chat.completions.create).mockResolvedValueOnce(
      mockCompletionContent(
        mockOpenAIResponse({
          message: "Thanks. I'll have someone reach out shortly.",
          leadCaptured: true,
          lead: {
            name: "Ava Johnson",
            email: "ava@example.com",
            company: "Acme Inc",
          },
        })
      ) as never
    );

    const response = await agent([
      { role: "user", content: "I want a demo. My email is ava@example.com" },
    ]);

    expect(response.leadCaptured).toBe(true);
    expect(response.lead?.email).toBe("ava@example.com");
  });

  it("handles malformed JSON from OpenAI gracefully", async () => {
    vi.mocked(openai.chat.completions.create).mockResolvedValueOnce(
      mockCompletionContent("{ malformed json") as never
    );

    await expect(agent([{ role: "user", content: "Tell me more" }])).resolves.toMatchObject({
      leadCaptured: false,
    });

    const response = await agent([{ role: "user", content: "Tell me more" }]);

    expect(response.leadCaptured).toBe(false);
    expect(response.message).toEqual(expect.any(String));
    expect(response.message.length).toBeGreaterThan(0);
  });

  it("does not capture lead without email in conversation", async () => {
    vi.mocked(openai.chat.completions.create).mockResolvedValueOnce(
      mockCompletionContent(
        mockOpenAIResponse({
          message: "I can help with product details.",
          leadCaptured: false,
          lead: null,
        })
      ) as never
    );

    const response = await agent([{ role: "user", content: "Can I get a demo?" }]);

    expect(response.leadCaptured).toBe(false);
  });

  it("handles OpenAI API error gracefully", async () => {
    vi.mocked(openai.chat.completions.create).mockRejectedValueOnce(new Error("OpenAI API error"));

    await expect(agent([{ role: "user", content: "Hello" }])).resolves.toMatchObject({
      leadCaptured: false,
    });
  });
});
