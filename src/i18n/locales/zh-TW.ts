import { Messages } from '../index.js';

const messages: Messages = {
  // Service messages
  service: {
    initialized: '{{serviceName}}服務初始化成功',
    initializationFailed: '{{serviceName}}服務初始化失敗：{{error}}',
    notInitialized: '{{serviceName}}服務未初始化',
    configInvalid: '{{serviceName}}配置無效',
    configNotFound: '找不到{{serviceName}}的配置',
    connectionTestSuccess: '🔔 連線測試成功',
    connectionTestFailed: '連線測試失敗',
  },

  // Notification messages
  notification: {
    sendSuccess: '通知發送成功',
    sendFailed: '通知發送失敗：{{error}}',
    broadcastComplete: '廣播通知完成',
    noServicesAvailable: '沒有可用的通知服務',
    serviceNotFound: '找不到通知服務：{{serviceName}}',
    invalidParameters: '標題和訊息是必要的參數',
    serviceRequired: '服務名稱是必要的參數',
  },

  // Priority levels
  priority: {
    low: '低',
    normal: '普通',
    high: '高',
  },

  // UI messages
  ui: {
    title: '標題',
    message: '訊息',
    service: '服務',
    priority: '優先級',
    metadata: '附加資訊',
    timestamp: '時間戳記',
    status: '狀態',
    error: '錯誤',
    success: '成功',
    failed: '失敗',
  },

  // MCP tools descriptions
  tools: {
    sendNotification: {
      name: 'send_notification',
      description: '發送通知到指定的通訊平台',
      title: '通知標題',
      message: '通知內容',
      service: '通知服務名稱 (telegram, discord, webhook)',
      priority: '通知優先級',
      metadata: '附加的元資料',
    },
    broadcastNotification: {
      name: 'broadcast_notification',
      description: '廣播通知到所有可用的通訊平台',
      title: '通知標題',
      message: '通知內容',
      priority: '通知優先級',
      metadata: '附加的元資料',
    },
    testServices: {
      name: 'test_services',
      description: '測試所有通知服務的連線狀態',
    },
    listServices: {
      name: 'list_services',
      description: '列出所有可用的通知服務',
    },
    getServiceStatus: {
      name: 'get_service_status',
      description: '獲取指定服務的狀態',
      service: '服務名稱',
    },
    requestInteraction: {
      name: 'request_interaction',
      description: '向用戶請求交互回應（如輸入新的 prompt 或確認）',
      type: '交互類型：prompt（提示輸入）、confirmation（確認）、selection（選擇）',
      message: '向用戶顯示的消息',
      options: '選項列表（用於選擇類型）',
      timeout: '自定義超時時間（毫秒），預設 30 秒',
    },
    respondToInteraction: {
      name: 'respond_to_interaction',
      description: '回應待處理的交互請求',
      requestId: '交互請求的 ID',
      response: '用戶的回應（文字或布林值）',
    },
    getInteractionStatus: {
      name: 'get_interaction_status',
      description: '獲取交互功能的狀態和統計信息',
    },
    listPendingInteractions: {
      name: 'list_pending_interactions',
      description: '列出所有待處理的交互請求',
    },
    cancelInteraction: {
      name: 'cancel_interaction',
      description: '取消指定的交互請求',
      requestId: '要取消的交互請求 ID',
    },
    // Telegram Prompt 相關工具
    getTelegramPrompts: {
      name: 'get_telegram_prompts',
      description: '獲取所有來自 Telegram 的 prompt 請求',
    },
    processTelegramPrompt: {
      name: 'process_telegram_prompt',
      description: '處理指定的 Telegram prompt',
      promptId: 'Prompt ID',
      response: '處理結果或回應',
    },
    getTelegramPromptStats: {
      name: 'get_telegram_prompt_stats',
      description: '獲取 Telegram prompt 統計信息',
    },
    cleanupTelegramPrompts: {
      name: 'cleanup_telegram_prompts',
      description: '清理已處理的 Telegram prompt',
    },
    // 同步交互工具
    requestInteractionSync: {
      name: 'request_interaction_sync',
      description: '同步請求用戶交互並等待回應',
      type: '交互類型：prompt（提示輸入）、confirmation（確認）、selection（選擇）',
      message: '向用戶顯示的消息',
      options: '選項列表（用於選擇類型）',
      timeout: '自定義超時時間（毫秒），預設 30 秒',
    },
  },

  // Interaction messages
  interaction: {
    disabled: '交互功能未啟用',
    enabled: '交互功能已啟用',
    tooManyPendingRequests: '待處理的交互請求過多，請稍後再試',
    requestNotFound: '找不到指定的交互請求',
    timeout: '交互請求超時',
    responseReceived: '已收到回應',
    requestCanceled: '交互請求已取消',
    requestCreated: '交互請求已創建',
    warningTimeout: '⚠️ 警告：交互請求可能會超時',
    warningFailure: '⚠️ 警告：交互請求可能會失敗',
  },

  // Error messages
  errors: {
    toolNotFound: '不支援的工具：{{toolName}}',
    toolExecutionError: '工具執行錯誤：{{error}}',
    invalidParams: '無效的參數',
    internalError: '內部錯誤',
    methodNotFound: '找不到方法',
  },

  // Server messages
  server: {
    started: 'NotifyMeMaybe MCP伺服器已啟動',
    name: 'notify-me-maybe',
    version: '1.0.0',
  },

  // Common messages
  common: {
    yes: '是',
    no: '否',
  },

  // Telegram specific messages
  telegram: {
    additionalInfo: '附加資訊',
    interactions: {
      title: '🤖 交互請求',
    },
    buttons: {
      yes: '是',
      no: '否',
      reply: '回覆',
      cancel: '取消',
    },
    responses: {
      confirmed: '✅ 已確認',
      rejected: '❌ 已拒絕',
      selected: '✅ 已選擇選項 {{option}}',
      pleaseReply: '📝 請輸入您的回覆：',
      replyReceived: '✅ 已收到您的回覆：`{{message}}`',
      replyError: '❌ 處理您的回覆時發生錯誤，請稍後再試。',
      promptReceived: '✅ 已收到您的 Prompt 請求！\n\n**ID**: `{{promptId}}`\n**內容**: {{message}}\n\n將會在處理時通知您結果。',
      promptError: '❌ 處理 Prompt 時發生錯誤：{{error}}',
      cancelled: '🚫 交互已取消',
      cancelError: '❌ 取消交互時發生錯誤',
      processingError: '⚠️ 處理您的消息時發生錯誤，請稍後再試。',
      requestExpired: '⚠️ 該交互請求已過期或被取消，您的回覆無法處理。',
    },
    commands: {
      me: {
        title: '您的資訊',
        username: '用戶名稱',
        firstName: '名字',
        lastName: '姓氏',
        languageCode: '語言代碼',
        isBot: '是否為機器人',
        chatId: '聊天室 ID',
        chatType: '聊天室類型',
      },
      start: {
        welcome: '歡迎使用 NotifyMeMaybe！',
        commands: '可用指令',
        meDesc: '查看您的用戶資訊',
        startDesc: '顯示此幫助訊息',
        description: '此機器人用於接收 AI 助手的通知和處理交互請求。',
      },
    },
  },

  // Webhook specific messages
  webhook: {
    test: {
      title: '連線測試',
      message: '🔔 Webhook 連線測試成功',
    },
  },
};

export default messages; 