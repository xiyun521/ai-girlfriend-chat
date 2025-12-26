// ============================================
// OpenAI Client Configuration
// ============================================

import OpenAI from "openai";
import { ApiSettings } from "./types";

// Initialize OpenAI client with custom settings (server-side only)
export function getOpenAIClient(settings?: ApiSettings): OpenAI {
  // Determine API key: use custom key or fall back to env
  let apiKey: string | undefined;
  let baseURL: string;

  if (settings && !settings.useEnvKey && settings.apiKey) {
    // Use custom settings from frontend
    apiKey = settings.apiKey;
    baseURL = settings.baseUrl || "https://api.openai.com/v1";
  } else {
    // Use environment variables
    apiKey = process.env.OPENAI_API_KEY;
    baseURL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  }

  if (!apiKey) {
    throw new Error("API Key 未配置。请在设置中填写 API Key 或配置环境变量 OPENAI_API_KEY");
  }

  console.log(`[OpenAI] Using baseURL: ${baseURL}`);

  return new OpenAI({
    apiKey,
    baseURL,
  });
}

// Get default model from settings or environment
export function getDefaultModel(settings?: ApiSettings): string {
  // If using env key, prefer env model
  if (settings?.useEnvKey) {
    return process.env.OPENAI_MODEL || settings?.model || "gpt-4o-mini";
  }
  // Otherwise use settings model
  if (settings?.model) {
    return settings.model;
  }
  return process.env.OPENAI_MODEL || "gpt-4o-mini";
}

// Get temperature from settings or default
export function getTemperature(settings?: ApiSettings): number {
  if (settings?.temperature !== undefined) {
    return settings.temperature;
  }
  return DEFAULT_TEMPERATURE;
}

// Available models for selection (OpenAI)
export const AVAILABLE_MODELS = [
  { id: "gpt-4o-mini", name: "GPT-4o Mini (推荐)" },
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
];

// Default temperature for romantic companion style
export const DEFAULT_TEMPERATURE = 0.85;

// Maximum messages to send (to control costs)
export const MAX_MESSAGES_TO_SEND = 20;

// Default max tokens
export const DEFAULT_MAX_TOKENS = 2048;
