# NotifyMeMaybe

**強大的 MCP（模型上下文協議）伺服器，支援多平台通知和互動式 AI 工作流程**

## 🌐 語言支援

- **[English](../../README.md)** - 英文版
- **繁體中文** (當前頁面) - 您在這裡
- **[简体中文](../zh-cn/readme.md)** - 簡體中文版

## 🤖 AI 助手整合（Agent 提示詞）

**準備整合您的 AI 助手？** 選擇適合您需求的提示詞配置：

### 📋 可用的 Agent 提示詞配置

| 提示詞類型 | 描述 | 適用場景 | 主要工具 |
|------------|------|----------|----------|
| **[純通知模式](#純通知模式)** | 簡單的任務完成通知 | 基本通知需求 | `send_notification`, `broadcast_notification` |
| **[基本互動模式](#基本互動模式)** | Telegram 互動 + 通知 | 使用者輸入和確認 | `request_interaction_sync`, `send_notification` |
| **[進階互動模式](#進階互動模式)** | 持續工作流程與後續提示 | 複雜多步驟任務 | `get_telegram_prompts`, `process_telegram_prompt`, `request_interaction_sync` |

### 🎯 AI 助手快速開始

1. 選擇下方的提示詞類型
2. 複製完整的提示詞配置
3. 新增到您的 AI 助手系統提示詞中（Cursor、Claude 等）
4. 配置您的 NotifyMeMaybe 服務
5. 開始接收通知和互動！

## 功能特色

### 🔔 多通道通知
- **Telegram 整合**：直接發送通知到 Telegram 聊天室
- **Webhook 支援**：HTTP webhook 通知以供自訂整合
- **優先級別**：高、中、低優先級通知
- **豐富元資料**：為通知附加自訂資料

### 🤖 互動式提示引擎
NotifyMeMaybe 的核心功能是其精密的提示引擎，能夠實現 AI 系統與使用者之間的雙向溝通：

#### 互動類型
- **確認請求**：透過按鈕介面進行是/否決策
- **文字提示**：收集使用者的文字輸入
- **選擇選單**：具有自訂按鈕的多選項目
- **同步與非同步**：支援即時和佇列互動

#### AI 工作流程整合
- **MCP（模型上下文協議）相容**：與 Claude 和其他 AI 系統無縫整合
- **超時管理**：可配置的超時處理與回退機制
- **佇列管理**：處理多個同時進行的使用者互動
- **回應驗證**：確保適當的使用者回應格式

#### 進階功能
- **自動拒絕**：自動處理過期的互動
- **廣播通知**：同時發送到所有活躍通道
- **服務健康監控**：即時監控所有通知服務狀態
- **國際化**：多語言支援（英文、繁體中文、簡體中文）

## Agent 提示詞配置

### 1. 📢 純通知模式

**為您的 AI 助手複製此提示詞配置：**

```
## NotifyMeMaybe 純通知模式配置

### 何時使用 NotifyMeMaybe 工具：
- **總是**在任務完成時通知
- 為長時間執行的操作發送進度更新
- 在錯誤或重要狀態變更時通知

### 必要的 MCP 工具使用：

#### 任務完成通知：
在以下情況使用 `send_notification` 或 `broadcast_notification`：
- 任何任務成功完成時
- 任務執行期間發生錯誤時
- 達到重要里程碑時

參數：
- service: "telegram"（或使用 broadcast_notification 發送到所有服務）
- title: 清晰、簡潔的完成事項摘要
- message: 詳細結果、檔案路徑、URL 或錯誤詳情
- priority: "high"（錯誤）、"normal"（完成）、"low"（進度更新）
- metadata: 包含相關上下文，如檔案路徑、時間戳等

#### 使用範例：
send_notification(
  service="telegram",
  title="任務完成：程式碼分析",
  message="成功分析了 15 個檔案，發現 3 個潛在問題。結果已儲存至 /reports/analysis.json",
  priority="normal",
  metadata={"files_analyzed": 15, "issues_found": 3, "report_path": "/reports/analysis.json"}
)

### 服務健康檢查：
定期使用 `test_services` 確保服務可用。
```

### 2. 🔄 基本互動模式

**為您的 AI 助手複製此提示詞配置：**

```
## NotifyMeMaybe 基本互動模式配置

### 何時使用 NotifyMeMaybe 工具：
- 需要澄清時請求使用者輸入
- 在主要操作前詢問確認
- 提供選擇選單供使用者選擇
- 發送完成通知

### 必要的 MCP 工具使用：

#### 使用者互動請求：
在以下情況使用 `request_interaction_sync`：
- 您需要使用者確認才能繼續
- 您需要使用者的文字輸入
- 您想要提供多項選擇選項

參數：
- type: "confirmation"（是/否）、"prompt"（文字輸入）、"selection"（多項選擇）
- message: 清晰的問題或使用者請求
- options: 選項陣列（僅用於 type="selection"）
- timeout: 60000（60秒）或適當的超時時間

#### 範例：

確認請求：
request_interaction_sync(
  type="confirmation",
  message="您要繼續從專案目錄刪除 5 個檔案嗎？"
)

文字輸入請求：
request_interaction_sync(
  type="prompt",
  message="請提供目標部署環境（staging/production）："
)

選擇選單：
request_interaction_sync(
  type="selection",
  message="選擇部署策略：",
  options=["藍綠部署", "滾動更新", "金絲雀發布"]
)

#### 完成通知：
任務完成後總是使用 `send_notification` 發送完成通知。

#### 錯誤處理：
- 優雅地處理互動超時
- 如果使用者沒有回應，提供回退回應
- 對關鍵錯誤使用高優先級通知
```

### 3. 🚀 進階互動模式

**為您的 AI 助手複製此完整提示詞配置：**

```
## NotifyMeMaybe 進階互動模式配置

### 核心 Agent 行為規則：
- **總是**在會話開始時檢查新的 Telegram 提示
- **絕不**在沒有詢問額外請求的情況下結束會話
- **總是**在開始新任務前處理待處理的提示
- **總是**為長時間操作發送進度通知

### 必要的 MCP 工具使用協議：

#### 1. 會話開始協議：
在每個會話開始時總是執行：

1. 檢查待處理的提示：
   get_telegram_prompts()

2. 如果存在提示，處理每一個：
   process_telegram_prompt(
     promptId="<prompt_id>",
     response="已收到您的請求。正在處理..."
   )

3. 發送狀態通知：
   send_notification(
     service="telegram",
     title="AI 會話已開始",
     message="正在處理您的 Telegram 請求。會話活躍中。",
     priority="normal"
   )

#### 2. 任務執行協議：
在任務執行期間：

1. 為長時間操作發送進度更新：
   send_notification(
     service="telegram",
     title="進度更新",
     message="步驟 2/5 完成：資料庫備份已完成",
     priority="normal",
     metadata={"step": 2, "total_steps": 5}
   )

2. 需要使用者輸入時使用互動：
   request_interaction_sync(
     type="confirmation",
     message="準備繼續資料庫遷移。繼續嗎？"
   )

3. 以高優先級處理錯誤：
   send_notification(
     service="telegram",
     title="發生錯誤",
     message="資料庫連線失敗。30 秒後重試...",
     priority="high"
   )

#### 3. 會話結束協議：
**強制性**：絕不在沒有此序列的情況下結束：

1. 發送完成通知：
   send_notification(
     service="telegram",
     title="任務成功完成",
     message="所有請求的操作已完成。摘要：[詳細結果]",
     priority="normal"
   )

2. 總是詢問額外請求：
   request_interaction_sync(
     type="prompt",
     message="任務成功完成。您有任何額外的指示或後續請求嗎？",
     timeout=60000
   )

3. 繼續互動迴圈直到使用者表示完成
4. 只有當使用者明確說"完成"、"結束"、"沒有更多任務"或類似詞語時才停止

#### 4. Telegram 提示監控：
定期檢查新提示：
- 使用 get_telegram_prompts() 檢查佇列
- 立即使用 process_telegram_prompt() 處理
- 優先處理使用者提示而非自動化任務

#### 5. 服務健康監控：
定期驗證服務：
test_services()
get_service_status(service="telegram")

### 進階模式優勢：
- 使用者可隨時透過 Telegram 發送任務
- AI 自動處理佇列請求
- 無需手動介入的持續工作流程
- 全面的進度追蹤
- 使用者指導的錯誤恢復
```

## 使用者如何運用 NotifyMeMaybe

### 💬 Telegram 整合使用

#### 純通知模式：
- 直接在 Telegram 接收任務完成更新
- 取得長時間執行操作的即時狀態
- 遠端監控 AI 代理活動

#### 基本互動模式：
- 透過 Telegram 按鈕回應 AI 問題
- 在 AI 需要澄清時提供輸入
- 透過互動選單做出決策

#### 進階互動模式：

**進階模式使用者指南：**

1. **向 AI 發送任務：**
   - 開啟您的 Telegram 機器人聊天
   - 直接輸入您的任務或指示
   - AI 將在下次會話中自動接收您的訊息

2. **Telegram 指令範例：**
   ```
   "分析最新的銷售數據並建立摘要報告"
   "使用新的 API 變更更新專案文件"
   "執行測試套件並修復任何失敗的測試"
   "將應用程式部署到預備環境"
   "審查拉取請求 #123 並提供回饋"
   ```

3. **任務佇列管理：**
   - 可以將多個任務排入佇列
   - AI 按順序處理它們
   - 每個任務都會收到個別的狀態更新

4. **互動工作流程：**
   - AI 會在需要時詢問後續問題
   - 使用 Telegram 按鈕快速回應
   - 對複雜請求輸入詳細回應

5. **持續操作：**
   - AI 總是在完成後詢問您是否有更多任務
   - 為相關任務保持對話進行
   - 說"暫時就這樣"或"完成"來結束

### 🔧 配置範例

#### MCP 伺服器配置：
適用於 Claude Desktop 或其他 MCP 客戶端，將此配置添加到您的 MCP 配置檔案中：

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
        "LANGUAGE": "zh-TW",
        "DEBUG": "false"
      }
    }
  }
}
```

#### Claude Desktop 配置檔案位置：

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

#### 環境變數（.env 檔案）：
用於本地開發和測試：

```env
# Telegram 配置（必需）
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
TELEGRAM_PROMPT_ENABLED=true
TELEGRAM_ENABLE_PROMPT_RECEIVING=true
TELEGRAM_INTERACTION_ENABLED=true
TELEGRAM_INTERACTION_TIMEOUT=300000
TELEGRAM_INTERACTION_MAX_PENDING=5

