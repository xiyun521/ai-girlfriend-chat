// ============================================
// Main Page Component
// ============================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { Menu, X, Settings, Sliders } from "lucide-react";
import { Chat } from "@/components/Chat";
import { SessionList } from "@/components/SessionList";
import { PersonaPanel } from "@/components/PersonaPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Button } from "@/components/ui/Button";
import {
  ChatSession,
  Persona,
  Message,
  ChatRequest,
  ChatResponse,
  QuickMood,
  ApiSettings,
  DEFAULT_API_SETTINGS,
} from "@/lib/types";
import {
  getSessions,
  getSession,
  saveSession,
  deleteSession as deleteSessionFromStorage,
  getCurrentSessionId,
  setCurrentSessionId,
  getPersonas,
  savePersonas,
  getPersona,
  savePersona,
  deletePersona as deletePersonaFromStorage,
  getCurrentPersonaId,
  setCurrentPersonaId,
  getApiSettings,
  saveApiSettings,
  getUserAvatar,
  saveUserAvatar,
  getAiAvatar,
  saveAiAvatar,
  generateId,
  createNewSession,
  exportChatAsMarkdown,
  exportChatAsJSON,
  downloadFile,
} from "@/lib/storage";
import { createDefaultPersona, createEmptyPersona, applyQuickMood } from "@/lib/persona";
import { clsx } from "clsx";

