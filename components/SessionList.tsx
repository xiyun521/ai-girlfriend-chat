// ============================================
// Session List Component
// ============================================

"use client";

import { useState } from "react";
import { Plus, MessageSquare, Trash2, Edit2, Check, X } from "lucide-react";
import { Button } from "./ui/Button";
import { ChatSession } from "@/lib/types";
import { clsx } from "clsx";

interface SessionListProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newName: string) => void;
}

export function SessionList({
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onRenameSession,
}: SessionListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const startEditing = (session: ChatSession) => {
    setEditingId(session.id);
    setEditName(session.name);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      onRenameSession(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  // Sort sessions by updatedAt (newest first)
  const sortedSessions = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">对话列表</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreateSession}
          title="新建对话"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto">
        {sortedSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
            <MessageSquare className="w-8 h-8 mb-2" />
            <p className="text-sm text-center">暂无对话</p>
            <Button
              variant="primary"
              size="sm"
              onClick={onCreateSession}
              className="mt-3"
            >
              开始新对话
            </Button>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sortedSessions.map((session) => (
              <div
                key={session.id}
                className={clsx(
                  "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                  session.id === currentSessionId
                    ? "bg-pink-100 text-pink-800"
                    : "hover:bg-gray-100 text-gray-700"
                )}
                onClick={() => {
                  if (editingId !== session.id) {
                    onSelectSession(session.id);
                  }
                }}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />

                {editingId === session.id ? (
                  <div className="flex-1 flex items-center gap-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") cancelEdit();
                      }}
                      className="flex-1 px-2 py-1 text-sm rounded border border-pink-300 focus:outline-none focus:ring-1 focus:ring-pink-500"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        saveEdit();
                      }}
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelEdit();
                      }}
                      className="p-1 text-gray-500 hover:bg-gray-200 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {session.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session.messages.length} 条消息
                      </p>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(session);
                        }}
                        className="p-1 text-gray-500 hover:bg-gray-200 rounded"
                        title="重命名"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("确定要删除这个对话吗？")) {
                            onDeleteSession(session.id);
                          }
                        }}
                        className="p-1 text-red-500 hover:bg-red-100 rounded"
                        title="删除"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