# 自訂 Webhook 配置（可選）
CUSTOM_WEBHOOK_URL=your_custom_webhook_url_here
CUSTOM_WEBHOOK_SECRET=your_webhook_secret_here

# 系統配置
DEFAULT_NOTIFICATION_SERVICE=telegram
LANGUAGE=zh-TW
DEBUG=false
```

## 安裝

1. **複製儲存庫**
   ```bash
   git clone https://github.com/yourusername/NotifyMeMaybe.git
   cd NotifyMeMaybe
   ```

2. **安裝依賴項**
   ```bash
   npm install
   ```

3. **配置環境**
   ```bash
   cp .env.example .env
   # 編輯 .env 填入您的配置
   ```

4. **建置專案**
   ```bash
   npm run build
   ```

## 配置

### 環境變數
```env
# Telegram 配置（必需）
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
TELEGRAM_PROMPT_ENABLED=true
TELEGRAM_ENABLE_PROMPT_RECEIVING=true
TELEGRAM_INTERACTION_ENABLED=true
TELEGRAM_INTERACTION_TIMEOUT=300000
TELEGRAM_INTERACTION_MAX_PENDING=5

# 自訂 Webhook 配置（可選）
CUSTOM_WEBHOOK_URL=your_custom_webhook_url_here
CUSTOM_WEBHOOK_SECRET=your_webhook_secret_here

