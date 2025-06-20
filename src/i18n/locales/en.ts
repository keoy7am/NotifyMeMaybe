import { Messages } from '../index.js';

const messages: Messages = {
  // Service messages
  service: {
    initialized: '{{serviceName}} service initialized successfully',
    initializationFailed: '{{serviceName}} service initialization failed: {{error}}',
    notInitialized: '{{serviceName}} service not initialized',
    configInvalid: '{{serviceName}} configuration is invalid',
    configNotFound: 'Configuration not found for {{serviceName}}',
    connectionTestSuccess: '🔔 Connection test successful',
    connectionTestFailed: 'Connection test failed',
  },

  // Notification messages
  notification: {
    sendSuccess: 'Notification sent successfully',
    sendFailed: 'Failed to send notification: {{error}}',
    broadcastComplete: 'Broadcast notification completed',
    noServicesAvailable: 'No notification services available',
    serviceNotFound: 'Notification service not found: {{serviceName}}',
    invalidParameters: 'Title and message are required parameters',
    serviceRequired: 'Service name is required parameter',
  },

  // Priority levels
  priority: {
    low: 'Low',
    normal: 'Normal',
    high: 'High',
  },

  // UI messages
  ui: {
    title: 'Title',
    message: 'Message',
    service: 'Service',
    priority: 'Priority',
    metadata: 'Additional Information',
    timestamp: 'Timestamp',
    status: 'Status',
    error: 'Error',
    success: 'Success',
    failed: 'Failed',
  },

  // MCP tools descriptions
  tools: {
    sendNotification: {
      name: 'send_notification',
      description: 'Send notification to specified messaging platform',
      title: 'Notification title',
      message: 'Notification content',
      service: 'Notification service name (telegram, discord, webhook)',
      priority: 'Notification priority',
      metadata: 'Additional metadata',
    },
    broadcastNotification: {
      name: 'broadcast_notification',
      description: 'Broadcast notification to all available messaging platforms',
      title: 'Notification title',
      message: 'Notification content',
      priority: 'Notification priority',
      metadata: 'Additional metadata',
    },
    testServices: {
      name: 'test_services',
      description: 'Test connection status of all notification services',
    },
    listServices: {
      name: 'list_services',
      description: 'List all available notification services',
    },
    getServiceStatus: {
      name: 'get_service_status',
      description: 'Get status of specified service',
      service: 'Service name',
    },
    requestInteraction: {
      name: 'request_interaction',
      description: 'Request user interaction (e.g., new prompt input or confirmation)',
      type: 'Interaction type: prompt (input), confirmation (yes/no), selection (choose from options)',
      message: 'Message to display to user',
      options: 'Options list (for selection type)',
      timeout: 'Custom timeout in milliseconds, default 30 seconds',
    },
    respondToInteraction: {
      name: 'respond_to_interaction',
      description: 'Respond to a pending interaction request',
      requestId: 'ID of the interaction request',
      response: 'User response (text or boolean)',
    },
    getInteractionStatus: {
      name: 'get_interaction_status',
      description: 'Get interaction feature status and statistics',
    },
    listPendingInteractions: {
      name: 'list_pending_interactions',
      description: 'List all pending interaction requests',
    },
    cancelInteraction: {
      name: 'cancel_interaction',
      description: 'Cancel a specific interaction request',
      requestId: 'ID of interaction request to cancel',
    },
    // Telegram Prompt related tools
    getTelegramPrompts: {
      name: 'get_telegram_prompts',
      description: 'Get all prompt requests from Telegram',
    },
    processTelegramPrompt: {
      name: 'process_telegram_prompt',
      description: 'Process the specified Telegram prompt',
      promptId: 'Prompt ID',
      response: 'Processing result or response',
    },
    getTelegramPromptStats: {
      name: 'get_telegram_prompt_stats',
      description: 'Get Telegram prompt statistics',
    },
    cleanupTelegramPrompts: {
      name: 'cleanup_telegram_prompts',
      description: 'Clean up processed Telegram prompts',
    },
    // Synchronous interaction tool
    requestInteractionSync: {
      name: 'request_interaction_sync',
      description: 'Synchronously request user interaction and wait for response',
      type: 'Interaction type: prompt (input), confirmation (yes/no), selection (choose from options)',
      message: 'Message to display to user',
      options: 'Options list (for selection type)',
      timeout: 'Custom timeout in milliseconds, default 30 seconds',
    },
  },

  // Interaction messages
  interaction: {
    disabled: 'Interaction feature is disabled',
    enabled: 'Interaction feature is enabled',
    tooManyPendingRequests: 'Too many pending interaction requests, please try again later',
    requestNotFound: 'Interaction request not found',
    timeout: 'Interaction request timed out',
    responseReceived: 'Response received',
    requestCanceled: 'Interaction request canceled',
    requestCreated: 'Interaction request created',
    warningTimeout: '⚠️ Warning: Interaction request may timeout',
    warningFailure: '⚠️ Warning: Interaction request may fail',
  },

  // Error messages
  errors: {
    toolNotFound: 'Unsupported tool: {{toolName}}',
    toolExecutionError: 'Tool execution error: {{error}}',
    invalidParams: 'Invalid parameters',
    internalError: 'Internal error',
    methodNotFound: 'Method not found',
  },

  // Server messages
  server: {
    started: 'NotifyMeMaybe MCP server started',
    name: 'notify-me-maybe',
    version: '1.0.0',
  },

  // Common messages
  common: {
    yes: 'Yes',
    no: 'No',
  },

  // Telegram specific messages
  telegram: {
    additionalInfo: 'Additional Information',
    interactions: {
      title: '🤖 Interaction Request',
    },
    buttons: {
      yes: 'Yes',
      no: 'No',
      reply: 'Reply',
      cancel: 'Cancel',
    },
    responses: {
      confirmed: '✅ Confirmed',
      rejected: '❌ Rejected',
      selected: '✅ Selected option {{option}}',
      pleaseReply: '📝 Please enter your reply:',
      replyReceived: '✅ Your reply received: `{{message}}`',
      replyError: '❌ Error processing your reply, please try again later.',
      promptReceived: '✅ Your prompt request has been received!\n\n**ID**: `{{promptId}}`\n**Content**: {{message}}\n\nYou will be notified when processed.',
      promptError: '❌ Error processing prompt: {{error}}',
      cancelled: '🚫 Interaction cancelled',
      cancelError: '❌ Error cancelling interaction',
      processingError: '⚠️ Error processing your message, please try again later.',
      requestExpired: '⚠️ This interaction request has expired or been cancelled, your reply cannot be processed.',
    },
    commands: {
      me: {
        title: 'Your Information',
        username: 'Username',
        firstName: 'First Name',
        lastName: 'Last Name',
        languageCode: 'Language Code',
        isBot: 'Is Bot',
        chatId: 'Chat ID',
        chatType: 'Chat Type',
      },
      start: {
        welcome: 'Welcome to NotifyMeMaybe!',
        commands: 'Available Commands',
        meDesc: 'View your user information',
        startDesc: 'Show this help message',
        description: 'This bot is used to receive notifications from AI assistants and handle interaction requests.',
      },
    },
  },

  // Webhook specific messages
  webhook: {
    test: {
      title: 'Connection Test',
      message: '🔔 Webhook connection test successful',
    },
  },
};

export default messages; 