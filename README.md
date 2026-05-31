# FlowCRM AI Support

[![Next.js 14](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)](https://neon.tech)
[![Prisma](https://img.shields.io/badge/Prisma-v7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Groq](https://img.shields.io/badge/Groq-llama--3.1--8b--instant-FF6B00)](https://groq.com)
[![Resend](https://img.shields.io/badge/Resend-Email-000000?logo=resend&logoColor=white)](https://resend.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-11%20Tests%20Passing-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Testsprite](https://img.shields.io/badge/Testsprite-E2E-111827)](https://testsprite.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Live-black?logo=vercel&logoColor=white)](https://vercel.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> A production-grade B2B AI support chatbot with autonomous lead detection, PostgreSQL persistence, and email automation — built as a full-stack portfolio project demonstrating LLM integration, agentic AI patterns, and end-to-end testing.

**Live Demo:** [flowcrm-ai-support.vercel.app](https://flowcrm-ai-support.vercel.app) &nbsp;|&nbsp; **GitHub:** [Tidjani1Bachir/flowcrm-ai-support](https://github.com/Tidjani1Bachir/flowcrm-ai-support)

---

## Why This Project Exists

Most AI chatbot demos are toy examples. This one is built the way a senior engineer would build it for a real B2B SaaS product:

- **Agentic AI pattern** — the model detects intent and extracts structured lead data autonomously
- **Persistent conversations** — every message is stored in PostgreSQL with proper relational schema
- **Production error handling** — every API route has try/catch, Zod validation, and idempotent operations
- **Full test coverage** — 11 unit tests (Vitest) + E2E tests (Testsprite), all passing

---

## Features

- 🤖 **AI-powered responses** using Groq llama-3.1-8b-instant (OpenAI-compatible API)
- 🎯 **Autonomous lead detection** — extracts name, email, company from natural conversation
- 🗄️ **PostgreSQL persistence** — sessions, messages, and leads stored with Prisma ORM
- 📧 **Email automation** — Resend API sends HTML notification emails on lead capture
- 🔒 **Input validation** — Zod schemas on every API route
- 🚦 **Rate limiting** — session-based message limits enforced via database
- ♻️ **Idempotent lead capture** — duplicate detection prevents double submissions
- 🧪 **11 unit tests** — agent logic, API validation, all passing with Vitest
- 🎭 **E2E tested** — chat widget interactions tested with Testsprite
- 🚀 **One-click deploy** — Vercel + Neon PostgreSQL, zero DevOps

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                         │
│              Floating Chat Widget (React)               │
└───────────────────────┬─────────────────────────────────┘
                        │ POST /api/chat
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js 14 App Router (API Routes)         │
│                                                         │
│  Zod Validation → Rate Limit Check → Groq AI Agent      │
│       ↓                                    ↓            │
│  Structured JSON ←── llama-3.1-8b-instant ──┘           │
│       ↓                                                 │
│  Lead Detected? → POST /api/leads → Resend Email        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│           PostgreSQL (Neon) via Prisma ORM              │
│                                                         │
│   ChatSession ──< Message                               │
│   ChatSession ──< Lead                                  │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack & Decisions

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 App Router | Frontend + API in one repo, one deploy |
| Language | TypeScript (strict) | Type safety across full stack |
| Database | PostgreSQL (Neon) | Relational, free tier, Vercel-native |
| ORM | Prisma v7 | Type-safe queries, auto-migrations |
| AI | Groq llama-3.1-8b-instant | Fast, free, OpenAI-compatible API |
| Email | Resend | Best DX for transactional email in Next.js |
| Validation | Zod | Runtime type safety on all API inputs |
| Unit Tests | Vitest | Faster than Jest, native ESM |
| E2E Tests | Testsprite | AI-powered E2E, minimal config |
| Styling | Tailwind CSS | Utility-first, no design system needed |
| Deploy | Vercel | Zero-config Next.js deployment |
| Backend | None (no Express/NestJS) | Next.js API routes sufficient at this scale |

---

## Database Schema

```prisma
model ChatSession {
  id           String    @id @default(cuid())
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  messageCount Int       @default(0)
  messages     Message[]
  lead         Lead?
}

model Message {
  id        String      @id @default(cuid())
  sessionId String
  role      MessageRole  // USER | ASSISTANT
  content   String      @db.Text
  createdAt DateTime    @default(now())
  session   ChatSession @relation(...)
  @@index([sessionId])
}

model Lead {
  id        String      @id @default(cuid())
  sessionId String      @unique
  name      String
  email     String      @unique
  company   String?
  notified  Boolean     @default(false)
  createdAt DateTime    @default(now())
  session   ChatSession @relation(...)
  @@index([email])
}
```

---

## API Endpoints

### `POST /api/chat`

Accepts a conversation history and returns an AI reply with lead detection.

```json
// Request
{
  "messages": [{ "role": "user", "content": "I want a demo. I'm John from Acme, john@acme.com" }],
  "sessionId": "uuid-here"
}

// Response
{
  "reply": "I'd be happy to schedule a demo for you...",
  "leadCaptured": true
}
```

### `POST /api/leads`

Captures a qualified lead and sends an email notification.

```json
// Request
{ "name": "John", "email": "john@acme.com", "company": "Acme", "sessionId": "uuid" }

// Response
{ "success": true, "duplicate": false }
```

---

## Open Source Contributions (Author)

This project was built by **Tidjani Bachir**, a Full-Stack Developer with merged open-source PRs in:
- **freeCodeCamp** — fixed privacy save button state bug, 9/9 tests passing
- **Mongoose ODM** — identified and fixed missing TypeScript type exports (958 assertions across 39 files)
- **express-mongo-sanitize** — fixed Express v5 compatibility issues

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A [Neon](https://neon.tech) account (free)
- A [Groq](https://console.groq.com) account (free, no credit card)
- A [Resend](https://resend.com) account (free)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Tidjani1Bachir/flowcrm-ai-support.git
cd flowcrm-ai-support

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your keys (see Environment Variables section)

# 4. Set up the database
npx prisma migrate dev --name init
npx prisma generate

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Environment Variables

| Variable | Description | Where to get it |
|---|---|---|
| `GROQ_API_KEY` | Groq AI API key | [console.groq.com](https://console.groq.com) |
| `RESEND_API_KEY` | Resend email API key | [resend.com](https://resend.com) |
| `LEAD_NOTIFICATION_EMAIL` | Email to receive lead notifications | Your email |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL | `http://localhost:3000` in dev |
| `DATABASE_URL` | Neon PostgreSQL connection string | [neon.tech](https://neon.tech) |
| `DIRECT_URL` | Same as DATABASE_URL for Prisma migrations | Same as above |

---

## Testing

### Unit Tests (Vitest)

```bash
npx vitest run --reporter=verbose
```

```
✓ tests/agent.test.ts > AI Agent > returns a message for a basic product question
✓ tests/agent.test.ts > AI Agent > detects lead when user provides email
✓ tests/agent.test.ts > AI Agent > handles malformed JSON from OpenAI gracefully
✓ tests/agent.test.ts > AI Agent > does not capture lead without email in conversation
✓ tests/agent.test.ts > AI Agent > handles OpenAI API error gracefully
✓ tests/leads-api.test.ts > POST /api/leads > returns 200 for valid lead data
✓ tests/leads-api.test.ts > POST /api/leads > returns 400 for invalid email
✓ tests/leads-api.test.ts > POST /api/leads > returns 400 for missing name
✓ tests/leads-api.test.ts > POST /api/leads > returns 200 with duplicate: true
✓ tests/leads-api.test.ts > POST /api/leads > returns 200 even if email sending fails
✓ tests/e2e/chatbot.spec.ts > chatbot e2e scaffold > renders the chat widget shell

Test Files  3 passed (3)
     Tests  11 passed (11)
```

### E2E Tests (Testsprite)

```bash
npm run dev        # Terminal 1
npx testsprite run tests/e2e/   # Terminal 2
```

---

## Deployment

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Deploy — Prisma generates automatically via `postinstall`

### `vercel.json`

```json
{
  "buildCommand": "prisma generate && next build"
}
```

---

## Project Structure

```
flowcrm-ai-support/
├── app/
│   ├── api/
│   │   ├── chat/route.ts        ← AI chat endpoint
│   │   └── leads/route.ts       ← Lead capture endpoint
│   ├── page.tsx                 ← Demo landing page
│   └── layout.tsx
├── components/
│   ├── ChatWidget.tsx           ← Floating chat UI
│   ├── ChatMessage.tsx          ← Message bubble
│   └── LeadSuccessToast.tsx     ← Lead captured notification
├── lib/
│   ├── prisma.ts                ← Prisma singleton
│   ├── openai.ts                ← Groq/OpenAI client
│   ├── resend.ts                ← Email client
│   └── agent.ts                 ← AI Agent logic
├── prisma/
│   └── schema.prisma            ← Database schema
├── tests/
│   ├── agent.test.ts            ← Agent unit tests
│   ├── leads-api.test.ts        ← API route tests
│   └── e2e/chatbot.spec.ts      ← Testsprite E2E tests
└── types/index.ts               ← Shared TypeScript types
```

---

## License

MIT © [Tidjani Bachir](https://github.com/Tidjani1Bachir)