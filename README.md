# NotifyMeMaybe

**A powerful MCP (Model Context Protocol) server for multi-platform notifications and interactive AI workflows**

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

## How Users Can Leverage NotifyMeMaybe

### 💬 Telegram Integration Usage

#### For Notification-Only Mode:
- Receive task completion updates directly in Telegram
- Get real-time status of long-running operations
- Monitor AI agent activities remotely

#### For Interactive Mode:
- Respond to AI questions through Telegram buttons
- Provide input when AI needs clarification
- Make decisions through interactive menus

#### For Advanced Interactive Mode:

**Advanced Mode User Guide:**

1. **Sending Tasks to AI:**
   - Open your Telegram bot chat
   - Type your task or instruction directly
   - AI will automatically pick up your message on next session

2. **Example Telegram Commands:**
   ```
   "Analyze the latest sales data and create a summary report"
   "Update the project documentation with new API changes"
   "Run the test suite and fix any failing tests"
   "Deploy the application to staging environment"
   "Review pull request #123 and provide feedback"
   ```

3. **Task Queue Management:**
   - Multiple tasks can be queued
   - AI processes them in order
   - Each task gets individual status updates

4. **Interactive Workflow:**
   - AI will ask follow-up questions when needed
   - Use Telegram buttons for quick responses
   - Type detailed responses for complex requests

5. **Continuous Operation:**
   - AI always asks if you have more tasks after completion
   - Keep the conversation going for related tasks
   - End by saying "That's all for now" or "Finished"

### 🔧 Configuration Examples

#### MCP Server Configuration:
For Claude Desktop or other MCP clients, add this to your MCP configuration file:

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
        "LANGUAGE": "en",
        "DEBUG": "false"
      }
    }
  }
}
```

#### Claude Desktop Configuration File Locations:

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

#### Environment Variables (.env file):
For local development and testing:

```env
# Telegram Configuration (Required)
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
TELEGRAM_PROMPT_ENABLED=true
TELEGRAM_ENABLE_PROMPT_RECEIVING=true
TELEGRAM_INTERACTION_ENABLED=true
TELEGRAM_INTERACTION_TIMEOUT=300000
TELEGRAM_INTERACTION_MAX_PENDING=5

# Custom Webhook Configuration (Optional)
CUSTOM_WEBHOOK_URL=your_custom_webhook_url_here
CUSTOM_WEBHOOK_SECRET=your_webhook_secret_here

# System Configuration
DEFAULT_NOTIFICATION_SERVICE=telegram
LANGUAGE=en
DEBUG=false
```

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/NotifyMeMaybe.git
   cd NotifyMeMaybe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

## Configuration

### Environment Variables
```env
# Telegram Configuration (Required)
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
TELEGRAM_PROMPT_ENABLED=true
TELEGRAM_ENABLE_PROMPT_RECEIVING=true
TELEGRAM_INTERACTION_ENABLED=true
TELEGRAM_INTERACTION_TIMEOUT=300000
TELEGRAM_INTERACTION_MAX_PENDING=5

# Custom Webhook Configuration (Optional)
CUSTOM_WEBHOOK_URL=your_custom_webhook_url_here
CUSTOM_WEBHOOK_SECRET=your_webhook_secret_here

# System Configuration
DEFAULT_NOTIFICATION_SERVICE=telegram
LANGUAGE=en
DEBUG=false
```

### MCP Configuration
Add to your MCP configuration file:
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
        "LANGUAGE": "en",
        "DEBUG": "false"
      }
    }
  }
}
```

## Usage

### Basic Notification
```javascript
// Send a simple notification
await notificationManager.sendNotification('telegram', {
  title: 'Task Complete',
  message: 'Your AI task has finished successfully!',
  priority: 'normal'
});
```

### Interactive Prompts
```javascript
// Request user confirmation
const response = await interactionService.requestConfirmation(
  'Do you want to proceed with the deployment?'
);

// Get text input from user
const userInput = await interactionService.requestPrompt(
  'Please provide the deployment environment:'
);

// Multiple choice selection
const choice = await interactionService.requestSelection(
  'Choose deployment strategy:',
  ['Blue-Green', 'Rolling', 'Canary']
);
```

### MCP Tool Usage
When integrated with Claude or other MCP-compatible AI systems:

```
# Send notification
send_notification(
  service="telegram",
  title="AI Task Update",
  message="Processing complete, awaiting next instruction"
)

# Request user interaction
request_interaction_sync(
  type="prompt",
  message="What would you like me to do next?"
)
```

## Prompt Engine Architecture

The prompt engine is designed for seamless AI-human collaboration:

1. **Request Phase**: AI system sends interaction request
2. **Delivery Phase**: Notification sent to configured channels
3. **Response Phase**: User responds via buttons/text input
4. **Processing Phase**: Response validated and returned to AI
5. **Completion Phase**: Interaction marked as complete

### Timeout Handling
- Default timeout: 60 seconds
- Configurable per request
- Auto-reject on timeout
- Fallback responses available

### Queue Management
- Maximum 5 concurrent interactions
- FIFO processing order
- Automatic cleanup of expired requests
- Real-time status monitoring

## API Reference

### Core Services
- `NotificationManager`: Handles all notification routing
- `InteractionService`: Manages user interactions
- `TelegramService`: Telegram-specific implementation
- `WebhookService`: HTTP webhook notifications
- `PromptService`: Telegram prompt processing

### MCP Tools
- `send_notification`: Send to specific service
- `broadcast_notification`: Send to all services
- `request_interaction_sync`: Synchronous user interaction
- `test_services`: Health check all services
- `list_services`: Get available services
- `get_telegram_prompts`: Retrieve pending Telegram prompts
- `process_telegram_prompt`: Process and respond to Telegram prompts

## Development

```bash
# Development mode
npm run dev

# Build project
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## Contributing

We welcome contributions to NotifyMeMaybe! Here's how you can help:

### Getting Started
1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/yourusername/NotifyMeMaybe.git
   cd NotifyMeMaybe
   ```
3. Create a feature branch:
   ```bash
   git checkout -b feature/your-amazing-feature
   ```
4. Make your changes and test thoroughly
5. Commit your changes:
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. Push to your fork:
   ```bash
   git push origin feature/your-amazing-feature
   ```
7. Open a Pull Request on GitHub

### Contribution Guidelines
- Follow the existing code style and conventions
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass before submitting
- Write clear, descriptive commit messages

### Areas for Contribution
- Additional notification services (Discord, Slack, etc.)
- Enhanced prompt engine features
- Performance optimizations
- Documentation improvements
- Bug fixes and testing

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### MIT License

```
MIT License

Copyright (c) 2025 NotifyMeMaybe Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in the `/docs` folder
- Review example configurations in `/examples`
- Join our community discussions

## Roadmap

- [ ] Discord integration
- [ ] Slack notifications
- [ ] Enhanced webhook features
- [ ] Real-time dashboard
- [ ] Plugin system for custom services
- [ ] Advanced analytics and logging

---

**Ready to get started?**

1. Choose an [Agent Prompt Configuration](#agent-prompt-configurations) above
2. Copy the complete prompt to your AI assistant
3. Configure your NotifyMeMaybe services
4. Start building interactive AI workflows!

**NotifyMeMaybe** - Making AI-human interaction seamless, one notification at a time! 🚀 