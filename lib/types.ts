// ============================================
// Type Definitions for AI Girlfriend Chat App
// ============================================

// Message types
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

// Chat session
export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  personaId: string;
  createdAt: number;
  updatedAt: number;
}

// Relationship type options
export type RelationshipType =
  | "ambiguous" // 暧昧期
  | "stable" // 稳定恋爱
  | "long_distance" // 异地恋
  | "companion"; // 恋人式陪伴

// Companion goals (multi-select)
export interface CompanionGoals {
  dailyChat: boolean; // 陪伴聊天
  emotionalSupport: boolean; // 情绪支持
  lightFlirting: boolean; // 轻度调情
  rituals: boolean; // 生活仪式感
  taskCompanion: boolean; // 轻量任务陪跑
}

// Speaking style settings (0-100 scale)
export interface SpeakingStyle {
  warmth: number; // 语气温度: 0=冷静, 100=热烈
  verbosity: number; // 话长: 0=短句, 100=细腻长句
  sweetness: number; // 甜度: 0=克制, 100=撒糖
  emojiFrequency: number; // Emoji频率: 0=无, 100=高
  physicalAffection: number; // 恋爱小动作频率: 0=无, 100=高
}

// Interaction habits
export interface InteractionHabits {
  initiativeLevel: "low" | "medium" | "high"; // 主动发起话题频率
  memoryNotes: string; // 记忆偏好笔记
  morningGreeting: string; // 早安模板
  nightGreeting: string; // 晚安模板
  missYouMessage: string; // 想你模板
  encourageMessage: string; // 加油模板
  comfortMessage: string; // 哄人模板
  apologizeMessage: string; // 道歉模板
  actCuteMessage: string; // 撒娇模板
}

// Complete Persona configuration
export interface Persona {
  id: string;
  name: string; // 预设名称
  characterName: string; // 角色名称
  relationshipType: RelationshipType;
  userNickname: string; // TA怎么叫用户
  characterNickname: string; // 用户怎么称呼TA
  goals: CompanionGoals;
  style: SpeakingStyle;
  habits: InteractionHabits;
  customNotes: string; // 额外自定义说明
  createdAt: number;
  updatedAt: number;
}

// API Settings for custom endpoints
export interface ApiSettings {
  apiKey: string;
  baseUrl: string; // 自定义 API 端点，如 https://api.openai.com/v1
  model: string;
  temperature: number;
  maxTokens: number;
  useEnvKey: boolean; // 是否使用环境变量中的 API Key
}

// API Request/Response types
export interface ChatRequest {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  persona: Persona;
  model?: string;
  temperature?: number;
  apiSettings?: ApiSettings; // 自定义 API 设置
}

export interface ChatResponse {
  reply: string;
  requestId?: string;
  error?: string;
}

// App state
export interface AppState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  personas: Persona[];
  currentPersonaId: string;
  sidebarOpen: boolean;
  personaPanelOpen: boolean;
}

// Quick mood buttons
export type QuickMood = "restrained" | "sweet" | "comforting" | "playful";

// Storage keys
export const STORAGE_KEYS = {
  SESSIONS: "ai-gf-sessions",
  PERSONAS: "ai-gf-personas",
  CURRENT_SESSION: "ai-gf-current-session",
  CURRENT_PERSONA: "ai-gf-current-persona",
  SETTINGS: "ai-gf-settings",
  API_SETTINGS: "ai-gf-api-settings",
  USER_AVATAR: "ai-gf-user-avatar",
  AI_AVATAR: "ai-gf-ai-avatar",
} as const;

// Avatar settings
export interface AvatarSettings {
  userAvatar: string; // Base64 or URL
  aiAvatar: string; // Base64 or URL
}

// Default API settings
export const DEFAULT_API_SETTINGS: ApiSettings = {
  apiKey: "",
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-4o-mini",
  temperature: 0.85,
  maxTokens: 2048,
  useEnvKey: true,
};

// Common API providers presets
export const API_PRESETS = {
  openai: {
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    models: ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
  },
  deepseek: {
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    models: ["deepseek-chat", "deepseek-coder"],
  },
  moonshot: {
    name: "Moonshot (月之暗面)",
    baseUrl: "https://api.moonshot.cn/v1",
    models: ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"],
  },
  zhipu: {
    name: "智谱 AI",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    models: ["glm-4", "glm-4-flash", "glm-3-turbo"],
  },
  siliconflow: {
    name: "SiliconFlow",
    baseUrl: "https://api.siliconflow.cn/v1",
    models: ["Qwen/Qwen2.5-7B-Instruct", "deepseek-ai/DeepSeek-V2.5"],
  },
  custom: {
    name: "自定义",
    baseUrl: "",
    models: [],
  },
} as const;

export type ApiProvider = keyof typeof API_PRESETS;
