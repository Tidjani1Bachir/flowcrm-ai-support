import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => {
      return new Response(JSON.stringify(body), {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers ?? {}),
        },
      });
    },
  },
}));

import { POST } from "../app/api/leads/route";
import { prisma } from "../lib/prisma";
import { sendLeadNotification } from "../lib/resend";

class MockNextRequest extends Request {}

describe("POST /api/leads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 for valid lead data", async () => {
    vi.mocked(prisma.lead.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.lead.create).mockResolvedValueOnce({} as never);
    vi.mocked(prisma.lead.update).mockResolvedValueOnce({} as never);
    vi.mocked(sendLeadNotification).mockResolvedValueOnce({ success: true });

    const request = new MockNextRequest("http://localhost/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Alice",
        email: "alice@corp.com",
        company: "Corp",
        sessionId: "sess_1",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);

    const body = (await response.json()) as { success: boolean };
    expect(body.success).toBe(true);
  });

  it("returns 400 for invalid email", async () => {
    const request = new MockNextRequest("http://localhost/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Alice",
        email: "not-an-email",
        sessionId: "sess_1",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("returns 400 for missing name", async () => {
    const request = new MockNextRequest("http://localhost/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "alice@corp.com",
        sessionId: "sess_1",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("returns 200 with duplicate: true for existing email", async () => {
    vi.mocked(prisma.lead.findUnique).mockResolvedValueOnce({
      id: "lead_1",
      sessionId: "sess_1",
      name: "Alice",
      email: "alice@corp.com",
      company: "Corp",
      createdAt: new Date(),
      notified: false,
      session: {
        id: "sess_1",
        createdAt: new Date(),
        updatedAt: new Date(),
        messageCount: 1,
      },
    } as never);

    const request = new MockNextRequest("http://localhost/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Alice",
        email: "alice@corp.com",
        company: "Corp",
        sessionId: "sess_1",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);

    const body = (await response.json()) as { duplicate: boolean };
    expect(body.duplicate).toBe(true);
    expect(sendLeadNotification).not.toHaveBeenCalled();
  });

  it("returns 200 even if email sending fails", async () => {
    vi.mocked(prisma.lead.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.lead.create).mockResolvedValueOnce({} as never);
    vi.mocked(prisma.lead.update).mockResolvedValueOnce({} as never);
    vi.mocked(sendLeadNotification).mockResolvedValueOnce({ success: false });

    const request = new MockNextRequest("http://localhost/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Alice",
        email: "alice@corp.com",
        company: "Corp",
        sessionId: "sess_1",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });
});
