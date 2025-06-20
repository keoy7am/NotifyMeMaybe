import TelegramBot from 'node-telegram-bot-api';
import { 
  INotificationService, 
  NotificationMessage, 
  NotificationResult, 
  ServiceConfig 
} from '../interfaces/INotificationService.js';
import { Logger } from '../utils/logger.js';
import { PromptService } from './PromptService.js';
import { InteractionService } from './InteractionService.js';
import { i18n } from '../i18n/index.js';

/**
 * Telegram notification service
 */
export class TelegramService implements INotificationService {
  public readonly serviceName = 'telegram';
  private static instance: TelegramService;
  private bot?: TelegramBot;
  private chatId?: string;
  private promptService: PromptService;
  private interactionService: InteractionService;
  private initialized = false; // Track initialization status

  private constructor() {
    this.promptService = PromptService.getInstance();
    this.interactionService = InteractionService.getInstance();
  }

  public static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  /**
   * Initialize the service
   */
  public async initialize(config: ServiceConfig): Promise<void> {
    // Check if already initialized to avoid duplicate initialization
    if (this.initialized) {
      Logger.warn('TelegramService already initialized, skipping duplicate initialization');
      return;
    }

    if (!this.validateConfig(config)) {
      throw new Error('Invalid Telegram configuration');
    }

    const { botToken, chatId, enablePromptReceiving } = config as any;
    this.chatId = chatId;
    
    // Enable polling if prompt receiving is enabled
    const pollingEnabled = enablePromptReceiving && this.promptService.isEnabled();
    
    // If bot instance exists, stop and clean up first
    if (this.bot) {
      try {
        await this.bot.stopPolling();
        this.bot.removeAllListeners();
      } catch (error) {
        Logger.warn('Error cleaning up old bot instance:', error);
      }
    }
    
    this.bot = new TelegramBot(botToken, { polling: pollingEnabled });

    // Setup message handlers if polling is enabled
    if (pollingEnabled) {
      this.setupMessageHandler();
      this.setupCallbackHandler();
      this.setupCommandHandlers();
    }

    // Setup interaction event listeners
    this.setupInteractionEventListeners();

    // Test if bot is working properly
    try {
      await this.bot.getMe();
      this.initialized = true; // Mark as initialized
      console.log('Telegram bot initialized successfully');
      if (pollingEnabled) {
        console.log('Telegram prompt receiving feature enabled');
      }
    } catch (error) {
      Logger.error(`Error initializing TelegramService: ${error}`);
      throw error;
    }
  }

  /**
   * Send notification
   */
  public async sendNotification(message: NotificationMessage): Promise<NotificationResult> {
    if (!this.bot || !this.chatId) {
      return {
        success: false,
        error: 'Telegram service not initialized',
        timestamp: new Date(),
      };
    }

    try {
      const formattedMessage = this.formatMessage(message);
      const keyboard = this.createInteractionKeyboard(message);
      
      const options: any = {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      };

      if (keyboard) {
        options.reply_markup = keyboard;
      }

      const result = await this.bot.sendMessage(this.chatId, formattedMessage, options);

      return {
        success: true,
        messageId: result.message_id.toString(),
        timestamp: new Date(),
      };
    } catch (error) {
      Logger.error(`Failed to send Telegram notification: ${error}`);
      return {
        success: false,
        error: String(error),
        timestamp: new Date(),
      };
    }
  }

  /**
   * Validate configuration
   */
  public validateConfig(config: ServiceConfig): boolean {
    const { botToken, chatId } = config as any;
    return !!(
      config.enabled && 
      botToken && 
      typeof botToken === 'string' && 
      botToken.length > 0 &&
      chatId && 
      typeof chatId === 'string' && 
      chatId.length > 0
    );
  }

  /**
   * Test connection to Telegram API
   */
  public async isHealthy(): Promise<boolean> {
    if (!this.bot) {
      return false;
    }
    try {
      await this.bot.getMe();
      return true;
    } catch (error) {
      Logger.error('Telegram health check failed:', error);
      return false;
    }
  }

  /**
   * Test connection
   */
  public async testConnection(): Promise<boolean> {
    if (!this.bot) {
      return false;
    }

    try {
      await this.bot.getMe();
      return true;
    } catch (error) {
      Logger.error(`Error testing Telegram connection: ${error}`);
      return false;
    }
  }

