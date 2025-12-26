// ============================================
// LocalStorage Utilities
// ============================================

import {
  ChatSession,
  Persona,
  ApiSettings,
  DEFAULT_API_SETTINGS,
  STORAGE_KEYS,
} from "./types";

// Check if we're in browser environment
const isBrowser = typeof window !== "undefined";

// Generic storage functions
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (!isBrowser) return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
}

export function removeFromStorage(key: string): void {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

// Session management
export function getSessions(): ChatSession[] {
  return getFromStorage<ChatSession[]>(STORAGE_KEYS.SESSIONS, []);
}

export function saveSessions(sessions: ChatSession[]): void {
  setToStorage(STORAGE_KEYS.SESSIONS, sessions);
}

export function getSession(sessionId: string): ChatSession | null {
  const sessions = getSessions();
  return sessions.find((s) => s.id === sessionId) || null;
}

export function saveSession(session: ChatSession): void {
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === session.id);
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.push(session);
  }
  saveSessions(sessions);
}

export function deleteSession(sessionId: string): void {
  const sessions = getSessions();
  const filtered = sessions.filter((s) => s.id !== sessionId);
  saveSessions(filtered);
}

export function getCurrentSessionId(): string | null {
  return getFromStorage<string | null>(STORAGE_KEYS.CURRENT_SESSION, null);
}

export function setCurrentSessionId(sessionId: string | null): void {
  if (sessionId) {
    setToStorage(STORAGE_KEYS.CURRENT_SESSION, sessionId);
  } else {
    removeFromStorage(STORAGE_KEYS.CURRENT_SESSION);
  }
}

// Persona management
export function getPersonas(): Persona[] {
  return getFromStorage<Persona[]>(STORAGE_KEYS.PERSONAS, []);
}

export function savePersonas(personas: Persona[]): void {
  setToStorage(STORAGE_KEYS.PERSONAS, personas);
}

export function getPersona(personaId: string): Persona | null {
  const personas = getPersonas();
  return personas.find((p) => p.id === personaId) || null;
}

export function savePersona(persona: Persona): void {
  const personas = getPersonas();
  const index = personas.findIndex((p) => p.id === persona.id);
  if (index >= 0) {
    personas[index] = persona;
  } else {
    personas.push(persona);
  }
  savePersonas(personas);
}

export function deletePersona(personaId: string): void {
  const personas = getPersonas();
  const filtered = personas.filter((p) => p.id !== personaId);
  savePersonas(filtered);
}

export function getCurrentPersonaId(): string | null {
  return getFromStorage<string | null>(STORAGE_KEYS.CURRENT_PERSONA, null);
}

export function setCurrentPersonaId(personaId: string): void {
  setToStorage(STORAGE_KEYS.CURRENT_PERSONA, personaId);
}

// API Settings management
export function getApiSettings(): ApiSettings {
  return getFromStorage<ApiSettings>(STORAGE_KEYS.API_SETTINGS, DEFAULT_API_SETTINGS);
}

export function saveApiSettings(settings: ApiSettings): void {
  setToStorage(STORAGE_KEYS.API_SETTINGS, settings);
}

// Avatar management
export function getUserAvatar(): string {
  return getFromStorage<string>(STORAGE_KEYS.USER_AVATAR, "");
}

export function saveUserAvatar(avatar: string): void {
  setToStorage(STORAGE_KEYS.USER_AVATAR, avatar);
}

export function getAiAvatar(): string {
  return getFromStorage<string>(STORAGE_KEYS.AI_AVATAR, "");
}

export function saveAiAvatar(avatar: string): void {
  setToStorage(STORAGE_KEYS.AI_AVATAR, avatar);
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Create new session
export function createNewSession(personaId: string, name?: string): ChatSession {
  const session: ChatSession = {
    id: generateId(),
    name: name || `对话 ${new Date().toLocaleDateString("zh-CN")}`,
    messages: [],
    personaId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  saveSession(session);
  return session;
}

// Export chat as markdown
export function exportChatAsMarkdown(session: ChatSession, persona: Persona | null): string {
  const lines: string[] = [];
  lines.push(`# ${session.name}`);
  lines.push("");
  lines.push(`**创建时间**: ${new Date(session.createdAt).toLocaleString("zh-CN")}`);
  if (persona) {
    lines.push(`**角色**: ${persona.characterName}`);
  }
  lines.push("");
  lines.push("---");
  lines.push("");

  for (const msg of session.messages) {
    const time = new Date(msg.timestamp).toLocaleTimeString("zh-CN");
    const sender = msg.role === "user" ? "我" : persona?.characterName || "助手";
    lines.push(`**${sender}** (${time}):`);
    lines.push("");
    lines.push(msg.content);
    lines.push("");
  }

  return lines.join("\n");
}

// Export chat as JSON
export function exportChatAsJSON(session: ChatSession): string {
  return JSON.stringify(session, null, 2);
}

// Download file helper
export function downloadFile(content: string, filename: string, mimeType: string): void {
  if (!isBrowser) return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
