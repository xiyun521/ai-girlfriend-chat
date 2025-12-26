# AI 恋爱陪伴聊天应用

一个基于 Next.js 和 OpenAI API 的虚拟女友风格聊天应用，支持自定义角色性格（Persona）、多会话管理、聊天记录导出等功能。**支持接入自定义 API 端点**（OpenAI 兼容的第三方服务）。

## 功能特点

### 聊天核心
- 消息气泡界面，自动滚动到最新消息
- Enter 发送消息，Shift+Enter 换行
- 加载状态动画和错误提示
- 聊天历史保存在 localStorage，刷新不丢失
- 一键清空对话
- 导出对话为 Markdown 或 JSON

### 会话管理
- 多会话列表，支持新建/重命名/删除
- 会话按更新时间排序

### Persona 系统（角色设定）
- **角色基础**：名称、关系设定、称呼体系
- **恋爱陪伴目标**：陪伴聊天、情绪支持、轻度调情、生活仪式感、任务陪跑
- **说话风格**：语气温度、话长、甜度、Emoji 频率、恋爱小动作
- **互动习惯**：主动性、记忆笔记、仪式感模板（早安/晚安/想你/加油/安慰等）
- **边界与安全规则**：内置安全边界，保护用户

### 自定义 API 支持
- **内置服务商预设**：OpenAI、DeepSeek、Moonshot（月之暗面）、智谱 AI、SiliconFlow
- **自定义端点**：支持任何 OpenAI 兼容的 API
- **灵活配置**：可在前端设置面板中配置 API Key、Base URL、模型、Temperature 等
- **连接测试**：一键测试 API 连接是否正常
- **双重配置**：支持环境变量配置（服务器端）或前端配置（浏览器本地存储）

### 快捷调整
- 一键切换风格：更克制 / 更甜 / 更安抚 / 更活泼

### 安全特性
- 支持使用环境变量存储 API Key（推荐生产环境）
- 前端配置的 API Key 仅存储在浏览器本地
- 内置安全边界规则，禁止不当内容
- 危机应对指引（自伤/轻生倾向时提供专业帮助信息）

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **AI**: OpenAI API (非流式)，支持兼容 API
- **图标**: Lucide React
- **测试**: Vitest

## 快速开始

### 1. 安装依赖

```bash
cd ai-girlfriend-chat
npm install
```

### 2. 配置 API（两种方式）

#### 方式 A：环境变量配置（推荐生产环境）

复制 `.env.local.example` 为 `.env.local`：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`：

```env
# OpenAI API Key
OPENAI_API_KEY=sk-your-api-key-here

# 默认模型
OPENAI_MODEL=gpt-4o-mini

# 自定义 API 地址（可选）
OPENAI_BASE_URL=https://api.openai.com/v1
```

#### 方式 B：前端设置面板配置

1. 启动应用后，点击左侧边栏底部的「API 设置」按钮
2. 选择服务商或输入自定义 API 地址
3. 填入 API Key
4. 点击「测试连接」验证配置
5. 保存设置

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 即可使用。

### 4. 运行测试

```bash
npm test
```

## 支持的 API 服务商

| 服务商 | Base URL | 示例模型 |
|--------|----------|----------|
| OpenAI | `https://api.openai.com/v1` | gpt-4o-mini, gpt-4o |
| DeepSeek | `https://api.deepseek.com/v1` | deepseek-chat |
| Moonshot | `https://api.moonshot.cn/v1` | moonshot-v1-8k |
| 智谱 AI | `https://open.bigmodel.cn/api/paas/v4` | glm-4, glm-4-flash |
| SiliconFlow | `https://api.siliconflow.cn/v1` | Qwen/Qwen2.5-7B-Instruct |
| 自定义 | 任意 OpenAI 兼容端点 | - |

## 项目结构

```
ai-girlfriend-chat/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # 后端 API 路由
│   ├── globals.css           # 全局样式
│   ├── layout.tsx            # 根布局
│   └── page.tsx              # 主页面
├── components/
│   ├── Chat.tsx              # 聊天主组件
│   ├── ChatInput.tsx         # 输入框组件
│   ├── ChatMessage.tsx       # 消息气泡组件
│   ├── PersonaPanel.tsx      # 角色设定面板
│   ├── SessionList.tsx       # 会话列表
│   ├── SettingsPanel.tsx     # API 设置面板
│   └── ui/                   # 基础 UI 组件
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Slider.tsx
│       └── Textarea.tsx
├── lib/
│   ├── extractText.ts        # 解析 OpenAI 响应
│   ├── openai.ts             # OpenAI 客户端配置
│   ├── persona.ts            # Persona 系统
│   ├── storage.ts            # localStorage 工具
│   └── types.ts              # 类型定义
├── __tests__/
│   └── extractText.test.ts   # 单元测试
├── .env.local.example        # 环境变量示例
├── package.json
├── tailwind.config.ts
└── README.md
```

## 部署到 Vercel

### 方式一：通过 Vercel CLI

```bash
npm i -g vercel
vercel
```

### 方式二：通过 GitHub

1. 将代码推送到 GitHub 仓库
2. 在 [Vercel](https://vercel.com) 导入项目
3. 在 Vercel 项目设置中添加环境变量：
   - `OPENAI_API_KEY`: 你的 API Key（可选，用户也可在前端配置）
   - `OPENAI_MODEL`: 模型名称（可选，默认 `gpt-4o-mini`）
   - `OPENAI_BASE_URL`: API 地址（可选，默认 OpenAI）
4. 部署完成

### 环境变量说明

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| `OPENAI_API_KEY` | 否* | - | API 密钥（也可在前端配置） |
| `OPENAI_MODEL` | 否 | `gpt-4o-mini` | 默认模型 |
| `OPENAI_BASE_URL` | 否 | `https://api.openai.com/v1` | API 端点地址 |

*注：如果不配置环境变量，用户需要在前端设置面板中配置 API Key。

## 默认角色预设

应用内置了一个名为 **Luna** 的默认角色：

- **关系设定**: 稳定恋爱中的虚拟女友
- **氛围关键词**: 温柔、黏人一点点、俏皮、很会共情、会哄人、会夸夸
- **甜度**: 中高
- **Emoji**: 中等频率
- **互动习惯**: 每天的早安/晚安仪式、用户低落时优先安抚
- **边界**: 含蓄亲昵，不露骨；尊重用户边界

## 自定义角色

1. 点击右侧面板的 "+" 按钮创建新角色
2. 填写角色基础信息（名称、关系、称呼）
3. 选择恋爱陪伴目标
4. 调整说话风格滑杆
5. 编辑互动习惯和仪式感模板
6. 点击"保存"

切换角色后，建议开始新对话以获得最佳体验。

## 注意事项

- 本应用仅供情绪支持与日常互动，不能替代专业心理咨询
- 如遇心理危机，请联系专业机构或拨打心理援助热线
- API 调用会产生费用，请注意控制使用量
- 在前端配置的 API Key 会保存在浏览器本地存储中，请注意安全

## 许可证

MIT License