  /**
   * Format message for Telegram using HTML format
   */
  private formatMessage(message: NotificationMessage): string {
    const timestamp = message.timestamp || new Date();
    const priorityEmoji = this.getPriorityEmoji(message.priority);
    
    // Use HTML format to avoid escape issues
    let formattedMessage = `${priorityEmoji} <b>${this.escapeHtml(message.title)}</b>\n\n`;
    formattedMessage += `${this.escapeHtml(message.message)}\n\n`;
    
    // Add special format for interaction requests (don't escape RequestId as it's in code block)
    if (message.metadata?.requestId) {
      formattedMessage += `Request ID: <code>${String(message.metadata.requestId)}</code>\n\n`;
    }
    
    formattedMessage += `⏰ ${timestamp.toLocaleString()}`;
    
    if (message.metadata && Object.keys(message.metadata).length > 0) {
      formattedMessage += `\n\n📋 ${i18n.t('telegram.additionalInfo')}:\n`;
      Object.entries(message.metadata).forEach(([key, value]) => {
        if (key !== 'requestId') { // requestId is already displayed separately
          formattedMessage += `• <i>${this.escapeHtml(key)}</i>: ${this.escapeHtml(String(value))}\n`;
        }
      });
    }

    return formattedMessage;
  }

  /**
   * Create interaction keyboard
   */
  private createInteractionKeyboard(message: NotificationMessage): any {
    if (!message.metadata?.requestId || !message.metadata?.type) {
      return null;
    }

    const requestId = String(message.metadata.requestId);
    const type = String(message.metadata.type);

    switch (type) {
      case 'confirmation':
        return {
          inline_keyboard: [
            [
              { text: i18n.t('telegram.buttons.yes'), callback_data: `confirm:${requestId}:yes` },
              { text: i18n.t('telegram.buttons.no'), callback_data: `confirm:${requestId}:no` }
            ],
            [
              { text: i18n.t('telegram.buttons.cancel'), callback_data: `cancel:${requestId}` }
            ]
          ]
        };

      case 'selection':
        if (message.metadata.options && Array.isArray(message.metadata.options)) {
          const buttons = (message.metadata.options as string[]).map((option, index) => [
            { text: option, callback_data: `select:${requestId}:${option}` }
          ]);
          // Add cancel button
          buttons.push([
            { text: i18n.t('telegram.buttons.cancel'), callback_data: `cancel:${requestId}` }
          ]);
          return { inline_keyboard: buttons };
        }
        break;

      case 'prompt':
        return {
          force_reply: true,
          selective: true,
          input_field_placeholder: i18n.t('telegram.responses.pleaseReply'),
        };
    }

    return null;
  }

  /**
   * Get priority emoji
   */
  private getPriorityEmoji(priority?: string): string {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'low':
        return '🟢';
      case 'normal':
      default:
        return '🟡';
    }
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  /**
   * Escape markdown special characters (kept for backward compatibility)
   */
  private escapeMarkdown(text: string): string {
    return text.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
  }

  /**
   * Setup command handlers
   */
  private setupCommandHandlers(): void {
    if (!this.bot) return;

    // /me command
    this.bot.onText(/\/me/, async (msg) => {
      try {
        const chatId = msg.chat.id;
        const user = msg.from;
        
        const userInfo = `👤 ${i18n.t('telegram.commands.me.title')}\n\n` +
          `🆔 ID: <code>${user?.id}</code>\n` +
          `👤 ${i18n.t('telegram.commands.me.username')}: ${user?.username || 'N/A'}\n` +
          `📝 ${i18n.t('telegram.commands.me.firstName')}: ${user?.first_name || 'N/A'}\n` +
          `📝 ${i18n.t('telegram.commands.me.lastName')}: ${user?.last_name || 'N/A'}\n` +
          `🌐 ${i18n.t('telegram.commands.me.languageCode')}: ${user?.language_code || 'N/A'}\n` +
          `🤖 ${i18n.t('telegram.commands.me.isBot')}: ${user?.is_bot ? i18n.t('common.yes') : i18n.t('common.no')}\n\n` +
          `💬 ${i18n.t('telegram.commands.me.chatId')}: <code>${chatId}</code>\n` +
          `📊 ${i18n.t('telegram.commands.me.chatType')}: ${msg.chat.type}`;

        await this.bot!.sendMessage(chatId, userInfo, { parse_mode: 'HTML' });
      } catch (error) {
        Logger.error(`Error handling /me command: ${error}`);
      }
    });

    // /start command
    this.bot.onText(/\/start/, async (msg) => {
      try {
        const chatId = msg.chat.id;
        const response = `🤖 <b>${i18n.t('telegram.commands.start.welcome')}</b>\n\n` +
          `📋 <b>${i18n.t('telegram.commands.start.commands')}:</b>\n` +
          `• /me - ${i18n.t('telegram.commands.start.meDesc')}\n` +
          `• /start - ${i18n.t('telegram.commands.start.startDesc')}\n\n` +
          `💡 ${i18n.t('telegram.commands.start.description')}`;

        await this.bot!.sendMessage(chatId, response, { parse_mode: 'HTML' });
      } catch (error) {
        Logger.error(`Error handling /start command: ${error}`);
      }
    });

    Logger.info('Telegram command handlers setup complete');
  }

