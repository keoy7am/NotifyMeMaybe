# NotifyMeMaybe

**强大的 MCP（模型上下文协议）服务器，支持多平台通知和交互式 AI 工作流程**

## 🌐 语言支持

- **[English](../../README.md)** - 英文版
- **[繁體中文](../zh-tw/readme.md)** - 繁体中文版
- **简体中文** (当前页面) - 您在这里

## 🤖 AI 助手集成（Agent 提示词）

**准备集成您的 AI 助手？** 选择适合您需求的提示词配置：

### 📋 可用的 Agent 提示词配置

| 提示词类型                           | 描述                   | 适用场景       | 主要工具                                                                            |
| ------------------------------------ | ---------------------- | -------------- | ----------------------------------------------------------------------------------- |
| **[纯通知模式](#纯通知模式)**     | 简单的任务完成通知     | 基本通知需求   | `send_notification`, `broadcast_notification`                                   |
| **[基本交互模式](#基本交互模式)** | Telegram 交互 + 通知   | 用户输入和确认 | `request_interaction_sync`, `send_notification`                                 |
| **[高级交互模式](#高级交互模式)** | 持续工作流程与后续提示 | 复杂多步骤任务 | `get_telegram_prompts`, `process_telegram_prompt`, `request_interaction_sync` |

### 🎯 AI 助手快速开始

1. 选择下方的提示词类型
2. 复制完整的提示词配置
3. 添加到您的 AI 助手系统提示词中（Cursor、Claude 等）
4. 配置您的 NotifyMeMaybe 服务
5. 开始接收通知和交互！

## 功能特色

### 🔔 多通道通知

- **Telegram 集成**：直接发送通知到 Telegram 聊天室
- **Webhook 支持**：HTTP webhook 通知以供自定义集成
- **优先级别**：高、中、低优先级通知
- **丰富元数据**：为通知附加自定义数据

### 🤖 交互式提示引擎

NotifyMeMaybe 的核心功能是其精密的提示引擎，能够实现 AI 系统与用户之间的双向沟通：

#### 交互类型

- **确认请求**：通过按钮界面进行是/否决策
- **文字提示**：收集用户的文字输入
- **选择菜单**：具有自定义按钮的多选项目
- **同步与异步**：支持实时和队列交互

#### AI 工作流程集成

- **MCP（模型上下文协议）兼容**：与 Claude 和其他 AI 系统无缝集成
- **超时管理**：可配置的超时处理与回退机制
- **队列管理**：处理多个同时进行的用户交互
- **响应验证**：确保适当的用户响应格式

#### 高级功能

- **自动拒绝**：自动处理过期的交互
- **广播通知**：同时发送到所有活跃通道
- **服务健康监控**：实时监控所有通知服务状态
- **国际化**：多语言支持（英文、繁体中文、简体中文）

## Agent 提示词配置

### 1. 📢 纯通知模式

**为您的 AI 助手复制此提示词配置：**

```
## NotifyMeMaybe 纯通知模式配置

### 何时使用 NotifyMeMaybe 工具：
- **总是**在任务完成时通知
- 为长时间执行的操作发送进度更新
- 在错误或重要状态变更时通知

### 必要的 MCP 工具使用：

#### 任务完成通知：
在以下情况使用 `send_notification` 或 `broadcast_notification`：
- 任何任务成功完成时
- 任务执行期间发生错误时
- 达到重要里程碑时

参数：
- service: "telegram"（或使用 broadcast_notification 发送到所有服务）
- title: 清晰、简洁的完成事项摘要
- message: 详细结果、文件路径、URL 或错误详情
- priority: "high"（错误）、"normal"（完成）、"low"（进度更新）
- metadata: 包含相关上下文，如文件路径、时间戳等

#### 使用范例：
send_notification(
  service="telegram",
  title="任务完成：代码分析",
  message="成功分析了 15 个文件，发现 3 个潜在问题。结果已保存至 /reports/analysis.json",
  priority="normal",
  metadata={"files_analyzed": 15, "issues_found": 3, "report_path": "/reports/analysis.json"}
)

### 服务健康检查：
定期使用 `test_services` 确保服务可用。
```

### 2. 🔄 基本交互模式

**为您的 AI 助手复制此提示词配置：**

```
## NotifyMeMaybe 基本交互模式配置

### 何时使用 NotifyMeMaybe 工具：
- 需要澄清时请求用户输入
- 在主要操作前询问确认
- 提供选择菜单供用户选择
- 发送完成通知

### 必要的 MCP 工具使用：

#### 用户交互请求：
在以下情况使用 `request_interaction_sync`：
- 您需要用户确认才能继续
- 您需要用户的文字输入
- 您想要提供多项选择选项

参数：
- type: "confirmation"（是/否）、"prompt"（文字输入）、"selection"（多项选择）
- message: 清晰的问题或用户请求
- options: 选项数组（仅用于 type="selection"）
- timeout: 60000（60秒）或适当的超时时间

#### 范例：

确认请求：
request_interaction_sync(
  type="confirmation",
  message="您要继续从项目目录删除 5 个文件吗？"
)

文字输入请求：
request_interaction_sync(
  type="prompt",
  message="请提供目标部署环境（staging/production）："
)

选择菜单：
request_interaction_sync(
  type="selection",
  message="选择部署策略：",
  options=["蓝绿部署", "滚动更新", "金丝雀发布"]
)

#### 完成通知：
任务完成后总是使用 `send_notification` 发送完成通知。

#### 错误处理：
- 优雅地处理交互超时
- 如果用户没有响应，提供回退响应
- 对关键错误使用高优先级通知
```

### 3. 🚀 高级交互模式

**为您的 AI 助手复制此完整提示词配置：**

```
## NotifyMeMaybe 高级交互模式配置

### 核心 Agent 行为规则：
- **总是**在会话开始时检查新的 Telegram 提示
- **绝不**在没有询问额外请求的情况下结束会话
- **总是**在开始新任务前处理待处理的提示
- **总是**为长时间操作发送进度通知

### 必要的 MCP 工具使用协议：

#### 1. 会话开始协议：
在每个会话开始时总是执行：

1. 检查待处理的提示：
   get_telegram_prompts()

2. 如果存在提示，处理每一个：
   process_telegram_prompt(
     promptId="<prompt_id>",
     response="已收到您的请求。正在处理..."
   )

3. 发送状态通知：
   send_notification(
     service="telegram",
     title="AI 会话已开始",
     message="正在处理您的 Telegram 请求。会话活跃中。",
     priority="normal"
   )

#### 2. 任务执行协议：
在任务执行期间：

1. 为长时间操作发送进度更新：
   send_notification(
     service="telegram",
     title="进度更新",
     message="步骤 2/5 完成：数据库备份已完成",
     priority="normal",
     metadata={"step": 2, "total_steps": 5}
   )

2. 需要用户输入时使用交互：
   request_interaction_sync(
     type="confirmation",
     message="准备继续数据库迁移。继续吗？"
   )

3. 以高优先级处理错误：
   send_notification(
     service="telegram",
     title="发生错误",
     message="数据库连接失败。30 秒后重试...",
     priority="high"
   )

#### 3. 会话结束协议：
**强制性**：绝不在没有此序列的情况下结束：

1. 发送完成通知：
   send_notification(
     service="telegram",
     title="任务成功完成",
     message="所有请求的操作已完成。摘要：[详细结果]",
     priority="normal"
   )

2. 总是询问额外请求：
   request_interaction_sync(
     type="prompt",
     message="任务成功完成。您有任何额外的指示或后续请求吗？",
     timeout=60000
   )

3. 继续交互循环直到用户表示完成
4. 只有当用户明确说"完成"、"结束"、"没有更多任务"或类似词语时才停止

#### 4. Telegram 提示监控：
定期检查新提示：
- 使用 get_telegram_prompts() 检查队列
- 立即使用 process_telegram_prompt() 处理
- 优先处理用户提示而非自动化任务

#### 5. 服务健康监控：
定期验证服务：
test_services()
get_service_status(service="telegram")

### 高级模式优势：
- 用户可随时通过 Telegram 发送任务
- AI 自动处理队列请求
- 无需手动干预的持续工作流程
- 全面的进度跟踪
- 用户指导的错误恢复
```

## 用户如何运用 NotifyMeMaybe

### 💬 Telegram 集成使用

#### 纯通知模式：

- 直接在 Telegram 接收任务完成更新
- 获取长时间执行操作的实时状态
- 远程监控 AI 代理活动

#### 基本交互模式：

- 通过 Telegram 按钮响应 AI 问题
- 在 AI 需要澄清时提供输入
- 通过交互菜单做出决策

#### 高级交互模式：

**高级模式用户指南：**

1. **向 AI 发送任务：**

   - 打开您的 Telegram 机器人聊天
   - 直接输入您的任务或指示
   - AI 将在下次会话中自动接收您的消息
2. **Telegram 指令范例：**

   ```
   "分析最新的销售数据并创建摘要报告"
   "使用新的 API 变更更新项目文档"
   "运行测试套件并修复任何失败的测试"
   "将应用程序部署到预备环境"
   "审查拉取请求 #123 并提供反馈"
   ```
3. **任务队列管理：**

   - 可以将多个任务排入队列
   - AI 按顺序处理它们
   - 每个任务都会收到单独的状态更新
4. **交互工作流程：**

   - AI 会在需要时询问后续问题
   - 使用 Telegram 按钮快速响应
   - 对复杂请求输入详细响应
5. **持续操作：**

   - AI 总是在完成后询问您是否有更多任务
   - 为相关任务保持对话进行
   - 说"暂时就这样"或"完成"来结束

### 🔧 配置范例

#### MCP 服务器配置：
适用于 Claude Desktop 或其他 MCP 客户端，将此配置添加到您的 MCP 配置文件中：

```json
{
  "mcpServers": {
    "notify-me-maybe": {
      "command": "node",
      "args": ["A:/path/to/NotifyMeMaybe/dist/index.js"],
      "env": {
        "TELEGRAM_BOT_TOKEN": "1234567890:ABCDEF-your_bot_token_here",
        "TELEGRAM_CHAT_ID": "your_chat_id_here",
        "TELEGRAM_PROMPT_ENABLED": "true",
        "TELEGRAM_ENABLE_PROMPT_RECEIVING": "true",
        "TELEGRAM_INTERACTION_ENABLED": "true",
        "TELEGRAM_INTERACTION_TIMEOUT": "300000",
        "TELEGRAM_INTERACTION_MAX_PENDING": "5",
        "CUSTOM_WEBHOOK_URL": "your_custom_webhook_url_here",
        "CUSTOM_WEBHOOK_SECRET": "your_webhook_secret_here",
        "DEFAULT_NOTIFICATION_SERVICE": "telegram",
        "LANGUAGE": "zh-CN",
        "DEBUG": "false"
      }
    }
  }
}
```

#### Claude Desktop 配置文件位置：

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

#### 环境变量（.env 文件）：
用于本地开发和测试：

```env
# Telegram 配置（必需）
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
TELEGRAM_PROMPT_ENABLED=true
TELEGRAM_ENABLE_PROMPT_RECEIVING=true
TELEGRAM_INTERACTION_ENABLED=true
TELEGRAM_INTERACTION_TIMEOUT=300000
TELEGRAM_INTERACTION_MAX_PENDING=5

# 自定义 Webhook 配置（可选）
CUSTOM_WEBHOOK_URL=your_custom_webhook_url_here
CUSTOM_WEBHOOK_SECRET=your_webhook_secret_here

# 系统配置
DEFAULT_NOTIFICATION_SERVICE=telegram
LANGUAGE=zh-CN
DEBUG=false
```

## 安装

1. **克隆仓库**

   ```bash
   git clone https://github.com/yourusername/NotifyMeMaybe.git
   cd NotifyMeMaybe
   ```
2. **安装依赖项**

   ```bash
   npm install
   ```
3. **配置环境**

   ```bash
   cp .env.example .env
   # 编辑 .env 填入您的配置
   ```
4. **构建项目**

   ```bash
   npm run build
   ```

## 配置

### 环境变量
```env
# Telegram 配置（必需）
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
TELEGRAM_PROMPT_ENABLED=true
TELEGRAM_ENABLE_PROMPT_RECEIVING=true
TELEGRAM_INTERACTION_ENABLED=true
TELEGRAM_INTERACTION_TIMEOUT=300000
TELEGRAM_INTERACTION_MAX_PENDING=5

# 自定义 Webhook 配置（可选）
CUSTOM_WEBHOOK_URL=your_custom_webhook_url_here
CUSTOM_WEBHOOK_SECRET=your_webhook_secret_here

# 系统配置
DEFAULT_NOTIFICATION_SERVICE=telegram
LANGUAGE=zh-CN
DEBUG=false
```

### MCP 配置
将以下内容添加到您的 MCP 配置文件：
```json
{
  "mcpServers": {
    "notify-me-maybe": {
      "command": "node",
      "args": ["A:/path/to/NotifyMeMaybe/dist/index.js"],
      "env": {
        "TELEGRAM_BOT_TOKEN": "your_token",
        "TELEGRAM_CHAT_ID": "your_chat_id",
        "TELEGRAM_PROMPT_ENABLED": "true",
        "TELEGRAM_ENABLE_PROMPT_RECEIVING": "true",
        "TELEGRAM_INTERACTION_ENABLED": "true",
        "TELEGRAM_INTERACTION_TIMEOUT": "300000",
        "TELEGRAM_INTERACTION_MAX_PENDING": "5",
        "DEFAULT_NOTIFICATION_SERVICE": "telegram",
        "LANGUAGE": "zh-CN",
        "DEBUG": "false"
      }
    }
  }
}
```

## 使用方法

### 基本通知

```javascript
// 发送简单通知
await notificationManager.sendNotification('telegram', {
  title: '任务完成',
  message: '您的 AI 任务已成功完成！',
  priority: 'normal'
});
```

### 交互提示

```javascript
// 请求用户确认
const response = await interactionService.requestConfirmation(
  '您要继续部署吗？'
);

// 获取用户文字输入
const userInput = await interactionService.requestPrompt(
  '请提供部署环境：'
);

// 多项选择
const choice = await interactionService.requestSelection(
  '选择部署策略：',
  ['蓝绿', '滚动', '金丝雀']
);
```

### MCP 工具使用

与 Claude 或其他 MCP 兼容的 AI 系统集成时：

```
# 发送通知
send_notification(
  service="telegram",
  title="AI 任务更新",
  message="处理完成，等待下一个指示"
)

# 请求用户交互
request_interaction_sync(
  type="prompt",
  message="您希望我接下来做什么？"
)
```

## 提示引擎架构

提示引擎专为无缝的 AI-人类协作而设计：

1. **请求阶段**：AI 系统发送交互请求
2. **传递阶段**：通知发送到配置的通道
3. **响应阶段**：用户通过按钮/文字输入响应
4. **处理阶段**：响应验证并返回给 AI
5. **完成阶段**：交互标记为完成

### 超时处理

- 默认超时：60 秒
- 每个请求可配置
- 超时时自动拒绝
- 提供回退响应

### 队列管理

- 最多 5 个同时交互
- FIFO 处理顺序
- 自动清理过期请求
- 实时状态监控

## API 参考

### 核心服务

- `NotificationManager`：处理所有通知路由
- `InteractionService`：管理用户交互
- `TelegramService`：Telegram 特定实现
- `WebhookService`：HTTP webhook 通知
- `PromptService`：Telegram 提示处理

### MCP 工具

- `send_notification`：发送到特定服务
- `broadcast_notification`：发送到所有服务
- `request_interaction_sync`：同步用户交互
- `test_services`：健康检查所有服务
- `list_services`：获取可用服务
- `get_telegram_prompts`：检索待处理的 Telegram 提示
- `process_telegram_prompt`：处理并响应 Telegram 提示

## 开发

```bash
# 开发模式
npm run dev

# 构建项目
npm run build

# 运行测试
npm test

# 代码检查
npm run lint
```

## 贡献

欢迎为 NotifyMeMaybe 贡献！以下是您可以帮助的方式：

### 开始使用

1. 在 GitHub 上 Fork 仓库
2. 在本地克隆您的 fork：
   ```bash
   git clone https://github.com/yourusername/NotifyMeMaybe.git
   cd NotifyMeMaybe
   ```
3. 创建功能分支：
   ```bash
   git checkout -b feature/your-amazing-feature
   ```
4. 进行更改并彻底测试
5. 提交您的更改：
   ```bash
   git commit -m '添加惊人功能'
   ```
6. 推送到您的 fork：
   ```bash
   git push origin feature/your-amazing-feature
   ```
7. 在 GitHub 上打开拉取请求

### 贡献指南

- 遵循现有的代码风格和惯例
- 为新功能添加测试
- 根据需要更新文档
- 确保在提交前所有测试都通过
- 编写清晰、描述性的提交消息

### 贡献领域

- 额外的通知服务（Discord、Slack 等）
- 增强的提示引擎功能
- 性能优化
- 文档改进
- 错误修复和测试

## 许可

此项目依据 MIT 许可证许可。详见 [LICENSE](../../LICENSE) 文件。

### MIT 许可证

```
MIT 许可证

版权所有 (c) 2025 NotifyMeMaybe 贡献者

特此免费授予任何获得此软件及相关文档文件（"软件"）副本的人不受限制地
处理软件的权利，包括但不限于使用、复制、修改、合并、发布、分发、再许可
和/或销售软件副本的权利，并允许获得软件的人员这样做，但须符合以下条件：

上述版权声明和本许可声明应包含在软件的所有副本或重要部分中。

软件按"现状"提供，不提供任何形式的明示或暗示保证，包括但不限于适销性、
特定用途适用性和非侵权性的保证。在任何情况下，作者或版权持有人均不对
任何索赔、损害或其他责任负责，无论是在合同、侵权或其他方面的诉讼中，
由软件或软件的使用或其他处理引起、源于或与之相关。
```

## 支持

如需支持和问题：

- 在 GitHub 上创建 issue
- 检查 `/docs` 文件夹中的文档
- 查看 `/examples` 中的范例配置
- 加入我们的社区讨论

## 路线图

- [ ] Discord 集成
- [ ] Slack 通知
- [ ] 增强的 webhook 功能
- [ ] 实时仪表板
- [ ] 自定义服务的插件系统
- [ ] 高级分析和日志记录

---

**准备开始了吗？**

1. 选择上方的 [Agent 提示词配置](#agent-提示词配置)
2. 将完整提示词复制到您的 AI 助手
3. 配置您的 NotifyMeMaybe 服务
4. 开始构建交互式 AI 工作流程！

**NotifyMeMaybe** - 让 AI 与人类的交互无缝衔接，一次一个通知！🚀
