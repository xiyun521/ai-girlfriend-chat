// ============================================
// Persona Panel Component
// ============================================

"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  ChevronDown,
  ChevronUp,
  User,
  Heart,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Slider } from "./ui/Slider";
import {
  Persona,
  RelationshipType,
  CompanionGoals,
  SpeakingStyle,
  InteractionHabits,
} from "@/lib/types";
import {
  RELATIONSHIP_LABELS,
  GOAL_LABELS,
  createEmptyPersona,
} from "@/lib/persona";
import { clsx } from "clsx";

interface PersonaPanelProps {
  personas: Persona[];
  currentPersona: Persona | null;
  onSelectPersona: (personaId: string) => void;
  onSavePersona: (persona: Persona) => void;
  onDeletePersona: (personaId: string) => void;
  onCreatePersona: () => void;
}

export function PersonaPanel({
  personas,
  currentPersona,
  onSelectPersona,
  onSavePersona,
  onDeletePersona,
  onCreatePersona,
}: PersonaPanelProps) {
  const [editedPersona, setEditedPersona] = useState<Persona | null>(
    currentPersona
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["basic", "goals", "style"])
  );

  // Sync edited persona when current persona changes
  const handleSelectPersona = (personaId: string) => {
    onSelectPersona(personaId);
    const selected = personas.find((p) => p.id === personaId);
    if (selected) {
      setEditedPersona({ ...selected });
    }
  };

  // Update local state
  const updatePersona = <K extends keyof Persona>(
    key: K,
    value: Persona[K]
  ) => {
    if (editedPersona) {
      setEditedPersona({ ...editedPersona, [key]: value });
    }
  };

  const updateGoals = <K extends keyof CompanionGoals>(
    key: K,
    value: boolean
  ) => {
    if (editedPersona) {
      setEditedPersona({
        ...editedPersona,
        goals: { ...editedPersona.goals, [key]: value },
      });
    }
  };

  const updateStyle = <K extends keyof SpeakingStyle>(key: K, value: number) => {
    if (editedPersona) {
      setEditedPersona({
        ...editedPersona,
        style: { ...editedPersona.style, [key]: value },
      });
    }
  };

  const updateHabits = <K extends keyof InteractionHabits>(
    key: K,
    value: InteractionHabits[K]
  ) => {
    if (editedPersona) {
      setEditedPersona({
        ...editedPersona,
        habits: { ...editedPersona.habits, [key]: value },
      });
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleSave = () => {
    if (editedPersona) {
      onSavePersona({ ...editedPersona, updatedAt: Date.now() });
    }
  };

  const handleCreate = () => {
    const newPersona = createEmptyPersona();
    onCreatePersona();
    setEditedPersona(newPersona);
  };

  // Section header component
  const SectionHeader = ({
    id,
    icon: Icon,
    title,
  }: {
    id: string;
    icon: React.ElementType;
    title: string;
  }) => (
    <button
      onClick={() => toggleSection(id)}
      className="flex items-center justify-between w-full py-2 text-left"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-pink-500" />
        <span className="font-medium text-gray-800">{title}</span>
      </div>
      {expandedSections.has(id) ? (
        <ChevronUp className="w-4 h-4 text-gray-400" />
      ) : (
        <ChevronDown className="w-4 h-4 text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">角色设定</h3>
        <Button variant="ghost" size="sm" onClick={handleCreate} title="新建角色">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Persona selector */}
      <div className="px-4 py-3 border-b border-gray-200">
        <select
          value={currentPersona?.id || ""}
          onChange={(e) => handleSelectPersona(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900
                     focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        >
          <option value="" disabled>
            选择角色预设...
          </option>
          {personas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Editor */}
      {editedPersona ? (
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* Basic Info Section */}
          <div className="border-b border-gray-100 pb-3">
            <SectionHeader id="basic" icon={User} title="角色基础" />
            {expandedSections.has("basic") && (
              <div className="space-y-3 mt-3">
                <Input
                  label="预设名称"
                  value={editedPersona.name}
                  onChange={(e) => updatePersona("name", e.target.value)}
                  placeholder="如：Luna（恋爱陪伴）"
                />
                <Input
                  label="角色名称"
                  value={editedPersona.characterName}
                  onChange={(e) => updatePersona("characterName", e.target.value)}
                  placeholder="如：Luna"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    关系设定
                  </label>
                  <select
                    value={editedPersona.relationshipType}
                    onChange={(e) =>
                      updatePersona(
                        "relationshipType",
                        e.target.value as RelationshipType
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white
                               focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    {Object.entries(RELATIONSHIP_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="TA怎么叫你"
                  value={editedPersona.userNickname}
                  onChange={(e) => updatePersona("userNickname", e.target.value)}
                  placeholder="如：宝贝、亲爱的"
                />
                <Input
                  label="你怎么叫TA（可选）"
                  value={editedPersona.characterNickname}
                  onChange={(e) =>
                    updatePersona("characterNickname", e.target.value)
                  }
                  placeholder="如：Luna、小月"
                />
              </div>
            )}
          </div>

          {/* Goals Section */}
          <div className="border-b border-gray-100 pb-3">
            <SectionHeader id="goals" icon={Heart} title="恋爱陪伴目标" />
            {expandedSections.has("goals") && (
              <div className="space-y-2 mt-3">
                {(Object.keys(GOAL_LABELS) as Array<keyof CompanionGoals>).map(
                  (key) => (
                    <label
                      key={key}
                      className="flex items-start gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={editedPersona.goals[key]}
                        onChange={(e) => updateGoals(key, e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-pink-500
                                   focus:ring-pink-500"
                      />
                      <span className="text-sm text-gray-700">
                        {GOAL_LABELS[key]}
                      </span>
                    </label>
                  )
                )}
              </div>
            )}
          </div>

          {/* Style Section */}
          <div className="border-b border-gray-100 pb-3">
            <SectionHeader id="style" icon={MessageCircle} title="说话风格" />
            {expandedSections.has("style") && (
              <div className="space-y-4 mt-3">
                <Slider
                  label="语气温度"
                  value={editedPersona.style.warmth}
                  onChange={(e) =>
                    updateStyle("warmth", parseInt(e.target.value))
                  }
                  min={0}
                  max={100}
                  leftLabel="冷静"
                  rightLabel="热烈"
                />
                <Slider
                  label="话长"
                  value={editedPersona.style.verbosity}
                  onChange={(e) =>
                    updateStyle("verbosity", parseInt(e.target.value))
                  }
                  min={0}
                  max={100}
                  leftLabel="短句"
                  rightLabel="长句"
                />
                <Slider
                  label="甜度"
                  value={editedPersona.style.sweetness}
                  onChange={(e) =>
                    updateStyle("sweetness", parseInt(e.target.value))
                  }
                  min={0}
                  max={100}
                  leftLabel="克制"
                  rightLabel="撒糖"
                />
                <Slider
                  label="Emoji 频率"
                  value={editedPersona.style.emojiFrequency}
                  onChange={(e) =>
                    updateStyle("emojiFrequency", parseInt(e.target.value))
                  }
                  min={0}
                  max={100}
                  leftLabel="无"
                  rightLabel="高"
                />
                <Slider
                  label="恋爱小动作"
                  value={editedPersona.style.physicalAffection}
                  onChange={(e) =>
                    updateStyle("physicalAffection", parseInt(e.target.value))
                  }
                  min={0}
                  max={100}
                  leftLabel="无"
                  rightLabel="高"
                />
              </div>
            )}
          </div>

          {/* Habits Section */}
          <div className="border-b border-gray-100 pb-3">
            <SectionHeader id="habits" icon={Sparkles} title="互动习惯" />
            {expandedSections.has("habits") && (
              <div className="space-y-3 mt-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    主动发起话题频率
                  </label>
                  <select
                    value={editedPersona.habits.initiativeLevel}
                    onChange={(e) =>
                      updateHabits(
                        "initiativeLevel",
                        e.target.value as "low" | "medium" | "high"
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white
                               focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="low">低（等用户开启话题）</option>
                    <option value="medium">中（适时主动关心）</option>
                    <option value="high">高（经常主动发起）</option>
                  </select>
                </div>
                <Textarea
                  label="记忆笔记（用户偏好、雷点等）"
                  value={editedPersona.habits.memoryNotes}
                  onChange={(e) => updateHabits("memoryNotes", e.target.value)}
                  placeholder="记录用户喜欢的称呼、偏好、不喜欢的话题等..."
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Templates Section */}
          <div className="border-b border-gray-100 pb-3">
            <SectionHeader id="templates" icon={MessageCircle} title="仪式感模板" />
            {expandedSections.has("templates") && (
              <div className="space-y-3 mt-3">
                <Textarea
                  label="早安"
                  value={editedPersona.habits.morningGreeting}
                  onChange={(e) =>
                    updateHabits("morningGreeting", e.target.value)
                  }
                  rows={2}
                />
                <Textarea
                  label="晚安"
                  value={editedPersona.habits.nightGreeting}
                  onChange={(e) => updateHabits("nightGreeting", e.target.value)}
                  rows={2}
                />
                <Textarea
                  label="想你"
                  value={editedPersona.habits.missYouMessage}
                  onChange={(e) => updateHabits("missYouMessage", e.target.value)}
                  rows={2}
                />
                <Textarea
                  label="加油"
                  value={editedPersona.habits.encourageMessage}
                  onChange={(e) =>
                    updateHabits("encourageMessage", e.target.value)
                  }
                  rows={2}
                />
                <Textarea
                  label="安慰"
                  value={editedPersona.habits.comfortMessage}
                  onChange={(e) => updateHabits("comfortMessage", e.target.value)}
                  rows={2}
                />
                <Textarea
                  label="道歉"
                  value={editedPersona.habits.apologizeMessage}
                  onChange={(e) =>
                    updateHabits("apologizeMessage", e.target.value)
                  }
                  rows={2}
                />
                <Textarea
                  label="撒娇"
                  value={editedPersona.habits.actCuteMessage}
                  onChange={(e) => updateHabits("actCuteMessage", e.target.value)}
                  rows={2}
                />
              </div>
            )}
          </div>

          {/* Custom Notes */}
          <div className="pb-3">
            <Textarea
              label="额外自定义说明"
              value={editedPersona.customNotes}
              onChange={(e) => updatePersona("customNotes", e.target.value)}
              placeholder="添加任何额外的角色设定或行为指导..."
              rows={4}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-4">
          <User className="w-12 h-12 mb-3" />
          <p className="text-sm text-center">选择或创建一个角色预设</p>
        </div>
      )}

      {/* Footer actions */}
      {editedPersona && (
        <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-200">
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-1" />
            保存
          </Button>
          {editedPersona.id !== "default-luna" && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (confirm("确定要删除这个角色预设吗？")) {
                  onDeletePersona(editedPersona.id);
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
