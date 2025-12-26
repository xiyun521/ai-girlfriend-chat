// ============================================
// Settings Panel Component - API Configuration
// ============================================

"use client";

import { useState, useEffect, useRef } from "react";
import {
  Settings,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Loader2,
  User,
  Upload,
  X,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Slider } from "./ui/Slider";
import {
  ApiSettings,
  ApiProvider,
  API_PRESETS,
  DEFAULT_API_SETTINGS,
} from "@/lib/types";
import { clsx } from "clsx";

interface SettingsPanelProps {
  settings: ApiSettings;
  userAvatar: string;
  aiAvatar: string;
  onSave: (settings: ApiSettings) => void;
  onSaveAvatars: (userAvatar: string, aiAvatar: string) => void;
  onClose: () => void;
}

export function SettingsPanel({
  settings,
  userAvatar,
  aiAvatar,
  onSave,
  onSaveAvatars,
  onClose,
}: SettingsPanelProps) {
  const [editedSettings, setEditedSettings] = useState<ApiSettings>(settings);
  const [editedUserAvatar, setEditedUserAvatar] = useState(userAvatar);
  const [editedAiAvatar, setEditedAiAvatar] = useState(aiAvatar);
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ApiProvider>("custom");
  const [customModel, setCustomModel] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const userAvatarInputRef = useRef<HTMLInputElement>(null);
  const aiAvatarInputRef = useRef<HTMLInputElement>(null);

  // Detect provider from baseUrl on mount
  useEffect(() => {
    const detected = detectProvider(settings.baseUrl);
    setSelectedProvider(detected);
    const models = API_PRESETS[detected].models as readonly string[];
    if (detected === "custom" || !models.includes(settings.model)) {
      setCustomModel(settings.model);
    }
  }, [settings]);

  // Detect provider from URL
  const detectProvider = (url: string): ApiProvider => {
    for (const [key, preset] of Object.entries(API_PRESETS)) {
      if (key !== "custom" && url.includes(new URL(preset.baseUrl || "https://example.com").hostname)) {
        return key as ApiProvider;
      }
    }
    return "custom";
  };

  // Handle provider change
  const handleProviderChange = (provider: ApiProvider) => {
    setSelectedProvider(provider);
    const preset = API_PRESETS[provider];
    setEditedSettings((prev) => ({
      ...prev,
      baseUrl: preset.baseUrl,
      model: preset.models[0] || prev.model,
    }));
    setCustomModel("");
    setTestResult(null);
  };

  // Update settings
  const updateSettings = <K extends keyof ApiSettings>(
    key: K,
    value: ApiSettings[K]
  ) => {
    setEditedSettings((prev) => ({ ...prev, [key]: value }));
    setTestResult(null);
  };

  // Handle model selection
  const handleModelChange = (model: string) => {
    if (model === "__custom__") {
      // User wants to enter custom model
      setCustomModel(editedSettings.model);
    } else {
      updateSettings("model", model);
      setCustomModel("");
    }
  };

  // Test connection
  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hi" }],
          persona: {
            id: "test",
            name: "Test",
            characterName: "Test",
            relationshipType: "stable",
            userNickname: "你",
            characterNickname: "",
            goals: { dailyChat: true, emotionalSupport: false, lightFlirting: false, rituals: false, taskCompanion: false },
            style: { warmth: 50, verbosity: 30, sweetness: 30, emojiFrequency: 0, physicalAffection: 0 },
            habits: {
              initiativeLevel: "low",
              memoryNotes: "",
              morningGreeting: "",
              nightGreeting: "",
              missYouMessage: "",
              encourageMessage: "",
              comfortMessage: "",
              apologizeMessage: "",
              actCuteMessage: "",
            },
            customNotes: "Just say 'OK' to confirm connection.",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          apiSettings: editedSettings,
        }),
      });

      const data = await response.json();

      if (response.ok && data.reply) {
        setTestResult({
          success: true,
          message: "连接成功！API 配置正确。",
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || "连接失败，请检查配置。",
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "连接测试失败",
      });
    } finally {
      setTesting(false);
    }
  };

  // Save settings
  const handleSave = () => {
    const finalSettings = {
      ...editedSettings,
      model: customModel || editedSettings.model,
    };
    onSave(finalSettings);
    onSaveAvatars(editedUserAvatar, editedAiAvatar);
    onClose();
  };

  // Reset to defaults
  const handleReset = () => {
    setEditedSettings(DEFAULT_API_SETTINGS);
    setSelectedProvider("openai");
    setCustomModel("");
    setTestResult(null);
    setEditedUserAvatar("");
    setEditedAiAvatar("");
  };

  // Handle avatar upload
  const handleAvatarUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setAvatar: (avatar: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert("图片大小不能超过 500KB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  const currentPreset = API_PRESETS[selectedProvider];
  const availableModels = currentPreset.models;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-pink-500" />
            <h2 className="text-lg font-semibold text-gray-800">设置</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Avatar Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              头像设置
            </label>
            <div className="flex items-center gap-6">
              {/* User Avatar */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className="relative w-16 h-16 rounded-full overflow-hidden cursor-pointer group"
                  onClick={() => userAvatarInputRef.current?.click()}
                >
                  {editedUserAvatar ? (
                    <img
                      src={editedUserAvatar}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  {editedUserAvatar && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditedUserAvatar("");
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
                <span className="text-xs text-gray-500">我的头像</span>
                <input
                  ref={userAvatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleAvatarUpload(e, setEditedUserAvatar)}
                />
              </div>

              {/* AI Avatar */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className="relative w-16 h-16 rounded-full overflow-hidden cursor-pointer group"
                  onClick={() => aiAvatarInputRef.current?.click()}
                >
                  {editedAiAvatar ? (
                    <img
                      src={editedAiAvatar}
                      alt="AI"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                      <span className="text-white text-lg font-medium">AI</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  {editedAiAvatar && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditedAiAvatar("");
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
                <span className="text-xs text-gray-500">TA的头像</span>
                <input
                  ref={aiAvatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleAvatarUpload(e, setEditedAiAvatar)}
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400">点击头像上传图片（最大 500KB）</p>
          </div>

          <hr className="border-gray-200" />

          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API 服务商
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(API_PRESETS) as ApiProvider[]).map((provider) => (
                <button
                  key={provider}
                  onClick={() => handleProviderChange(provider)}
                  className={clsx(
                    "px-3 py-2 text-sm rounded-lg border transition-colors",
                    selectedProvider === provider
                      ? "border-pink-500 bg-pink-50 text-pink-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  )}
                >
                  {API_PRESETS[provider].name}
                </button>
              ))}
            </div>
          </div>

          {/* Use Environment Key Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                使用环境变量 API Key
              </label>
              <p className="text-xs text-gray-500">
                启用后将使用服务器配置的 OPENAI_API_KEY
              </p>
            </div>
            <button
              onClick={() => updateSettings("useEnvKey", !editedSettings.useEnvKey)}
              className={clsx(
                "relative w-12 h-6 rounded-full transition-colors",
                editedSettings.useEnvKey ? "bg-pink-500" : "bg-gray-300"
              )}
            >
              <span
                className={clsx(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                  editedSettings.useEnvKey ? "translate-x-7" : "translate-x-1"
                )}
              />
            </button>
          </div>

          {/* API Key (only show if not using env key) */}
          {!editedSettings.useEnvKey && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={editedSettings.apiKey}
                  onChange={(e) => updateSettings("apiKey", e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-300 bg-white
                           focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-amber-600">
                注意：API Key 会保存在浏览器本地存储中
              </p>
            </div>
          )}

          {/* Base URL */}
          <Input
            label="API 地址 (Base URL)"
            value={editedSettings.baseUrl}
            onChange={(e) => updateSettings("baseUrl", e.target.value)}
            placeholder="https://api.openai.com/v1"
          />

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              模型
            </label>
            {availableModels.length > 0 ? (
              <select
                value={customModel ? "__custom__" : editedSettings.model}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white
                         focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
                <option value="__custom__">自定义模型...</option>
              </select>
            ) : (
              <Input
                value={customModel || editedSettings.model}
                onChange={(e) => {
                  setCustomModel(e.target.value);
                  updateSettings("model", e.target.value);
                }}
                placeholder="输入模型名称，如 gpt-4o-mini"
              />
            )}
            {customModel && availableModels.length > 0 && (
              <Input
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="输入自定义模型名称"
                className="mt-2"
              />
            )}
          </div>

          {/* Temperature */}
          <Slider
            label="Temperature（创造性）"
            value={editedSettings.temperature * 100}
            onChange={(e) =>
              updateSettings("temperature", parseInt(e.target.value) / 100)
            }
            min={0}
            max={120}
            leftLabel="精确 (0)"
            rightLabel="创造 (1.2)"
          />

          {/* Max Tokens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              最大 Tokens
            </label>
            <input
              type="number"
              value={editedSettings.maxTokens}
              onChange={(e) =>
                updateSettings("maxTokens", parseInt(e.target.value) || 2048)
              }
              min={256}
              max={8192}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white
                       focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Test Result */}
          {testResult && (
            <div
              className={clsx(
                "flex items-center gap-2 px-4 py-3 rounded-lg",
                testResult.success
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              )}
            >
              {testResult.success ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm">{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            重置默认
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={testConnection}
              disabled={testing}
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  测试中...
                </>
              ) : (
                "测试连接"
              )}
            </Button>
            <Button variant="secondary" size="sm" onClick={onClose}>
              取消
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              保存
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
