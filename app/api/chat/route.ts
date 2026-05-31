import { NextResponse } from "next/server";
import { MessageRole } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { agent } from "../../../lib/agent";
import { z } from "zod";
import type { ApiError, AgentResponse, LeadData } from "../../../types";
import { chatMessageSchema } from "../../../types";

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
  sessionId: z.string().trim().min(1),
});

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  console.log('GROQ KEY:', process.env.GROQ_API_KEY ? 'EXISTS' : 'MISSING')
  console.log('DB URL:', process.env.DATABASE_URL ? 'EXISTS' : 'MISSING')
  try {
    const payload = await request.json().catch(() => null);
    const parsed = chatRequestSchema.safeParse(payload);

    if (!parsed.success) {
      const error: ApiError = {
        error: "Invalid chat payload.",
        code: "INVALID_REQUEST",
      };

      return jsonResponse(error, 400);
    }

    const { messages, sessionId } = parsed.data;

    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");

    if (!latestUserMessage) {
      const error: ApiError = {
        error: "At least one user message is required.",
        code: "INVALID_REQUEST",
      };

      return jsonResponse(error, 400);
    }

    try {
      const session = await prisma.chatSession.upsert({
        where: { id: sessionId },
        update: {
          messageCount: {
            increment: 1,
          },
        },
        create: {
          id: sessionId,
          messageCount: 1,
        },
      });

      if (session.messageCount > 20) {
        const error: ApiError = {
          error: "Session limit reached. Please start a new conversation.",
          code: "SESSION_LIMIT_REACHED",
        };

        return jsonResponse(error, 429);
      }
    } catch (error) {
      console.error("Failed to persist chat session:", error);
    }

    try {
      await prisma.message.create({
        data: {
          sessionId,
          role: MessageRole.USER,
          content: latestUserMessage.content,
        },
      });
    } catch (error) {
      console.error("Failed to persist user message:", error);
    }

    const agentResponse: AgentResponse = await agent(messages);

    try {
      await prisma.message.create({
        data: {
          sessionId,
          role: MessageRole.ASSISTANT,
          content: agentResponse.message,
        },
      });
    } catch (error) {
      console.error("Failed to persist assistant message:", error);
    }

    if (agentResponse.leadCaptured && agentResponse.lead) {
      try {
        const existingLead = await prisma.lead.findUnique({
          where: { sessionId },
        });

        if (!existingLead) {
          const leadData: LeadData = agentResponse.lead;
          const leadsUrl = new URL("/api/leads", request.url).toString();
          const leadNotificationResponse = await fetch(leadsUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...leadData,
              sessionId,
            }),
          });

          if (!leadNotificationResponse.ok) {
            throw new Error("Lead notification request failed.");
          }
        }
      } catch (error) {
        console.error("Failed to process lead notification:", error);
      }
    }

    return jsonResponse(
      {
        reply: agentResponse.message,
        leadCaptured: agentResponse.leadCaptured,
      },
      200
    );
  } catch {
    const error: ApiError = {
      error: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    };

    return jsonResponse(error, 500);
  }
}