  /**
   * Setup callback handler
   */
  private setupCallbackHandler(): void {
    if (!this.bot) return;

    this.bot.on('callback_query', async (query) => {
      try {
        const data = query.data;
        const messageId = query.message?.message_id;
        const chatId = query.message?.chat.id;

        Logger.info(`Received callback query: ${data} from chat ${chatId}`);

        if (!data || !messageId || !chatId) {
          Logger.warn('Missing callback data, messageId, or chatId');
          return;
        }

        // Acknowledge callback immediately
        await this.bot!.answerCallbackQuery(query.id);

        // Parse callback data using colon format: action:requestId:value
        const parts = data.split(':');
        if (parts.length < 2) {
            Logger.warn(`Invalid callback data format: ${data}`);
            return;
        }
        
        const action = parts[0];
        const requestId = parts[1];
        const value = parts.length > 2 ? parts.slice(2).join(':') : undefined;

        Logger.debug('Parsed callback:', { action, requestId, value });
        Logger.debug('Current pendingRequests:', Array.from(this.interactionService['pendingRequests'].keys()));

        if (!requestId) {
          Logger.warn('No requestId found in callback data');
          return;
        }

        let response: string | boolean | undefined;
        let responseText = '';

        switch (action) {
          case 'confirm':
            response = value === 'yes';
            responseText = response ? i18n.t('telegram.responses.confirmed') : i18n.t('telegram.responses.rejected');
            break;

          case 'select':
            if (value !== undefined) {
              response = value;
              responseText = i18n.t('telegram.responses.selected', { option: value });
            }
            break;
          
          case 'cancel':
            const cancelSuccess = await this.interactionService.cancelRequest(requestId);
            responseText = cancelSuccess ? 
              i18n.t('telegram.responses.cancelled') : 
              i18n.t('telegram.responses.cancelError');
            await this.bot!.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chatId, message_id: messageId });
            await this.bot!.sendMessage(chatId, responseText);
            Logger.debug('Cancel interaction result:', cancelSuccess);
            return;

          default:
            Logger.warn(`Unknown action: ${action}`);
            return;
        }

        // Provide response to interaction service
        if (response !== undefined) {
          Logger.info(`Providing response to InteractionService: ${response} for requestId: ${requestId}`);
          
          try {
            const success = await this.interactionService.provideResponse(requestId, response);
            
            if (success) {
              // Remove keyboard and update message
              await this.bot!.editMessageReplyMarkup(
                { inline_keyboard: [] },
                { chat_id: chatId, message_id: messageId }
              );
              
              // Send confirmation message
              await this.bot!.sendMessage(chatId, responseText);
              Logger.info(`Successfully processed interaction response for requestId: ${requestId}`);
            } else {
              Logger.error(`Failed to provide response to InteractionService for requestId: ${requestId}`);
              await this.bot!.sendMessage(chatId, i18n.t('telegram.responses.processingError'));
            }
          } catch (error) {
            Logger.error(`Error providing response to InteractionService: ${error}`);
            await this.bot!.sendMessage(chatId, i18n.t('telegram.responses.processingError'));
          }
        }

      } catch (error) {
        Logger.error(`Error handling Telegram callback: ${error}`);
        if (query.message?.chat.id) {
          try {
            await this.bot!.sendMessage(query.message.chat.id, i18n.t('telegram.responses.processingError'));
          } catch (sendError) {
            Logger.error(`Failed to send error message: ${sendError}`);
          }
        }
      }
    });

    Logger.info('Telegram callback handler setup complete');
  }

  /**
   * User input state management
   */
  private waitingForInput = new Map<string, string>(); // requestId -> chatId
  private processedMessages = new Set<string>(); // Track processed messages to prevent duplicates

  private setWaitingForInput(requestId: string, chatId: string): void {
    Logger.info(`Setting waiting for input: requestId=${requestId}, chatId=${chatId}`);
    
    // Check if request exists in InteractionService before setting waiting state
    const pendingRequests = this.interactionService.getPendingRequests();
    const requestExists = pendingRequests.some(req => req.id === requestId);
    
    if (!requestExists) {
      Logger.warn(`Cannot set waiting for input - requestId ${requestId} does not exist in InteractionService`);
      return;
    }
    
    this.waitingForInput.set(requestId, chatId);
    Logger.info(`Successfully set waiting for input state. Current waiting requests: ${this.waitingForInput.size}`);
    
    // Set timeout cleanup - match with InteractionService timeout
    const interactionConfig = this.interactionService.getConfig();
    const timeoutMs = interactionConfig.timeout || 60000; // Default to 60 seconds
    
    setTimeout(() => {
      if (this.waitingForInput.has(requestId)) {
        Logger.info(`Cleaning up waiting input state for requestId: ${requestId} after timeout`);
        this.waitingForInput.delete(requestId);
      }
    }, timeoutMs);
  }

  /**
   * Generate unique message identifier
   */
  private generateMessageId(msg: any): string {
    return `${msg.chat.id}_${msg.message_id}_${msg.date}`;
  }

  /**
   * Setup message handler
   */
  private setupMessageHandler(): void {
    if (!this.bot) return;

    this.bot.on('message', async (msg) => {
      try {
        // Handle prompts via replies
        if (msg.reply_to_message && msg.text) {
          const originalMessage = msg.reply_to_message;
          
          // Extract requestId from the original message text (handles both HTML and Markdown formats)
          const requestIdMatch = originalMessage.text?.match(/Request ID: <code>(req_[^<]+)<\/code>|Request ID: `(req_[^`]+)`/);
          if (requestIdMatch && (requestIdMatch[1] || requestIdMatch[2])) {
            const requestId = requestIdMatch[1] || requestIdMatch[2];
            Logger.info(`Received reply for interaction request: ${requestId}`);
            
            const success = await this.interactionService.provideResponse(requestId, msg.text);
            
            if (success) {
              await this.bot!.sendMessage(msg.chat.id, i18n.t('telegram.responses.received'));
            } else {
              Logger.warn(`Could not provide response for already handled request: ${requestId}`);
            }
            return; // Stop further processing
          }
        }

        // Only process text messages
        if (!msg.text) return;

        // Ignore messages from bots
        if (msg.from?.is_bot) return;

        // Ignore command messages
        if (msg.text.startsWith('/')) return;

        // Generate unique message identifier and check if already processed
        const messageId = this.generateMessageId(msg);
        if (this.processedMessages.has(messageId)) {
          Logger.debug(`Message ${messageId} already processed, skipping duplicate`);
          return;
        }

        // Mark message as processed
        this.processedMessages.add(messageId);
        
        // Clean up old message records (keep latest 1000)
        if (this.processedMessages.size > 1000) {
          const messagesToDelete = Array.from(this.processedMessages).slice(0, 100);
          messagesToDelete.forEach(id => this.processedMessages.delete(id));
        }

        // Check if chat is authorized
        if (this.chatId && msg.chat.id.toString() !== this.chatId) {
          Logger.warn(`Received message from unauthorized chat: ${msg.chat.id}`);
          return;
        }

        const chatId = msg.chat.id.toString();
        const username = msg.from?.username;
        const message = msg.text;

        Logger.info(`Processing message from ${username || 'unknown'} in chat ${chatId}: ${message}`);

        // Check if waiting for specific interaction input
        const waitingRequestId = Array.from(this.waitingForInput.entries())
          .find(([_, waitingChatId]) => waitingChatId === chatId)?.[0];

        if (waitingRequestId) {
          Logger.info(`Found waiting interaction for requestId: ${waitingRequestId}`);
          
          // Check if the request still exists in InteractionService
          const pendingRequests = this.interactionService.getPendingRequests();
          const requestExists = pendingRequests.some(req => req.id === waitingRequestId);
          
          if (!requestExists) {
            Logger.warn(`RequestId ${waitingRequestId} no longer exists in InteractionService, cleaning up waiting state`);
            this.waitingForInput.delete(waitingRequestId);
            
            await this.bot!.sendMessage(
              msg.chat.id,
              i18n.t('telegram.responses.requestExpired')
            );
            return;
          }
          
          // Process interaction response
          this.waitingForInput.delete(waitingRequestId);
          
          try {
            Logger.info(`Attempting to provide response "${message}" for requestId: ${waitingRequestId}`);
            const success = await this.interactionService.provideResponse(waitingRequestId, message);
            
            if (success) {
              await this.bot!.sendMessage(
                msg.chat.id,
                i18n.t('telegram.responses.replyReceived', { message }),
                { parse_mode: 'HTML' }
              );
              Logger.info(`Successfully processed user input for requestId: ${waitingRequestId}`);
            } else {
              Logger.error(`InteractionService.provideResponse returned false for requestId: ${waitingRequestId}`);
              await this.bot!.sendMessage(
                msg.chat.id,
                i18n.t('telegram.responses.replyError')
              );
            }
          } catch (error) {
            Logger.error(`Error processing user input for requestId ${waitingRequestId}: ${error}`);
            await this.bot!.sendMessage(
              msg.chat.id,
              i18n.t('telegram.responses.replyError')
            );
          }
          return;
        }

        Logger.info(`No waiting interaction found, treating as new prompt`);

        // Add to prompt queue
        try {
          const promptId = await this.promptService.addPrompt(chatId, message, username);
          
          // Send confirmation message
          await this.bot!.sendMessage(
            msg.chat.id,
            i18n.t('telegram.responses.promptReceived', { promptId, message }),
            { parse_mode: 'HTML' }
          );
          Logger.info(`Successfully added prompt with ID: ${promptId}`);
        } catch (error) {
          Logger.error(`Error processing Telegram prompt: ${error}`);
          
          // Send error message to user
          await this.bot!.sendMessage(
            msg.chat.id,
            i18n.t('telegram.responses.promptError', { error: String(error) }),
            { parse_mode: 'HTML' }
          );
        }
      } catch (error) {
        Logger.error(`Telegram message handler error: ${error}`);
        
        // Try to send error message to user
        if (msg.chat?.id) {
          try {
            await this.bot!.sendMessage(
              msg.chat.id,
              i18n.t('telegram.responses.processingError')
            );
          } catch (sendError) {
            Logger.error(`Failed to send error message: ${sendError}`);
          }
        }
      }
    });

    Logger.info('Telegram message handler setup complete');
  }

  /**
   * Setup interaction event listeners
   */
  private setupInteractionEventListeners(): void {
    // Listen for new interaction requests from InteractionService
    this.interactionService.on('newRequest', async (request: any) => {
      try {
        Logger.info(`Received new interaction request: ${request.id}, type: ${request.type}`);
        
        if (!this.bot || !this.chatId) {
          Logger.error('Cannot send interaction request - Telegram bot not initialized');
          return;
        }

        // Set waiting state for the interaction request
        this.setWaitingForInput(request.id, this.chatId);
        Logger.info(`Set waiting state for requestId: ${request.id} in chat: ${this.chatId}`);

        // Create notification message for the interaction request
        const notificationMessage = {
          title: i18n.t('telegram.interactions.title'),
          message: request.message,
          priority: 'normal' as const,
          timestamp: new Date(),
          metadata: {
            requestId: request.id,
            type: request.type,
            options: request.options
          }
        };

        // Send the interaction message
        const result = await this.sendNotification(notificationMessage);
        
        if (result.success) {
          Logger.info(`Successfully sent interaction request ${request.id} to Telegram`);
        } else {
          Logger.error(`Failed to send interaction request ${request.id} to Telegram: ${result.error}`);
          // Remove waiting state if notification failed
          this.waitingForInput.delete(request.id);
        }
        
      } catch (error) {
        Logger.error(`Error handling new interaction request: ${error}`);
        // Remove waiting state if error occurred
        this.waitingForInput.delete(request.id);
      }
    });

    Logger.info('Interaction event listeners setup complete');
  }
} 