# 系統配置
DEFAULT_NOTIFICATION_SERVICE=telegram
LANGUAGE=zh-TW
DEBUG=false
```

### MCP 配置
將以下內容新增到您的 MCP 配置檔案：
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
        "LANGUAGE": "zh-TW",
        "DEBUG": "false"
      }
    }
  }
}
```

## 使用方法

### 基本通知
```javascript
// 發送簡單通知
await notificationManager.sendNotification('telegram', {
  title: '任務完成',
  message: '您的 AI 任務已成功完成！',
  priority: 'normal'
});
```

### 互動提示
```javascript
// 請求使用者確認
const response = await interactionService.requestConfirmation(
  '您要繼續部署嗎？'
);

// 取得使用者文字輸入
const userInput = await interactionService.requestPrompt(
  '請提供部署環境：'
);

// 多項選擇
const choice = await interactionService.requestSelection(
  '選擇部署策略：',
  ['藍綠', '滾動', '金絲雀']
);
```

### MCP 工具使用
與 Claude 或其他 MCP 相容的 AI 系統整合時：

```
# 發送通知
send_notification(
  service="telegram",
  title="AI 任務更新",
  message="處理完成，等待下一個指示"
)

# 請求使用者互動
request_interaction_sync(
  type="prompt",
  message="您希望我接下來做什麼？"
)
```

