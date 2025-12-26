// ============================================
// Main Chat Component
// ============================================

"use client";

import { useEffect, useRef } from "react";
import { Trash2, Download, Sparkles, Settings } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Button } from "./ui/Button";
import { Message, Persona, ChatSession, QuickMood } from "@/lib/types";
import { QUICK_MOOD_LABELS } from "@/lib/persona";

interface ChatProps {
  session: ChatSession | null;
  persona: Persona | null;
  isLoading: boolean;
  error: string | null;
  userAvatar?: string;
  aiAvatar?: string;
  onSendMessage: (content: string) => void;
  onClearChat: () => void;
  onExportChat: (format: "markdown" | "json") => void;
  onQuickMood: (mood: QuickMood) => void;
  onOpenPersonaPanel?: () => void;
}

export function Chat({
  session,
  persona,
  isLoading,
  error,
  userAvatar,
  aiAvatar,
  onSendMessage,
  onClearChat,
  onExportChat,
  onQuickMood,
  onOpenPersonaPanel,
}: ChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages]);

  const messages = session?.messages || [];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">
              {persona?.characterName || "AI 助手"}
            </h2>
            <p className="text-xs text-gray-500">
              {persona ? "在线" : "未选择角色"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick mood buttons */}
          <div className="hidden md:flex items-center gap-1 mr-2">
            {(Object.keys(QUICK_MOOD_LABELS) as QuickMood[]).map((mood) => (
              <Button
                key={mood}
                variant="ghost"
                size="sm"
                onClick={() => onQuickMood(mood)}
                title={`切换到${QUICK_MOOD_LABELS[mood]}风格`}
              >
                {QUICK_MOOD_LABELS[mood]}
              </Button>
            ))}
          </div>

          {/* Export dropdown */}
          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              disabled={messages.length === 0}
              title="导出对话"
            >
              <Download className="w-4 h-4" />
            </Button>
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => onExportChat("markdown")}
                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 rounded-t-lg"
              >
                导出为 Markdown
              </button>
              <button
                onClick={() => onExportChat("json")}
                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 rounded-b-lg"
              >
                导出为 JSON
              </button>
            </div>
          </div>

          {/* Clear chat */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearChat}
            disabled={messages.length === 0}
            title="清空对话"
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          {/* Persona settings button */}
          {onOpenPersonaPanel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenPersonaPanel}
              title="角色设定"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Safety notice */}
      <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
        <p className="text-xs text-amber-700 text-center">
          恋爱陪伴聊天，仅供情绪支持与日常互动；如遇危机请联系现实帮助
        </p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Sparkles className="w-12 h-12 mb-4 text-pink-300" />
            <p className="text-lg font-medium text-gray-500">
              {persona ? `和 ${persona.characterName} 开始聊天吧~` : "选择一个角色开始聊天"}
            </p>
            <p className="text-sm mt-2">
              {persona ? "发送一条消息开始对话" : "在右侧面板选择或创建角色"}
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                characterName={persona?.characterName}
                userAvatar={userAvatar}
                aiAvatar={aiAvatar}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-white text-gray-800 px-4 py-3 rounded-bubble rounded-bl-md shadow-sm border border-gray-100">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100">
          <p className="text-sm text-red-600 text-center">{error}</p>
        </div>
      )}

      {/* Input area */}
      <ChatInput
        onSend={onSendMessage}
        disabled={isLoading || !persona}
        placeholder={persona ? `对 ${persona.characterName} 说点什么...` : "请先选择角色"}
      />
    </div>
  );
}
