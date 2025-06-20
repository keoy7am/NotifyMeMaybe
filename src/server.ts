import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { NotificationManager } from './services/NotificationManager.js';
import { NotificationMessage } from './interfaces/INotificationService.js';
import { InteractionService } from './services/InteractionService.js';
import { PromptService } from './services/PromptService.js';
import { i18n } from './i18n/index.js';

/**
 * NotifyMeMaybe MCP Server with Multi-language Support
 */
class NotifyMeMaybeMCPServer {
  private server: Server;
  private notificationManager!: NotificationManager;
  private interactionService!: InteractionService;
  private promptService!: PromptService;

  constructor() {
    this.server = new Server(
      {
        name: i18n.t('server.name'),
        version: i18n.t('server.version'),
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
  }

  /**
   * Initialize the server
   */
  public async initialize(): Promise<void> {
    this.notificationManager = await NotificationManager.getInstance();
    this.interactionService = InteractionService.getInstance();
    this.promptService = PromptService.getInstance();
    this.setupToolHandlers();
  }

  /**
   * Setup tool handlers with i18n support
   */
  private setupToolHandlers(): void {
    // List all available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: i18n.t('tools.sendNotification.name'),
            description: i18n.t('tools.sendNotification.description'),
            inputSchema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: i18n.t('tools.sendNotification.title'),
                },
                message: {
                  type: 'string',
                  description: i18n.t('tools.sendNotification.message'),
                },
                service: {
                  type: 'string',
                  description: i18n.t('tools.sendNotification.service'),
                  enum: this.notificationManager.getSupportedServices(),
                },
                priority: {
                  type: 'string',
                  description: i18n.t('tools.sendNotification.priority'),
                  enum: ['low', 'normal', 'high'],
                  default: 'normal',
                },
                metadata: {
                  type: 'object',
                  description: i18n.t('tools.sendNotification.metadata'),
                  additionalProperties: true,
                },
              },
              required: ['title', 'message'],
            },
          },
          {
            name: i18n.t('tools.broadcastNotification.name'),
            description: i18n.t('tools.broadcastNotification.description'),
            inputSchema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: i18n.t('tools.broadcastNotification.title'),
                },
                message: {
                  type: 'string',
                  description: i18n.t('tools.broadcastNotification.message'),
                },
                priority: {
                  type: 'string',
                  description: i18n.t('tools.broadcastNotification.priority'),
                  enum: ['low', 'normal', 'high'],
                  default: 'normal',
                },
                metadata: {
                  type: 'object',
                  description: i18n.t('tools.broadcastNotification.metadata'),
                  additionalProperties: true,
                },
              },
              required: ['title', 'message'],
            },
          },
          {
            name: i18n.t('tools.testServices.name'),
            description: i18n.t('tools.testServices.description'),
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: i18n.t('tools.listServices.name'),
            description: i18n.t('tools.listServices.description'),
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: i18n.t('tools.getServiceStatus.name'),
            description: i18n.t('tools.getServiceStatus.description'),
            inputSchema: {
              type: 'object',
              properties: {
                service: {
                  type: 'string',
                  description: i18n.t('tools.getServiceStatus.service'),
                  enum: this.notificationManager.getSupportedServices(),
                },
              },
              required: ['service'],
            },
          },
          // Interaction tools
          {
            name: i18n.t('tools.requestInteraction.name'),
            description: i18n.t('tools.requestInteraction.description') + ' (Asynchronous - returns immediately)',
            inputSchema: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  description: i18n.t('tools.requestInteraction.type'),
                  enum: ['prompt', 'confirmation', 'selection'],
                },
                message: {
                  type: 'string',
                  description: i18n.t('tools.requestInteraction.message'),
                },
                options: {
                  type: 'array',
                  items: { type: 'string' },
                  description: i18n.t('tools.requestInteraction.options'),
                },
                timeout: {
                  type: 'number',
                  description: i18n.t('tools.requestInteraction.timeout'),
                  minimum: 1000,
                  maximum: 300000,
                },
              },
              required: ['type', 'message'],
            },
          },
          {
            name: i18n.t('tools.respondToInteraction.name'),
            description: i18n.t('tools.respondToInteraction.description'),
            inputSchema: {
              type: 'object',
              properties: {
                requestId: {
                  type: 'string',
                  description: i18n.t('tools.respondToInteraction.requestId'),
                },
                response: {
                  oneOf: [
                    { type: 'string' },
                    { type: 'boolean' }
                  ],
                  description: i18n.t('tools.respondToInteraction.response'),
                },
              },
              required: ['requestId', 'response'],
            },
          },
          {
            name: i18n.t('tools.getInteractionStatus.name'),
            description: i18n.t('tools.getInteractionStatus.description'),
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: i18n.t('tools.listPendingInteractions.name'),
            description: i18n.t('tools.listPendingInteractions.description'),
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: i18n.t('tools.cancelInteraction.name'),
            description: i18n.t('tools.cancelInteraction.description'),
            inputSchema: {
              type: 'object',
              properties: {
                requestId: {
                  type: 'string',
                  description: i18n.t('tools.cancelInteraction.requestId'),
                },
              },
              required: ['requestId'],
            },
          },
          // Telegram Prompt 工具
          {
            name: i18n.t('tools.getTelegramPrompts.name'),
            description: i18n.t('tools.getTelegramPrompts.description'),
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: i18n.t('tools.processTelegramPrompt.name'),
            description: i18n.t('tools.processTelegramPrompt.description'),
            inputSchema: {
              type: 'object',
              properties: {
                promptId: {
                  type: 'string',
                  description: i18n.t('tools.processTelegramPrompt.promptId'),
                },
                response: {
                  type: 'string',
                  description: i18n.t('tools.processTelegramPrompt.response'),
                },
              },
              required: ['promptId'],
            },
          },
          {
            name: i18n.t('tools.getTelegramPromptStats.name'),
            description: i18n.t('tools.getTelegramPromptStats.description'),
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: i18n.t('tools.cleanupTelegramPrompts.name'),
            description: i18n.t('tools.cleanupTelegramPrompts.description'),
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          // Synchronous Tool, waits for user response
          {
            name: i18n.t('tools.requestInteractionSync.name'),
            description: i18n.t('tools.requestInteractionSync.description') + ' (Synchronous - waits for user response)',
            inputSchema: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  description: i18n.t('tools.requestInteractionSync.type'),
                  enum: ['prompt', 'confirmation', 'selection'],
                },
                message: {
                  type: 'string',
                  description: i18n.t('tools.requestInteractionSync.message'),
                },
                options: {
                  type: 'array',
                  items: { type: 'string' },
                  description: i18n.t('tools.requestInteractionSync.options'),
                },
                timeout: {
                  type: 'number',
                  description: i18n.t('tools.requestInteractionSync.timeout'),
                  minimum: 1000,
                  maximum: 300000,
                },
              },
              required: ['type', 'message'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'send_notification':
            return await this.handleSendNotification(args);
          
          case 'broadcast_notification':
            return await this.handleBroadcastNotification(args);
          
          case 'test_services':
            return await this.handleTestServices();
          
          case 'list_services':
            return await this.handleListServices();
          
          case 'get_service_status':
            return await this.handleGetServiceStatus(args);
          
          case 'request_interaction':
            return await this.handleRequestInteraction(args);
          
          case 'respond_to_interaction':
            return await this.handleRespondToInteraction(args);
          
          case 'get_interaction_status':
            return await this.handleGetInteractionStatus();
          
          case 'list_pending_interactions':
            return await this.handleListPendingInteractions();
          
          case 'cancel_interaction':
            return await this.handleCancelInteraction(args);
          
          case 'get_telegram_prompts':
            return await this.handleGetTelegramPrompts();
          
          case 'process_telegram_prompt':
            return await this.handleProcessTelegramPrompt(args);
          
          case 'get_telegram_prompt_stats':
            return await this.handleGetTelegramPromptStats();
          
          case 'cleanup_telegram_prompts':
            return await this.handleCleanupTelegramPrompts();
          
          case 'request_interaction_sync':
            return await this.handleRequestInteractionSync(args);
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              i18n.t('errors.toolNotFound', { toolName: name })
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        
        throw new McpError(
          ErrorCode.InternalError,
          i18n.t('errors.toolExecutionError', { error: String(error) })
        );
      }
    });
  }

  /**
   * Handle send notification with i18n support
   */
  private async handleSendNotification(args: any) {
    const { title, message, service, priority = 'normal', metadata } = args;

    if (!title || !message) {
      throw new McpError(
        ErrorCode.InvalidParams,
        i18n.t('notification.invalidParameters')
      );
    }

    const notificationMessage: NotificationMessage = {
      title,
      message,
      priority,
      timestamp: new Date(),
      metadata,
    };

    const result = await this.notificationManager.sendNotification(
      notificationMessage,
      service
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: result.success,
            service: service || i18n.t('ui.service'),
            messageId: result.messageId,
            error: result.error,
            timestamp: result.timestamp,
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Handle broadcast notification with i18n support
   */
  private async handleBroadcastNotification(args: any) {
    const { title, message, priority = 'normal', metadata } = args;

    if (!title || !message) {
      throw new McpError(
        ErrorCode.InvalidParams,
        i18n.t('notification.invalidParameters')
      );
    }

    const notificationMessage: NotificationMessage = {
      title,
      message,
      priority,
      timestamp: new Date(),
      metadata,
    };

    const results = await this.notificationManager.broadcastNotification(notificationMessage);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            totalServices: results.length,
            successCount: results.filter(r => r.success).length,
            results: results.map((result, index) => ({
              service: this.notificationManager.getActiveServices()[index] || `service_${index}`,
              success: result.success,
              messageId: result.messageId,
              error: result.error,
              timestamp: result.timestamp,
            })),
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Handle test services with i18n support
   */
  private async handleTestServices() {
    const results = await this.notificationManager.testAllServices();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            serviceTests: results,
            totalServices: Object.keys(results).length,
            healthyServices: Object.values(results).filter(Boolean).length,
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Handle list services with i18n support
   */
  private async handleListServices() {
    const activeServices = this.notificationManager.getActiveServices();
    const supportedServices = this.notificationManager.getSupportedServices();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            activeServices,
            supportedServices,
            totalActive: activeServices.length,
            totalSupported: supportedServices.length,
            currentLanguage: i18n.getCurrentLanguage(),
            supportedLanguages: i18n.getSupportedLanguages(),
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Handle get service status with i18n support
   */
  private async handleGetServiceStatus(args: any) {
    const { service } = args;

    if (!service) {
      throw new McpError(
        ErrorCode.InvalidParams,
        i18n.t('notification.serviceRequired')
      );
    }

    const isActive = this.notificationManager.getActiveServices().includes(service);
    const isHealthy = isActive ? await this.notificationManager.testService(service) : false;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            service,
            isActive,
            isHealthy,
            isSupported: this.notificationManager.getSupportedServices().includes(service),
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Handle request interaction (async version)
   */
  private async handleRequestInteraction(args: any) {
    const { type, message, options, timeout } = args;

    if (!type || !message) {
      throw new McpError(
        ErrorCode.InvalidParams,
        i18n.t('errors.invalidParams')
      );
    }

    if (!this.interactionService.isEnabled()) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        i18n.t('interaction.disabled')
      );
    }

    try {
      const requestId = await this.interactionService.createInteractionRequest(
        type,
        message,
        options,
        timeout
      );

      // Send notification to inform user about new interaction request
      const warningMessage = `${i18n.t('interaction.warningTimeout')}\n${i18n.t('interaction.warningFailure')}`;
      
      const response = {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              requestId,
              type,
              message,
              options,
              timeout: timeout || this.interactionService.getConfig().timeout,
              warning: warningMessage,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };

      // Optional: Send notification via notification services
      if (this.notificationManager.getActiveServices().length > 0) {
        const notificationMessage = {
          title: i18n.t('interaction.requestCreated'),
          message: `${message}\n\nRequest ID: ${requestId}`,
          priority: 'high' as const,
          timestamp: new Date(),
          metadata: { requestId, type, options },
        };
        
        // Send notification asynchronously, don't block response
        this.notificationManager.broadcastNotification(notificationMessage)
          .catch(error => console.error('Failed to send interaction notification:', error));
      }

      return response;
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        i18n.t('errors.toolExecutionError', { error: String(error) })
      );
    }
  }

  /**
   * Handle respond to interaction
   */
  private async handleRespondToInteraction(args: any) {
    const { requestId, response } = args;

    if (!requestId || response === undefined) {
      throw new McpError(
        ErrorCode.InvalidParams,
        i18n.t('errors.invalidParams')
      );
    }

    const success = await this.interactionService.provideResponse(requestId, response);

    if (!success) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        i18n.t('interaction.requestNotFound')
      );
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            requestId,
            response,
            message: i18n.t('interaction.responseReceived'),
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Handle get interaction status
   */
  private async handleGetInteractionStatus() {
    const stats = this.interactionService.getStats();
    const config = this.interactionService.getConfig();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            ...stats,
            config,
            status: stats.enabled ? i18n.t('interaction.enabled') : i18n.t('interaction.disabled'),
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Handle list pending interactions
   */
  private async handleListPendingInteractions() {
    const pendingRequests = this.interactionService.getPendingRequests();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            pendingRequests: pendingRequests.map(req => ({
              id: req.id,
              type: req.type,
              message: req.message,
              options: req.options,
              timeout: req.timeout,
              timestamp: req.timestamp.toISOString(),
              timeRemaining: req.timeout ? Math.max(0, (req.timestamp.getTime() + req.timeout) - Date.now()) : null,
            })),
            totalCount: pendingRequests.length,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Handle cancel interaction
   */
  private async handleCancelInteraction(args: any) {
    const { requestId } = args;

    if (!requestId) {
      throw new McpError(
        ErrorCode.InvalidParams,
        i18n.t('errors.invalidParams')
      );
    }

    const success = this.interactionService.cancelRequest(requestId);

    if (!success) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        i18n.t('interaction.requestNotFound')
      );
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            requestId,
            message: i18n.t('interaction.requestCanceled'),
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Handle get Telegram prompts
   */
  private async handleGetTelegramPrompts() {
    const pendingPrompts = this.promptService.getPendingPrompts();
    const allPrompts = this.promptService.getAllPrompts();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            totalPrompts: allPrompts.length,
            pendingPrompts: pendingPrompts.length,
            prompts: allPrompts.map(prompt => ({
              id: prompt.id,
              chatId: prompt.chatId,
              username: prompt.username,
              message: prompt.message,
              timestamp: prompt.timestamp,
              processed: prompt.processed,
              response: prompt.response,
            })),
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Handle process Telegram prompt
   */
  private async handleProcessTelegramPrompt(args: any) {
    const { promptId, response } = args;

    if (!promptId) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Prompt ID is required'
      );
    }

    const prompt = this.promptService.getPrompt(promptId);
    if (!prompt) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Prompt not found with ID: ${promptId}`
      );
    }

    const success = this.promptService.markAsProcessed(promptId, response);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success,
            promptId,
            processed: true,
            response: response || 'Processed',
            timestamp: new Date(),
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Handle get Telegram prompt stats
   */
  private async handleGetTelegramPromptStats() {
    const stats = this.promptService.getStats();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(stats, null, 2),
        },
      ],
    };
  }

  /**
   * Handle cleanup Telegram prompts
   */
  private async handleCleanupTelegramPrompts() {
    const cleanedCount = this.promptService.cleanupProcessedPrompts();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            cleanedCount,
            message: `Cleaned up ${cleanedCount} processed prompts`,
            timestamp: new Date(),
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Handle synchronous interaction request (waits for user response)
   */
  private async handleRequestInteractionSync(args: any) {
    const { type, message, options, timeout } = args;

    if (!type || !message) {
      throw new McpError(
        ErrorCode.InvalidParams,
        i18n.t('errors.invalidParams')
      );
    }

    if (!this.interactionService.isEnabled()) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        i18n.t('interaction.disabled')
      );
    }

    try {
      // Create interaction request - InteractionService will emit newRequest event
      // TelegramService event listener will automatically handle sending notification
      const requestId = await this.interactionService.createInteractionRequest(
        type,
        message,
        options,
        timeout
      );

      // Wait for user response
      try {
        const response = await this.interactionService.waitForResponse(requestId);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                requestId,
                type,
                message,
                userResponse: response.response,
                responseTimestamp: response.timestamp.toISOString(),
                timeout: timeout || this.interactionService.getConfig().timeout,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        // Handle timeout or other errors
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                requestId,
                type,
                message,
                error: String(error),
                timeout: timeout || this.interactionService.getConfig().timeout,
                timestamp: new Date().toISOString(),
              }, null, 2),
            },
          ],
        };
      }
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        i18n.t('errors.toolExecutionError', { error: String(error) })
      );
    }
  }

  /**
   * Start the server
   */
  public async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error(i18n.t('server.started'));
  }
}

// Start the server
async function startServer() {
  const server = new NotifyMeMaybeMCPServer();
  await server.initialize();
  await server.run();
}

startServer().catch(console.error); 