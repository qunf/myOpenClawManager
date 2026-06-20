# 🦞 OpenClaw Manager

**[OpenClaw](https://github.com/miaoxworld/OpenClawInstaller) 一键安装与管理图形界面** — 开源 AI 助手框架。

基于 **Tauri 2.0 + React 18 + TypeScript + Rust** 构建，在所有桌面平台上提供原生性能。

![Platform](https://img.shields.io/badge/platform-macOS%20|%20Windows%20|%20Linux-blue)
![Tauri](https://img.shields.io/badge/Tauri-2.0-orange)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Rust](https://img.shields.io/badge/Rust-1.70+-red)

---

## ✨ 功能特性与使用指南

### 🚀 一键设置向导
完全跳过终端操作。内置设置向导自动检测你的环境，安装 Node.js 和 OpenClaw，并初始化所有内容 — 全部在图形界面中完成。

### 📊 仪表盘与服务控制
OpenClaw 服务的实时监控与全生命周期管理。
- **服务状态：** 端口、PID、内存使用、运行时间。
- **服务监护：** 当网关通过 Telegram 命令重启或从意外故障中恢复时，自动重新启动。
- **日志查看器：** 结构化本地应用日志，支持按警告、错误筛选，轻松导出。
- **Web 控制界面：** 与你的 Agent 直接聊天 (`http://localhost:{GATEWAY_PORT}`)。

### 🤖 全面的 AI 配置
灵活的多供应商 AI 连接，无缝集成 **Ollama**。

**支持的供应商：**
- **Google Gemini**（新功能！✨）：Gemini 3 Pro、Gemini 3 Flash
- **Anthropic**：Claude 3.5 Sonnet、Opus
- **OpenAI**：GPT-4o、GPT-4o-mini
- **DeepSeek**：DeepSeek V3（聊天）、DeepSeek R1（推理）
- **本地模型（Ollama）**：自动检测 Ollama 安装。直接从界面搜索、拉取和管理本地模型（如 `llama3`、`qwen3.5:9b`）。
- **自定义供应商配置：** 添加任何 OpenAI 或 Anthropic API 兼容端点并设置特定模型。

### ⚙️ 高级设置与调优
直接通过图形界面对整个 OpenClaw 生态系统进行精细化配置。

- **压缩与内存优化：** 在压缩触发前映射令牌，管理上下文裁剪，限制消息保留，使用 Ollama 映射离线本地嵌入。
- **子 Agent 全局默认值：** 管理复杂的 Agent 嵌套限制。定义最大生成深度、每个 Agent 的最大子节点数，限制并发子 Agent 处理。
- **工具与安全配置：** 为你的实例设置严格的安全护栏（消息传递、最小化、编码、完全访问）。
- **原生 PDF 支持：** 配置严格限制，指定最大令牌页数和负载大小（MB），用于复杂文档处理。
- **内联文件附件：** 启用/禁用子 Agent 分析标准会话附件，并定义每个会话的最大字节阈值。
- **浏览器控制与网络搜索：** 通过集成你自己的 Brave Search API 密钥，赋予 Agent 网络探索能力，并自定义内部 Agent 浏览器窗口 UI 颜色。
- **网络自定义：** 轻松动态调整网关端口（如标准 `3000`）和全局调试日志级别（如 debug、info、warn）。
- **工作区本地化：** 配置本地时区和首选时间格式（如 12 小时制 AM/PM 或 24 小时制）。

### 📋 配置管理
再也不会丢失 `.openclaw.json` 或模型配置文件了！
- 经过验证的图形界面配置直接同步到你的 `.openclaw.json`。
- 从界面提供 Schema 验证。
- 使用 JSON 导入、导出、备份和恢复你的整个本地配置。

### 🧩 MCP 管理
完整的 [模型上下文协议](https://modelcontextprotocol.io/) 服务器管理，集成 **mcporter** 支持。动态设置简单的 StdIo 本地命令或远程 SSE 钩子。更改自动同步到本地 `~/.mcporter/mcporter.json`。

### 📚 技能管理
浏览、安装和管理通过 **ClawHub** 发布的 OpenClaw 功能（如专业编码、Web 开发）。

### 📱 消息渠道
将 OpenClaw 连接到多个全渠道聊天平台。
**支持的渠道：** Telegram、飞书、Discord、Slack、WhatsApp。从界面直接完成令牌、密钥哈希、ID、授权群组/用户的完整配置，即时绑定到网关。

### 🔄 OpenClaw Manager 自更新
在应用设置中获取自动空中（OTA）更新！当新版本发布时，你会收到通知，拉取最新版本，并安全重启使用新功能 — 无需手动重新安装！

---

## 📁 项目结构

```
openclaw-manager/
├── src-tauri/                 # Rust 后端
│   ├── src/
│   │   ├── main.rs            # 入口点
│   │   ├── commands/          # 后端逻辑（配置、安装、服务等）
│   │   ├── models/            # 数据结构
│   │   └── utils/             # 工具函数
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── src/                       # React 前端
│   ├── components/            # UI 组件（仪表盘、设置、功能模块）
│   ├── hooks/                 # 自定义 Hooks
│   ├── lib/                   # API 绑定
│   ├── stores/                # 状态管理（Zustand）
│   └── styles/                # Tailwind CSS
│
├── package.json
└── vite.config.ts
```

---

## 🛠️ 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 前端 | React 18 | UI 框架 |
| 状态 | Zustand | 轻量级响应式状态管理 |
| 样式 | TailwindCSS | 实用优先的 CSS |
| 动画 | Framer Motion | 流畅过渡与微交互 |
| 后端 | Rust | 高性能系统操作 |
| 桌面 | Tauri 2.0 | 原生跨平台应用壳 |

---

## 🚀 快速开始（开发）

### 前置条件

| 工具 | 版本 | 下载地址 |
|------|------|----------|
| **Node.js** | >= 18.0 | [nodejs.org](https://nodejs.org/) |
| **Rust** | >= 1.70 | [rustup.rs](https://rustup.rs/) |
| **pnpm** 或 npm | 最新版 | 随 Node.js 一起安装 |

### 克隆并运行

```bash
git clone https://github.com/qunf/myOpenClawManager.git
cd myOpenClawManager

npm install          # 安装依赖
npm run tauri:dev    # 启动开发模式（热重载）
```

> **注意：** 首次构建会编译所有 Rust 依赖，大约需要 **3-5 分钟**。后续运行会快很多。

### 构建发布版本

```bash
npm run tauri:build
```

输出位于 `src-tauri/target/release/bundle/`：

| 平台 | 格式 |
|------|------|
| macOS | `.dmg`、`.app` |
| Windows | `.msi`、`.exe` |
| Linux | `.deb`、`.AppImage` |

---

## 🤝 参与贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m '添加某个功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

---

## 📄 许可证

MIT 许可证 — 详见 [LICENSE](LICENSE)。

---

**由 OpenClaw 社区用心制作 ❤️**
