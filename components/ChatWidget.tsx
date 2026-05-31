"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import LeadSuccessToast from "./LeadSuccessToast";
import type { AgentResponse, ChatMessage as ChatMessageType } from "../types/index.ts";

type Message = ChatMessageType & {
  id: string;
  timestamp: string;
};

const welcomeMessage: Message = {
  id: "welcome-message",
  role: "assistant",
  content: "Hi! 👋 I'm your FlowCRM support assistant. How can I help you today?",
  timestamp: new Date().toISOString(),
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [sessionId, setSessionId] = useState("");

  const messageListRef = useRef<HTMLDivElement | null>(null);
  const hasAddedWelcomeRef = useRef(false);

  useEffect(() => {
    setSessionId(crypto.randomUUID());
  }, []);

  useEffect(() => {
    if (!isOpen || hasAddedWelcomeRef.current) {
      return;
    }

    hasAddedWelcomeRef.current = true;
    setMessages((current) => (current.length > 0 ? current : [welcomeMessage]));
  }, [isOpen]);

  useEffect(() => {
    if (!messageListRef.current) {
      return;
    }

    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    if (!leadCaptured) {
      return;
    }

    const timer = window.setTimeout(() => setLeadCaptured(false), 4000);
    return () => window.clearTimeout(timer);
  }, [leadCaptured]);

  async function handleMessageSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = input.trim();

    if (!text || isLoading || !sessionId) {
      return;
    }

    const nextMessages: Message[] = [
      ...messages,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      },
    ];

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
          sessionId,
        }),
      });

      const data = (await response.json()) as Partial<AgentResponse> & {
        reply?: string;
        error?: string;
        leadCaptured?: boolean;
      };

      if (!response.ok) {
        throw new Error(data.error || "Chat request failed.");
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply || data.message || "I can help with that. Please share a little more detail.",
        timestamp: new Date().toISOString(),
      };

      setMessages((current) => [...current, assistantMessage]);
      if (data.leadCaptured) {
        setLeadCaptured(true);
      }
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I couldn't reach the assistant just now. Please try again in a moment, or send a bit more detail and I’ll help as best I can.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <span className="text-2xl leading-none">×</span>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2" aria-hidden="true">
            <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8A2.5 2.5 0 0 1 17.5 16H10l-4.5 4v-4.5A2.5 2.5 0 0 1 4 13.5v-8Z" />
          </svg>
        )}

        {!isOpen && messages.length > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
        ) : null}
      </button>

      <div
        className={`absolute bottom-20 right-0 w-[350px] overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 ease-out ${
          isOpen ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-4 scale-95 opacity-0"
        }`}
        style={{ height: 500 }}
        aria-hidden={!isOpen}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between bg-[#1a1a2e] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <h2 className="text-sm font-semibold">FlowCRM Support</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full px-2 py-1 text-lg leading-none text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Close chat window"
            >
              ×
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col bg-white">
            <div ref={messageListRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                />
              ))}

              {isLoading ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-slate-100 px-4 py-3">
                    <div className="flex items-center gap-1.5" aria-label="Typing indicator">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.2s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.1s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500" />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <form onSubmit={handleMessageSubmit} className="border-t border-slate-200 p-3">
              <label className="sr-only" htmlFor="chat-input">
                Type your message
              </label>
              <div className="flex items-end gap-2">
                <textarea
                  id="chat-input"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Type a message..."
                  className="min-h-12 max-h-28 flex-1 resize-none rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
                <button
                  type="submit"
                  disabled={isLoading || input.trim().length === 0}
                  className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Sending" : "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {leadCaptured ? <LeadSuccessToast open={leadCaptured} onClose={() => setLeadCaptured(false)} /> : null}
    </div>
  );
}