## 提示引擎架構

提示引擎專為無縫的 AI-人類協作而設計：

1. **請求階段**：AI 系統發送互動請求
2. **傳遞階段**：通知發送到配置的通道
3. **回應階段**：使用者透過按鈕/文字輸入回應
4. **處理階段**：回應驗證並返回給 AI
5. **完成階段**：互動標記為完成

### 超時處理
- 預設超時：60 秒
- 每個請求可配置
- 超時時自動拒絕
- 提供回退回應

### 佇列管理
- 最多 5 個同時互動
- FIFO 處理順序
- 自動清理過期請求
- 即時狀態監控

## API 參考

### 核心服務
- `NotificationManager`：處理所有通知路由
- `InteractionService`：管理使用者互動
- `TelegramService`：Telegram 特定實作
- `WebhookService`：HTTP webhook 通知
- `PromptService`：Telegram 提示處理

### MCP 工具
- `send_notification`：發送到特定服務
- `broadcast_notification`：發送到所有服務
- `request_interaction_sync`：同步使用者互動
- `test_services`：健康檢查所有服務
- `list_services`：取得可用服務
- `get_telegram_prompts`：檢索待處理的 Telegram 提示
- `process_telegram_prompt`：處理並回應 Telegram 提示

## 開發

```bash
# 開發模式
npm run dev

# 建置專案
npm run build

# 執行測試
npm test

# 程式碼檢查
npm run lint
```

## 貢獻

歡迎為 NotifyMeMaybe 貢獻！以下是您可以幫助的方式：

### 開始使用
1. 在 GitHub 上 Fork 儲存庫
2. 在本地複製您的 fork：
   ```bash
   git clone https://github.com/yourusername/NotifyMeMaybe.git
   cd NotifyMeMaybe
   ```
3. 建立功能分支：
   ```bash
   git checkout -b feature/your-amazing-feature
   ```
4. 進行變更並徹底測試
5. 提交您的變更：
   ```bash
   git commit -m '新增驚人功能'
   ```
6. 推送到您的 fork：
   ```bash
   git push origin feature/your-amazing-feature
   ```
7. 在 GitHub 上開啟拉取請求

### 貢獻指南
- 遵循現有的程式碼風格和慣例
- 為新功能新增測試
- 根據需要更新文件
- 確保在提交前所有測試都通過
- 撰寫清晰、描述性的提交訊息

### 貢獻領域
- 額外的通知服務（Discord、Slack 等）
- 增強的提示引擎功能
- 效能最佳化
- 文件改進
- 錯誤修復和測試

## 授權

此專案依據 MIT 授權許可。詳見 [LICENSE](../../LICENSE) 檔案。

### MIT 授權

```
MIT 授權

版權所有 (c) 2025 NotifyMeMaybe 貢獻者

特此免費授予任何取得此軟體及相關文件檔案（「軟體」）副本的人不受限制地
處理軟體的權利，包括但不限於使用、複製、修改、合併、發布、分發、再授權
和/或銷售軟體副本的權利，並允許獲得軟體的人員這樣做，但須符合以下條件：

上述版權聲明和本許可聲明應包含在軟體的所有副本或重要部分中。

軟體按「現狀」提供，不提供任何形式的明示或暗示保證，包括但不限於適銷性、
特定用途適用性和非侵權性的保證。在任何情況下，作者或版權持有人均不對
任何索賠、損害或其他責任負責，無論是在合約、侵權或其他方面的訴訟中，
由軟體或軟體的使用或其他處理引起、源於或與之相關。
```

## 支援

如需支援和問題：
- 在 GitHub 上建立 issue
- 檢查 `/docs` 資料夾中的文件
- 檢視 `/examples` 中的範例配置
- 加入我們的社群討論

## 路線圖

- [ ] Discord 整合
- [ ] Slack 通知
- [ ] 增強的 webhook 功能
- [ ] 即時儀表板
- [ ] 自訂服務的外掛系統
- [ ] 進階分析和日誌記錄

---

**準備開始了嗎？**

1. 選擇上方的 [Agent 提示詞配置](#agent-提示詞配置)
2. 將完整提示詞複製到您的 AI 助手
3. 配置您的 NotifyMeMaybe 服務
4. 開始建立互動式 AI 工作流程！

**NotifyMeMaybe** - 讓 AI 與人類的互動無縫接軌，一次一個通知！🚀 