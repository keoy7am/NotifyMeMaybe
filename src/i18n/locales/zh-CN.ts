import { Messages } from '../index.js';

const messages: Messages = {
  // Service messages
  service: {
    initialized: '{{serviceName}}服务初始化成功',
    initializationFailed: '{{serviceName}}服务初始化失败：{{error}}',
    notInitialized: '{{serviceName}}服务未初始化',
    configInvalid: '{{serviceName}}配置无效',
    configNotFound: '找不到{{serviceName}}的配置',
    connectionTestSuccess: '🔔 连接测试成功',
    connectionTestFailed: '连接测试失败',
  },

  // Notification messages
  notification: {
    sendSuccess: '通知发送成功',
    sendFailed: '通知发送失败：{{error}}',
    broadcastComplete: '广播通知完成',
    noServicesAvailable: '没有可用的通知服务',
    serviceNotFound: '找不到通知服务：{{serviceName}}',
    invalidParameters: '标题和消息是必要的参数',
    serviceRequired: '服务名称是必要的参数',
  },

  // Priority levels
  priority: {
    low: '低',
    normal: '普通',
    high: '高',
  },

  // UI messages
  ui: {
    title: '标题',
    message: '消息',
    service: '服务',
    priority: '优先级',
    metadata: '附加信息',
    timestamp: '时间戳',
    status: '状态',
    error: '错误',
    success: '成功',
    failed: '失败',
  },

  // MCP tools descriptions
  tools: {
    sendNotification: {
      name: 'send_notification',
      description: '发送通知到指定的通讯平台',
      title: '通知标题',
      message: '通知内容',
      service: '通知服务名称 (telegram, discord, webhook)',
      priority: '通知优先级',
      metadata: '附加的元数据',
    },
    broadcastNotification: {
      name: 'broadcast_notification',
      description: '广播通知到所有可用的通讯平台',
      title: '通知标题',
      message: '通知内容',
      priority: '通知优先级',
      metadata: '附加的元数据',
    },
    testServices: {
      name: 'test_services',
      description: '测试所有通知服务的连接状态',
    },
    listServices: {
      name: 'list_services',
      description: '列出所有可用的通知服务',
    },
    getServiceStatus: {
      name: 'get_service_status',
      description: '获取指定服务的状态',
      service: '服务名称',
    },
    requestInteraction: {
      name: 'request_interaction',
      description: '向用户请求交互响应（如输入新的 prompt 或确认）',
      type: '交互类型：prompt（提示输入）、confirmation（确认）、selection（选择）',
      message: '向用户显示的消息',
      options: '选项列表（用于选择类型）',
      timeout: '自定义超时时间（毫秒），默认 30 秒',
    },
    respondToInteraction: {
      name: 'respond_to_interaction',
      description: '响应待处理的交互请求',
      requestId: '交互请求的 ID',
      response: '用户的响应（文字或布尔值）',
    },
    getInteractionStatus: {
      name: 'get_interaction_status',
      description: '获取交互功能的状态和统计信息',
    },
    listPendingInteractions: {
      name: 'list_pending_interactions',
      description: '列出所有待处理的交互请求',
    },
    cancelInteraction: {
      name: 'cancel_interaction',
      description: '取消指定的交互请求',
      requestId: '要取消的交互请求 ID',
    },
    // Telegram Prompt 相关工具
    getTelegramPrompts: {
      name: 'get_telegram_prompts',
      description: '获取所有来自 Telegram 的 prompt 请求',
    },
    processTelegramPrompt: {
      name: 'process_telegram_prompt',
      description: '处理指定的 Telegram prompt',
      promptId: 'Prompt ID',
      response: '处理结果或回应',
    },
    getTelegramPromptStats: {
      name: 'get_telegram_prompt_stats',
      description: '获取 Telegram prompt 统计信息',
    },
    cleanupTelegramPrompts: {
      name: 'cleanup_telegram_prompts',
      description: '清理已处理的 Telegram prompt',
    },
    // 同步交互工具
    requestInteractionSync: {
      name: 'request_interaction_sync',
      description: '同步请求用户交互并等待回应',
      type: '交互类型：prompt（提示输入）、confirmation（确认）、selection（选择）',
      message: '向用户显示的消息',
      options: '选项列表（用于选择类型）',
      timeout: '自定义超时时间（毫秒），默认 30 秒',
    },
  },

  // Interaction messages
  interaction: {
    disabled: '交互功能未启用',
    enabled: '交互功能已启用',
    tooManyPendingRequests: '待处理的交互请求过多，请稍后再试',
    requestNotFound: '找不到指定的交互请求',
    timeout: '交互请求超时',
    responseReceived: '已收到响应',
    requestCanceled: '交互请求已取消',
    requestCreated: '交互请求已创建',
    warningTimeout: '⚠️ 警告：交互请求可能会超时',
    warningFailure: '⚠️ 警告：交互请求可能会失败',
  },

  // Error messages
  errors: {
    toolNotFound: '不支持的工具：{{toolName}}',
    toolExecutionError: '工具执行错误：{{error}}',
    invalidParams: '无效的参数',
    internalError: '内部错误',
    methodNotFound: '找不到方法',
  },

  // Server messages
  server: {
    started: 'NotifyMeMaybe MCP服务器已启动',
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
    additionalInfo: '附加信息',
    interactions: {
      title: '🤖 交互请求',
    },
    buttons: {
      yes: '是',
      no: '否',
      reply: '回复',
      cancel: '取消',
    },
    responses: {
      confirmed: '✅ 已确认',
      rejected: '❌ 已拒绝',
      selected: '✅ 已选择选项 {{option}}',
      pleaseReply: '📝 请输入您的回复：',
      replyReceived: '✅ 已收到您的回复：`{{message}}`',
      replyError: '❌ 处理您的回复时发生错误，请稍后再试。',
      promptReceived: '✅ 已收到您的 Prompt 请求！\n\n**ID**: `{{promptId}}`\n**内容**: {{message}}\n\n将会在处理时通知您结果。',
      promptError: '❌ 处理 Prompt 时发生错误：{{error}}',
      cancelled: '🚫 交互已取消',
      cancelError: '❌ 取消交互时发生错误',
      processingError: '⚠️ 处理您的消息时发生错误，请稍后再试。',
      requestExpired: '⚠️ 该交互请求已过期或被取消，您的回复无法处理。',
    },
    commands: {
      me: {
        title: '您的信息',
        username: '用户名',
        firstName: '名字',
        lastName: '姓氏',
        languageCode: '语言代码',
        isBot: '是否为机器人',
        chatId: '聊天室 ID',
        chatType: '聊天室类型',
      },
      start: {
        welcome: '欢迎使用 NotifyMeMaybe！',
        commands: '可用指令',
        meDesc: '查看您的用户信息',
        startDesc: '显示此帮助消息',
        description: '此机器人用于接收 AI 助手的通知和处理交互请求。',
      },
    },
  },

  // Webhook specific messages
  webhook: {
    test: {
      title: '连接测试',
      message: '🔔 Webhook 连接测试成功',
    },
  },
};

export default messages; 