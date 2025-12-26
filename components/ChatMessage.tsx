// ============================================
// Chat Message Component
// ============================================

"use client";

import { User } from "lucide-react";
import { Message } from "@/lib/types";
import { clsx } from "clsx";

interface ChatMessageProps {
  message: Message;
  characterName?: string;
  userAvatar?: string;
  aiAvatar?: string;
}

export function ChatMessage({ message, characterName, userAvatar, aiAvatar }: ChatMessageProps) {
  const isUser = message.role === "user";
  const time = new Date(message.timestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const avatar = isUser ? userAvatar : aiAvatar;

  return (
    <div
      className={clsx(
        "flex w-full mb-4 gap-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar for AI (left side) */}
      {!isUser && (
        <div className="flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt="AI"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {characterName?.[0] || "AI"}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="max-w-[70%] md:max-w-[60%]">
        {/* Sender name */}
        <div
          className={clsx(
            "text-xs text-gray-500 mb-1",
            isUser ? "text-right" : "text-left"
          )}
        >
          {isUser ? "我" : characterName || "助手"} · {time}
        </div>

        {/* Message bubble */}
        <div
          className={clsx(
            "px-4 py-3 rounded-bubble whitespace-pre-wrap break-words",
            isUser
              ? "bg-pink-500 text-white rounded-br-md"
              : "bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100"
          )}
        >
          {message.content}
        </div>
      </div>

      {/* Avatar for User (right side) */}
      {isUser && (
        <div className="flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt="User"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