export default function Home() {
  // State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
  const [apiSettings, setApiSettings] = useState<ApiSettings>(DEFAULT_API_SETTINGS);
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [aiAvatar, setAiAvatar] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [personaPanelOpen, setPersonaPanelOpen] = useState(false);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    // Load API settings
    const loadedApiSettings = getApiSettings();
    setApiSettings(loadedApiSettings);

    // Load avatars
    setUserAvatar(getUserAvatar());
    setAiAvatar(getAiAvatar());

    // Load personas
    let loadedPersonas = getPersonas();
    if (loadedPersonas.length === 0) {
      // Create default Luna persona
      const defaultPersona = createDefaultPersona();
      loadedPersonas = [defaultPersona];
      savePersonas(loadedPersonas);
    }
    setPersonas(loadedPersonas);

    // Load current persona
    const currentPersonaId = getCurrentPersonaId();
    const persona = currentPersonaId
      ? loadedPersonas.find((p) => p.id === currentPersonaId)
      : loadedPersonas[0];
    if (persona) {
      setCurrentPersona(persona);
      setCurrentPersonaId(persona.id);
    }

    // Load sessions
    const loadedSessions = getSessions();
    setSessions(loadedSessions);

    // Load current session
    const currentSessionId = getCurrentSessionId();
    if (currentSessionId) {
      const session = loadedSessions.find((s) => s.id === currentSessionId);
      if (session) {
        setCurrentSession(session);
      }
    }

    setInitialized(true);
  }, []);

  // Session management
  const handleSelectSession = useCallback((sessionId: string) => {
    const session = getSession(sessionId);
    if (session) {
      setCurrentSession(session);
      setCurrentSessionId(sessionId);
      setError(null);
    }
    setSidebarOpen(false);
  }, []);

  const handleCreateSession = useCallback(() => {
    if (!currentPersona) return;
    const newSession = createNewSession(currentPersona.id);
    setSessions((prev) => [...prev, newSession]);
    setCurrentSession(newSession);
    setCurrentSessionId(newSession.id);
    setError(null);
    setSidebarOpen(false);
  }, [currentPersona]);

  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      deleteSessionFromStorage(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        const remaining = sessions.filter((s) => s.id !== sessionId);
        if (remaining.length > 0) {
          setCurrentSession(remaining[0]);
          setCurrentSessionId(remaining[0].id);
        } else {
          setCurrentSession(null);
          setCurrentSessionId(null);
        }
      }
    },
    [currentSession, sessions]
  );

  const handleRenameSession = useCallback((sessionId: string, newName: string) => {
    const session = getSession(sessionId);
    if (session) {
      session.name = newName;
      session.updatedAt = Date.now();
      saveSession(session);
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? session : s))
      );
      if (currentSession?.id === sessionId) {
        setCurrentSession(session);
      }
    }
  }, [currentSession]);

  // Persona management
  const handleSelectPersona = useCallback((personaId: string) => {
    const persona = getPersona(personaId);
    if (persona) {
      setCurrentPersona(persona);
      setCurrentPersonaId(personaId);
    }
  }, []);

  const handleSavePersona = useCallback((persona: Persona) => {
    savePersona(persona);
    setPersonas((prev) => {
      const index = prev.findIndex((p) => p.id === persona.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = persona;
        return updated;
      }
      return [...prev, persona];
    });
    if (currentPersona?.id === persona.id) {
      setCurrentPersona(persona);
    }
  }, [currentPersona]);

  const handleDeletePersona = useCallback(
    (personaId: string) => {
      if (personaId === "default-luna") return; // Don't delete default
      deletePersonaFromStorage(personaId);
      setPersonas((prev) => prev.filter((p) => p.id !== personaId));
      if (currentPersona?.id === personaId) {
        const remaining = personas.filter((p) => p.id !== personaId);
        if (remaining.length > 0) {
          setCurrentPersona(remaining[0]);
          setCurrentPersonaId(remaining[0].id);
        }
      }
    },
    [currentPersona, personas]
  );

  const handleCreatePersona = useCallback(() => {
    const newPersona = createEmptyPersona(`新角色 ${personas.length + 1}`);
    savePersona(newPersona);
    setPersonas((prev) => [...prev, newPersona]);
    setCurrentPersona(newPersona);
    setCurrentPersonaId(newPersona.id);
  }, [personas.length]);

  // Quick mood adjustment
  const handleQuickMood = useCallback(
    (mood: QuickMood) => {
      if (!currentPersona) return;
      const adjusted = applyQuickMood(currentPersona, mood);
      handleSavePersona(adjusted);
    },
    [currentPersona, handleSavePersona]
  );

  // API Settings management
  const handleSaveApiSettings = useCallback((settings: ApiSettings) => {
    saveApiSettings(settings);
    setApiSettings(settings);
  }, []);

  // Avatar management
  const handleSaveAvatars = useCallback((newUserAvatar: string, newAiAvatar: string) => {
    saveUserAvatar(newUserAvatar);
    saveAiAvatar(newAiAvatar);
    setUserAvatar(newUserAvatar);
    setAiAvatar(newAiAvatar);
  }, []);

  // Send message
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!currentPersona || isLoading) return;

      // Create or get session
      let session = currentSession;
      if (!session) {
        session = createNewSession(currentPersona.id);
        setSessions((prev) => [...prev, session!]);
        setCurrentSession(session);
        setCurrentSessionId(session.id);
      }

      // Add user message
      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content,
        timestamp: Date.now(),
      };

      const updatedMessages = [...session.messages, userMessage];
      const updatedSession = {
        ...session,
        messages: updatedMessages,
        updatedAt: Date.now(),
      };

      setCurrentSession(updatedSession);
      saveSession(updatedSession);
      setSessions((prev) =>
        prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
      );

      setIsLoading(true);
      setError(null);

      try {
        // Prepare request with API settings
        const request: ChatRequest = {
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          persona: currentPersona,
          apiSettings: apiSettings,
        };

        // Call API
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });

        const data: ChatResponse = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || "请求失败");
        }

        // Split reply into multiple messages by newlines
        const splitReply = (text: string): string[] => {
          return text
            .split("\n")
            .map(line => line.trim())
            .filter(line => line.length > 0);
        };

        const replyParts = splitReply(data.reply);

        // Add assistant messages with delay for more realistic feel
        let currentMessages = [...updatedMessages];

        for (let i = 0; i < replyParts.length; i++) {
          if (i > 0) {
            // Add 100ms delay between messages
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          const assistantMessage: Message = {
            id: generateId(),
            role: "assistant",
            content: replyParts[i],
            timestamp: Date.now(),
          };

          currentMessages = [...currentMessages, assistantMessage];

          const intermediateSession = {
            ...updatedSession,
            messages: currentMessages,
            updatedAt: Date.now(),
          };

          setCurrentSession(intermediateSession);

          // Only save to storage after all messages are added
          if (i === replyParts.length - 1) {
            saveSession(intermediateSession);
            setSessions((prev) =>
              prev.map((s) => (s.id === intermediateSession.id ? intermediateSession : s))
            );
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "发生未知错误";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPersona, currentSession, isLoading, apiSettings]
  );

  // Clear chat
  const handleClearChat = useCallback(() => {
    if (!currentSession) return;
    if (!confirm("确定要清空当前对话吗？")) return;

    const clearedSession = {
      ...currentSession,
      messages: [],
      updatedAt: Date.now(),
    };

    setCurrentSession(clearedSession);
    saveSession(clearedSession);
    setSessions((prev) =>
      prev.map((s) => (s.id === clearedSession.id ? clearedSession : s))
    );
    setError(null);
  }, [currentSession]);

  // Export chat
  const handleExportChat = useCallback(
    (format: "markdown" | "json") => {
      if (!currentSession) return;

      const timestamp = new Date().toISOString().slice(0, 10);
      if (format === "markdown") {
        const content = exportChatAsMarkdown(currentSession, currentPersona);
        downloadFile(content, `chat-${timestamp}.md`, "text/markdown");
      } else {
        const content = exportChatAsJSON(currentSession);
        downloadFile(content, `chat-${timestamp}.json`, "application/json");
      }
    },
    [currentSession, currentPersona]
  );

  // Don't render until initialized
  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-pink-50">
        <div className="text-pink-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left sidebar - Session list */}
      <aside
        className={clsx(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform lg:transform-none flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex-1 overflow-hidden">
          <SessionList
            sessions={sessions}
            currentSessionId={currentSession?.id || null}
            onSelectSession={handleSelectSession}
            onCreateSession={handleCreateSession}
            onDeleteSession={handleDeleteSession}
            onRenameSession={handleRenameSession}
          />
        </div>
        {/* API Settings button at bottom of sidebar */}
        <div className="p-3 border-t border-gray-200 bg-white flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSettingsPanelOpen(true)}
            className="w-full justify-start"
          >
            <Sliders className="w-4 h-4 mr-2" />
            API 设置
            {!apiSettings.useEnvKey && apiSettings.apiKey && (
              <span className="ml-auto text-xs text-green-600">已配置</span>
            )}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <span className="font-semibold text-gray-800">
            {currentPersona?.characterName || "AI 聊天"}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSettingsPanelOpen(true)}
            >
              <Sliders className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPersonaPanelOpen(true)}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 min-h-0">
          <Chat
            session={currentSession}
            persona={currentPersona}
            isLoading={isLoading}
            error={error}
            userAvatar={userAvatar}
            aiAvatar={aiAvatar}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            onExportChat={handleExportChat}
            onQuickMood={handleQuickMood}
            onOpenPersonaPanel={() => setPersonaPanelOpen(true)}
          />
        </div>
      </main>

      {/* Right sidebar - Persona panel (hidden by default, toggle with button) */}
      {personaPanelOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setPersonaPanelOpen(false)}
        />
      )}

      <aside
        className={clsx(
          "fixed inset-y-0 right-0 z-50 w-80 bg-white border-l border-gray-200 transform transition-transform",
          personaPanelOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Close button */}
        <div className="flex items-center justify-end p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPersonaPanelOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <PersonaPanel
          personas={personas}
          currentPersona={currentPersona}
          onSelectPersona={handleSelectPersona}
          onSavePersona={handleSavePersona}
          onDeletePersona={handleDeletePersona}
          onCreatePersona={handleCreatePersona}
        />
      </aside>

      {/* Settings Panel Modal */}
      {settingsPanelOpen && (
        <SettingsPanel
          settings={apiSettings}
          userAvatar={userAvatar}
          aiAvatar={aiAvatar}
          onSave={handleSaveApiSettings}
          onSaveAvatars={handleSaveAvatars}
          onClose={() => setSettingsPanelOpen(false)}
        />
      )}
    </div>
  );
}
