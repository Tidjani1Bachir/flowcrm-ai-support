import "@testing-library/jest-dom";
import { vi } from "vitest";

const mockPrismaClient = {
  chatSession: {
    upsert: vi.fn(),
  },
  message: {
    create: vi.fn(),
  },
  lead: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

const mockOpenAIClient = {
  chat: {
    completions: {
      create: vi.fn(),
    },
  },
};

const mockResendClient = {
  emails: {
    send: vi.fn(),
  },
};

vi.mock("../lib/prisma", () => ({
  prisma: mockPrismaClient,
}));

vi.mock("../lib/openai", () => ({
  openai: mockOpenAIClient,
  assertOpenAIConfig: vi.fn(),
}));

vi.mock("../lib/resend", () => ({
  resend: mockResendClient,
  sendLeadNotification: vi.fn(),
}));

export { mockOpenAIClient, mockPrismaClient, mockResendClient };