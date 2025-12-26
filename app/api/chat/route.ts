// ============================================
// Chat API Route - OpenAI compatible API calls
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { getDefaultModel, getTemperature, MAX_MESSAGES_TO_SEND, DEFAULT_MAX_TOKENS } from "@/lib/openai";
import { renderPersonaPrompt } from "@/lib/persona";
import { ChatRequest, ChatResponse, Persona, ApiSettings } from "@/lib/types";

// Get API configuration
function getApiConfig(settings?: ApiSettings) {
  let apiKey: string | undefined;
  let baseURL: string;

  if (settings && !settings.useEnvKey && settings.apiKey) {
    apiKey = settings.apiKey;
    baseURL = settings.baseUrl || "https://api.openai.com/v1";
  } else {
    apiKey = process.env.OPENAI_API_KEY;
    baseURL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  }

  return { apiKey, baseURL };
}

export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse>> {
  let requestId: string | undefined;

  try {
    // Parse request body
    const body = (await request.json()) as ChatRequest;
    const { messages, persona, model, temperature, apiSettings } = body;

    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { reply: "", error: "messages 字段是必需的" },
        { status: 400 }
      );
    }

    if (!persona) {
      return NextResponse.json(
        { reply: "", error: "persona 字段是必需的" },
        { status: 400 }
      );
    }

    // Get API configuration
    const { apiKey, baseURL } = getApiConfig(apiSettings);

    if (!apiKey) {
      return NextResponse.json(
        { reply: "", error: "API Key 未配置。请在设置中填写 API Key 或配置环境变量 OPENAI_API_KEY" },
        { status: 401 }
      );
    }

    // Render persona to system prompt
    const systemPrompt = renderPersonaPrompt(persona as Persona);

    // Limit messages to control costs
    const recentMessages = messages.slice(-MAX_MESSAGES_TO_SEND);

    // Build messages array for OpenAI
    // Put system prompt as first user message for better compatibility with some API providers
    const openaiMessages = [
      { role: "system", content: "你是一个AI角色扮演助手，请严格按照用户第一条消息中的角色设定来回复。" },
      { role: "user", content: `【角色设定，请严格遵守】\n${systemPrompt}\n\n---\n请记住以上设定，接下来开始角色扮演。` },
      { role: "assistant", content: "好的，我会严格按照设定扮演这个角色。请开始对话吧～" },
      ...recentMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Determine model and temperature
    const finalModel = model || getDefaultModel(apiSettings);
    const finalTemperature = temperature ?? getTemperature(apiSettings);
    const maxTokens = apiSettings?.maxTokens || DEFAULT_MAX_TOKENS;

    console.log(`[API] Model: ${finalModel}, Temperature: ${finalTemperature}, BaseURL: ${baseURL}`);
    console.log(`[API] System Prompt:\n${systemPrompt}`);

    // Make direct fetch request instead of using OpenAI SDK
    const apiUrl = `${baseURL}/chat/completions`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: finalModel,
        messages: openaiMessages,
        temperature: finalTemperature,
        max_tokens: maxTokens,
        stream: true, // Use streaming and collect server-side
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Error response: ${response.status} ${errorText}`);

      if (response.status === 403) {
        return NextResponse.json(
          { reply: "", error: "请求被拒绝 (403)，可能是 API 服务商的限制" },
          { status: 403 }
        );
      }
      if (response.status === 401) {
        return NextResponse.json(
          { reply: "", error: "API 密钥无效，请检查配置" },
          { status: 401 }
        );
      }
      if (response.status === 429) {
        return NextResponse.json(
          { reply: "", error: "请求太频繁，请稍后再试" },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { reply: "", error: `API 请求失败: ${response.status}` },
        { status: response.status }
      );
    }

    // Parse streaming response (SSE format)
    const reader = response.body?.getReader();
    if (!reader) {
      return NextResponse.json(
        { reply: "", error: "无法读取响应流" },
        { status: 500 }
      );
    }

    const decoder = new TextDecoder();
    let fullContent = "";
    let buffer = ""; // Buffer for incomplete lines

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        // Keep the last incomplete line in buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const data = trimmed.slice(6); // Remove "data: " prefix
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (!requestId && parsed.id) {
              requestId = parsed.id;
            }
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
            }
          } catch {
            // Skip invalid JSON chunks
          }
        }
      }

      // Process any remaining data in buffer
      if (buffer.trim()) {
        const trimmed = buffer.trim();
        if (trimmed.startsWith("data: ")) {
          const data = trimmed.slice(6);
          if (data !== "[DONE]") {
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    console.log(`[API] Request ID: ${requestId || "unknown"}`);

    // Use collected content as reply
    const reply = fullContent;

    if (!reply) {
      console.error("[API] Empty response from streaming");
      return NextResponse.json(
        { reply: "", requestId, error: "AI 返回了空响应，请重试" },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply, requestId });
  } catch (error: unknown) {
    console.error(`[API] Error:`, error);

    if (error instanceof Error) {
      return NextResponse.json(
        { reply: "", requestId, error: `请求失败: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { reply: "", requestId, error: "发生未知错误，请重试" },
      { status: 500 }
    );
  }
}
