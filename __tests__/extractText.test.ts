// ============================================
// Unit Tests for extractText
// ============================================

import { describe, it, expect } from "vitest";
import { extractText, extractRequestId } from "../lib/extractText";

describe("extractText", () => {
  it("should extract text from Chat Completions API format", () => {
    const response = {
      id: "chatcmpl-123",
      choices: [
        {
          message: {
            role: "assistant",
            content: "Hello! How can I help you today?",
          },
          finish_reason: "stop",
          index: 0,
        },
      ],
    };

    expect(extractText(response)).toBe("Hello! How can I help you today?");
  });

  it("should extract text from Responses API format with output array", () => {
    const response = {
      id: "resp-123",
      output: [
        {
          type: "message",
          content: [
            {
              type: "text",
              text: "This is from the Responses API",
            },
          ],
        },
      ],
    };

    expect(extractText(response)).toBe("This is from the Responses API");
  });

  it("should extract text from output_text field", () => {
    const response = {
      id: "resp-456",
      output_text: "Direct output text",
    };

    expect(extractText(response)).toBe("Direct output text");
  });

  it("should extract text from direct content field", () => {
    const response = {
      content: "Direct content",
    };

    expect(extractText(response)).toBe("Direct content");
  });

  it("should extract text from direct text field", () => {
    const response = {
      text: "Direct text",
    };

    expect(extractText(response)).toBe("Direct text");
  });

  it("should extract text from message.content", () => {
    const response = {
      message: {
        content: "Message content",
      },
    };

    expect(extractText(response)).toBe("Message content");
  });

  it("should return empty string for null input", () => {
    expect(extractText(null)).toBe("");
  });

  it("should return empty string for undefined input", () => {
    expect(extractText(undefined)).toBe("");
  });

  it("should return empty string for non-object input", () => {
    expect(extractText("string")).toBe("");
    expect(extractText(123)).toBe("");
    expect(extractText(true)).toBe("");
  });

  it("should return empty string for empty object", () => {
    expect(extractText({})).toBe("");
  });

  it("should return empty string for empty choices array", () => {
    const response = {
      choices: [],
    };

    expect(extractText(response)).toBe("");
  });

  it("should return empty string for choices without message content", () => {
    const response = {
      choices: [
        {
          message: {},
        },
      ],
    };

    expect(extractText(response)).toBe("");
  });

  it("should handle Chinese text correctly", () => {
    const response = {
      choices: [
        {
          message: {
            content: "你好！我是Luna，很高兴认识你～",
          },
        },
      ],
    };

    expect(extractText(response)).toBe("你好！我是Luna，很高兴认识你～");
  });

  it("should handle multiline text", () => {
    const response = {
      choices: [
        {
          message: {
            content: "Line 1\nLine 2\nLine 3",
          },
        },
      ],
    };

    expect(extractText(response)).toBe("Line 1\nLine 2\nLine 3");
  });

  it("should handle text with emojis", () => {
    const response = {
      choices: [
        {
          message: {
            content: "早安呀～☀️ 今天也要加油哦！💪",
          },
        },
      ],
    };

    expect(extractText(response)).toBe("早安呀～☀️ 今天也要加油哦！💪");
  });
});

describe("extractRequestId", () => {
  it("should extract request ID from response id field", () => {
    const response = {
      id: "chatcmpl-abc123",
    };

    expect(extractRequestId(response)).toBe("chatcmpl-abc123");
  });

  it("should extract request ID from request_id field", () => {
    const response = {
      request_id: "req-xyz789",
    };

    expect(extractRequestId(response)).toBe("req-xyz789");
  });

  it("should return undefined for missing request ID", () => {
    const response = {
      choices: [],
    };

    expect(extractRequestId(response)).toBeUndefined();
  });

  it("should return undefined for null input", () => {
    expect(extractRequestId(null)).toBeUndefined();
  });

  it("should return undefined for non-object input", () => {
    expect(extractRequestId("string")).toBeUndefined();
  });
});
