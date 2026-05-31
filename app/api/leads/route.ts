import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { z } from "zod";
import { sendLeadNotification } from "../../../lib/resend";
import type { ApiError, LeadData } from "../../../types";

const leadRequestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional().nullable(),
  sessionId: z.string().trim().min(1),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null);
    const parsed = leadRequestSchema.safeParse(payload);

    if (!parsed.success) {
      const error: ApiError = {
        error: "Invalid lead payload.",
        code: "INVALID_REQUEST",
      };

      return NextResponse.json(error, { status: 400 });
    }

    const lead: LeadData = {
      name: parsed.data.name,
      email: parsed.data.email,
      company: parsed.data.company ?? null,
    };

    let existingLead = null;

    try {
      existingLead = await prisma.lead.findUnique({
        where: { email: parsed.data.email },
      });
    } catch (error) {
      console.error("Failed to check for existing lead:", error);
    }

    if (!existingLead) {
      try {
        await prisma.lead.create({
          data: {
            sessionId: parsed.data.sessionId,
            name: lead.name,
            email: lead.email,
            company: lead.company,
            notified: false,
          },
        });
      } catch (error) {
        console.error("Failed to create lead:", error);
      }

      try {
        await prisma.lead.update({
          where: { email: lead.email },
          data: { notified: true },
        });
      } catch (error) {
        console.error("Failed to update lead notification flag:", error);
      }
    }

    try {
      await sendLeadNotification(lead, parsed.data.sessionId);
    } catch (error) {
      console.error("Failed to send lead notification:", error);
    }

    return NextResponse.json(
      {
        success: true,
        duplicate: Boolean(existingLead),
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 }
    );
  }
}