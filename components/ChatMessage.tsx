import type { ChatMessage as ChatMessageType } from "../types/index.ts";

type ChatMessageProps = ChatMessageType & {
  timestamp: string;
};

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date
    .toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(/\u200e/g, "");
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[75%] ${
          isUser
            ? "rounded-br-md bg-blue-600 text-white"
            : "rounded-bl-md bg-slate-100 text-slate-700"
        }`}
      >
        <p>{content}</p>
        <p className={`mt-2 text-[11px] ${isUser ? "text-blue-100" : "text-slate-500"}`}>
          {formatTimestamp(timestamp)}
        </p>
      </div>
    </div>
  );
}