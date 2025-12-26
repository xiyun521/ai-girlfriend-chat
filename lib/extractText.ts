// ============================================
// Extract Text from OpenAI Response
// ============================================

/**
 * Extracts text content from various OpenAI API response formats.
 * Supports both Chat Completions API and Responses API formats.
 *
 * @param response - The raw response object from OpenAI
 * @returns The extracted text content, or empty string if not found
 */
export function extractText(response: unknown): string {
  if (!response || typeof response !== "object") {
    return "";
  }

  const res = response as Record<string, unknown>;

  // Chat Completions API format
  // { choices: [{ message: { content: "..." } }] }
  if (Array.isArray(res.choices) && res.choices.length > 0) {
    const choice = res.choices[0] as Record<string, unknown>;
    if (choice.message && typeof choice.message === "object") {
      const message = choice.message as Record<string, unknown>;
      if (typeof message.content === "string") {
        return message.content;
      }
    }
    // Fallback: direct content on choice
    if (typeof choice.content === "string") {
      return choice.content;
    }
  }

  // Responses API format (newer)
  // { output: [{ content: [{ text: "..." }] }] }
  if (Array.isArray(res.output) && res.output.length > 0) {
    const output = res.output[0] as Record<string, unknown>;
    if (Array.isArray(output.content) && output.content.length > 0) {
      const content = output.content[0] as Record<string, unknown>;
      if (typeof content.text === "string") {
        return content.text;
      }
    }
  }

  // Alternative Responses API format
  // { output_text: "..." }
  if (typeof res.output_text === "string") {
    return res.output_text;
  }

  // Direct content field
  if (typeof res.content === "string") {
    return res.content;
  }

  // Direct text field
  if (typeof res.text === "string") {
    return res.text;
  }

  // Message object with content
  if (res.message && typeof res.message === "object") {
    const message = res.message as Record<string, unknown>;
    if (typeof message.content === "string") {
      return message.content;
    }
  }

  return "";
}

/**
 * Extracts the request ID from OpenAI response headers or body
 */
export function extractRequestId(response: unknown, headers?: Headers): string | undefined {
  // Try headers first
  if (headers) {
    const requestId = headers.get("x-request-id");
    if (requestId) return requestId;
  }

  // Try response body
  if (response && typeof response === "object") {
    const res = response as Record<string, unknown>;
    if (typeof res.id === "string") return res.id;
    if (typeof res.request_id === "string") return res.request_id;
  }

  return undefined;
}
