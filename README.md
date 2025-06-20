# NotifyMeMaybe

**A powerful MCP (Model Context Protocol) server for multi-platform notifications and interactive AI workflows**

[![npm version](https://badge.fury.io/js/notify-me-maybe-mcp.svg)](https://www.npmjs.com/package/notify-me-maybe-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 TLDR - Quick Start

**Get started in 2 minutes:**

1. **Create Telegram Bot**: 
   - Message [@BotFather](https://t.me/botfather) on Telegram
   - Use `/newbot` to create a bot and get your `BOT_TOKEN`
   - Start a chat with your bot and get your `CHAT_ID`

2. **Add to MCP Configuration**:
   ```json
   {
     "mcpServers": {
       "notify-me-maybe": {
         "command": "npx",
         "args": ["-y", "notify-me-maybe-mcp"],
         "env": {
           "TELEGRAM_BOT_TOKEN": "your_bot_token_here",
           "TELEGRAM_CHAT_ID": "your_chat_id_here",
           "TELEGRAM_PROMPT_ENABLED": "true",
           "TELEGRAM_INTERACTION_ENABLED": "true",
           "DEFAULT_NOTIFICATION_SERVICE": "telegram",
           "LANGUAGE": "en"
         }
       }
     }
   }
   ```

3. **Restart Your AI Assistant**:
   - **Claude Desktop**: Restart the application
   - **Cursor**: Restart and activate the MCP configuration

4. **Test**: Ask your AI assistant to send you a notification!

**That's it!** 🎉 No installation, no cloning, no building required.

---

## 🌐 Language Support

- **English** (Current) - You are here
- **[繁體中文](docs/zh-tw/readme.md)** - Traditional Chinese
- **[简体中文](docs/zh-cn/readme.md)** - Simplified Chinese

## 🤖 AI Assistant Integration (Agent Prompts)

**Ready to integrate with your AI assistant?** Choose the right prompt configuration for your needs:

### 📋 Available Agent Prompt Configurations

| Prompt Type | Description | Best For | Key Tools |
|-------------|-------------|----------|-----------|
| **[Notification Only](#notification-only-mode)** | Simple task completion notifications | Basic notification needs | `send_notification`, `broadcast_notification` |
| **[Interactive Basic](#interactive-mode)** | Telegram interactions + notifications | User input & confirmations | `request_interaction_sync`, `send_notification` |
| **[Interactive Advanced](#advanced-interactive-mode)** | Continuous workflow with follow-up prompts | Complex multi-step tasks | `get_telegram_prompts`, `process_telegram_prompt`, `request_interaction_sync` |

### 🎯 Quick Start for AI Assistants

1. Choose a prompt type below
2. Copy the complete prompt configuration
3. Add to your AI assistant system prompt (Cursor, Claude, etc.)
4. Configure your NotifyMeMaybe services
5. Start getting notifications and interactions!

## Features

### 🔔 Multi-Channel Notifications
- **Telegram Integration**: Send notifications directly to Telegram chats
- **Webhook Support**: HTTP webhook notifications for custom integrations
- **Priority Levels**: High, normal, and low priority notifications
- **Rich Metadata**: Attach custom data to notifications

### 🤖 Interactive Prompt Engine
The core feature of NotifyMeMaybe is its sophisticated prompt engine that enables bi-directional communication between AI systems and users:

#### Interaction Types
- **Confirmation Requests**: Yes/No decisions with button interfaces
- **Text Prompts**: Collect text input from users
- **Selection Menus**: Multiple choice options with custom buttons
- **Synchronous & Asynchronous**: Both real-time and queued interactions

#### AI Workflow Integration
- **MCP (Model Context Protocol) Compatible**: Seamlessly integrates with Claude and other AI systems
- **Timeout Management**: Configurable timeouts with fallback handling
- **Queue Management**: Handle multiple concurrent user interactions
- **Response Validation**: Ensure proper user response formatting

#### Advanced Features
- **Auto-reject**: Automatically handle expired interactions
- **Broadcast Notifications**: Send to all active channels simultaneously
- **Service Health Monitoring**: Real-time status of all notification services
- **Internationalization**: Multi-language support (English, Traditional Chinese, Simplified Chinese)

## Agent Prompt Configurations

### 1. 📢 Notification-Only Mode

**Copy this prompt configuration for your AI assistant:**

```
## NotifyMeMaybe Notification-Only Mode Configuration

### When to use NotifyMeMaybe tools:
- **ALWAYS** notify when tasks are completed
- Send progress updates for long-running operations
- Notify on errors or important status changes

### Required MCP Tools Usage:

#### Task Completion Notifications:
Use `send_notification` or `broadcast_notification` when:
- Any task is completed successfully
- An error occurs during task execution
- Important milestones are reached

Parameters:
- service: "telegram" (or use broadcast_notification for all services)
- title: Clear, concise summary of what was accomplished
- message: Detailed results, file paths, URLs, or error details
- priority: "high" (errors), "normal" (completions), "low" (progress updates)
- metadata: Include relevant context like file paths, timestamps, etc.

#### Example Usage:
send_notification(
  service="telegram",
  title="Task Completed: Code Analysis",
  message="Successfully analyzed 15 files and found 3 potential issues. Results saved to /reports/analysis.json",
  priority="normal",
  metadata={"files_analyzed": 15, "issues_found": 3, "report_path": "/reports/analysis.json"}
)

### Service Health Check:
Use `test_services` periodically to ensure services are available.
```

### 2. 🔄 Interactive Mode

**Copy this prompt configuration for your AI assistant:**

```
## NotifyMeMaybe Interactive Mode Configuration

### When to use NotifyMeMaybe tools:
- Request user input when clarification is needed
- Ask for confirmations before major operations
- Provide selection menus for user choices
- Send completion notifications

### Required MCP Tools Usage:

#### User Interaction Requests:
Use `request_interaction_sync` when:
- You need user confirmation before proceeding
- You require text input from the user
- You want to offer multiple choice options

Parameters:
- type: "confirmation" (Yes/No), "prompt" (text input), "selection" (multiple choice)
- message: Clear question or request for user
- options: Array of choices (only for type="selection")
- timeout: 60000 (60 seconds) or appropriate timeout

#### Examples:

Confirmation Request:
request_interaction_sync(
  type="confirmation",
  message="Do you want to proceed with deleting 5 files from the project directory?"
)

Text Input Request:
request_interaction_sync(
  type="prompt",
  message="Please provide the target deployment environment (staging/production):"
)

Selection Menu:
request_interaction_sync(
  type="selection",
  message="Choose the deployment strategy:",
  options=["Blue-Green Deployment", "Rolling Update", "Canary Release"]
)

#### Completion Notifications:
Always send completion notifications using `send_notification` after tasks finish.

#### Error Handling:
- Handle interaction timeouts gracefully
- Provide fallback responses if user doesn't respond
- Use high priority notifications for critical errors
```

### 3. 🚀 Advanced Interactive Mode

**Copy this complete prompt configuration for your AI assistant:**

```
## NotifyMeMaybe Advanced Interactive Mode Configuration

### Core Agent Behavior Rules:
- **ALWAYS** check for new Telegram prompts at session start
- **NEVER** end a session without asking for additional requests
- **ALWAYS** process pending prompts before starting new tasks
- **ALWAYS** send progress notifications for long operations

### Required MCP Tools Usage Protocol:

#### 1. Session Start Protocol:
ALWAYS execute at the beginning of each session:

1. Check for pending prompts:
   get_telegram_prompts()

2. If prompts exist, process each one:
   process_telegram_prompt(
     promptId="<prompt_id>",
     response="Received your request. Processing now..."
   )

3. Send status notification:
   send_notification(
     service="telegram",
     title="AI Session Started",
     message="Processing your Telegram requests. Session active.",
     priority="normal"
   )

#### 2. Task Execution Protocol:
During task execution:

1. Send progress updates for long operations:
   send_notification(
     service="telegram",
     title="Progress Update",
     message="Step 2/5 completed: Database backup finished",
     priority="normal",
     metadata={"step": 2, "total_steps": 5}
   )

2. Use interactions when user input needed:
   request_interaction_sync(
     type="confirmation",
     message="Ready to proceed with database migration. Continue?"
   )

3. Handle errors with high priority:
   send_notification(
     service="telegram",
     title="Error Occurred",
     message="Database connection failed. Retrying in 30 seconds...",
     priority="high"
   )

#### 3. Session End Protocol:
**MANDATORY**: Never end without this sequence:

1. Send completion notification:
   send_notification(
     service="telegram",
     title="Task Completed Successfully",
     message="All requested operations completed. Summary: [detailed results]",
     priority="normal"
   )

2. ALWAYS ask for additional requests:
   request_interaction_sync(
     type="prompt",
     message="Task completed successfully. Do you have any additional instructions or follow-up requests?",
     timeout=60000
   )

3. Continue interaction loop until user indicates completion
4. Only stop when user explicitly says "finished", "done", "no more tasks", or similar

#### 4. Telegram Prompt Monitoring:
Regularly check for new prompts:
- Use get_telegram_prompts() to check queue
- Process immediately with process_telegram_prompt()
- Prioritize user prompts over automated tasks

#### 5. Service Health Monitoring:
Periodically verify services:
test_services()
get_service_status(service="telegram")

### Advanced Mode Benefits:
- Users can send tasks anytime via Telegram
- AI automatically processes queued requests
- Continuous workflow without manual intervention
- Comprehensive progress tracking
- Error recovery with user guidance
```

## 📦 Installation & Setup

### 🌟 Method 1: NPX (Recommended)

Add to your MCP configuration file:

**Configuration File Locations:**
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "notify-me-maybe": {
      "command": "npx",
      "args": ["-y", "notify-me-maybe-mcp"],
      "env": {
        "TELEGRAM_BOT_TOKEN": "your_bot_token_here",
        "TELEGRAM_CHAT_ID": "your_chat_id_here",
        "TELEGRAM_PROMPT_ENABLED": "true",
        "TELEGRAM_INTERACTION_ENABLED": "true",
        "DEFAULT_NOTIFICATION_SERVICE": "telegram",
        "LANGUAGE": "en"
      }
    }
  }
}
```

> **⚠️ Important**: After configuration, restart your AI assistant completely.

### 🛠️ Method 2: Local Development

For developers who want to modify the code:

```bash
git clone https://github.com/keoy7am/NotifyMeMaybe.git
cd NotifyMeMaybe
npm install
npm run build
```

### 📱 Getting Telegram Credentials

1. **Create Bot**: Message [@BotFather](https://t.me/botfather) → `/newbot`
2. **Get Chat ID**: Send message to your bot, visit `https://api.telegram.org/bot<TOKEN>/getUpdates`

## 🔧 Configuration

### Required Variables
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

### Optional Variables
```env
TELEGRAM_PROMPT_ENABLED=true
TELEGRAM_INTERACTION_ENABLED=true
DEFAULT_NOTIFICATION_SERVICE=telegram
LANGUAGE=en
```

## 🛠️ MCP Tools

- `send_notification`: Send to specific service
- `broadcast_notification`: Send to all services
- `request_interaction_sync`: Synchronous user interaction
- `test_services`: Health check all services
- `get_telegram_prompts`: Retrieve pending prompts
- `process_telegram_prompt`: Process Telegram prompts

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🎯 Ready to Get Started?

### Quick Start (Recommended)
1. Get [Telegram bot token](#-getting-telegram-credentials)
2. Add [MCP configuration](#-method-1-npx-recommended)
3. Restart your AI assistant
4. Test with a notification!

### Advanced Setup
1. Choose an [Agent Prompt Configuration](#agent-prompt-configurations)
2. Copy to your AI assistant system prompt
3. Configure advanced features
4. Build interactive workflows!

### 📦 NPM Package
```bash
npm view notify-me-maybe-mcp
npx notify-me-maybe-mcp  # Use directly
```

**NotifyMeMaybe** - Making AI-human interaction seamless! 🚀

> 💡 **Pro Tip**: Don't forget to restart your AI assistant after configuration! 