import axios from 'axios';
import { 
  INotificationService, 
  NotificationMessage, 
  NotificationResult, 
  ServiceConfig 
} from '../interfaces/INotificationService.js';
import { Logger } from '../utils/logger.js';
import { i18n } from '../i18n/index.js';

/**
 * Webhook notification service (supports Discord and custom webhooks)
 */
export class WebhookService implements INotificationService {
  public readonly serviceName = 'webhook';
  private webhookUrl?: string;

  /**
   * Initialize the service
   */
  public async initialize(config: ServiceConfig): Promise<void> {
    if (!this.validateConfig(config)) {
      throw new Error('Invalid webhook configuration');
    }

    this.webhookUrl = (config as any).webhookUrl;
    console.log('Webhook service initialized successfully');
  }

  /**
   * Send notification
   */
  public async sendNotification(message: NotificationMessage): Promise<NotificationResult> {
    if (!this.webhookUrl) {
      return {
        success: false,
        error: 'Webhook service not initialized',
        timestamp: new Date(),
      };
    }

    try {
      const payload = this.buildPayload(message);
      
      const response = await axios.post(this.webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      return {
        success: response.status >= 200 && response.status < 300,
        messageId: response.headers['x-message-id'] || response.data?.id,
        timestamp: new Date(),
      };
    } catch (error: any) {
      Logger.error(`Failed to send webhook notification: ${error.message}`);
      return {
        success: false,
        error: `Send failed: ${error.message}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Validate configuration
   */
  public validateConfig(config: ServiceConfig): boolean {
    const { webhookUrl } = config as any;
    return !!(
      config.enabled && 
      webhookUrl && 
      typeof webhookUrl === 'string' && 
      webhookUrl.length > 0
    );
  }

  /**
   * Test connection to webhook endpoint
   */
  public async isHealthy(): Promise<boolean> {
    if (!this.webhookUrl) {
      return false;
    }

    try {
      const testMessage: NotificationMessage = {
        title: i18n.t('service.connectionTestSuccess'),
        message: i18n.t('service.connectionTestSuccess'),
        priority: 'low',
        timestamp: new Date(),
      };
      
      const result = await this.sendNotification(testMessage);
      return result.success;
    } catch (error) {
      Logger.error('Webhook health check failed:', error);
      return false;
    }
  }

  /**
   * Test connection
   */
  public async testConnection(): Promise<boolean> {
    if (!this.webhookUrl) {
      return false;
    }

    try {
      const testMessage: NotificationMessage = {
        title: i18n.t('webhook.test.title'),
        message: i18n.t('webhook.test.message'),
        priority: 'low',
        timestamp: new Date(),
      };
      
      const result = await this.sendNotification(testMessage);
      return result.success;
    } catch (error) {
      Logger.error(`Error testing webhook connection: ${error}`);
      return false;
    }
  }

  /**
   * Build request payload
   */
  private buildPayload(message: NotificationMessage): any {
    // Check if it's a Discord webhook
    if (this.webhookUrl?.includes('discord.com') || this.webhookUrl?.includes('discordapp.com')) {
      return this.buildDiscordPayload(message);
    } else {
      // Generic webhook format
      return this.buildGenericPayload(message);
    }
  }

  /**
   * Build Discord format payload
   */
  private buildDiscordPayload(message: NotificationMessage): any {
    const timestamp = message.timestamp || new Date();
    const priorityColor = this.getPriorityColor(message.priority);
    
    return {
      embeds: [{
        title: message.title,
        description: message.message,
        color: priorityColor,
        fields: [
          {
            name: i18n.t('ui.priority'),
            value: message.priority || 'normal',
            inline: true,
          },
        ],
        timestamp: timestamp.toISOString(),
      }],
    };
  }

  /**
   * Build generic format payload
   */
  private buildGenericPayload(message: NotificationMessage): any {
    return {
      title: message.title,
      message: message.message,
      priority: message.priority || 'normal',
      timestamp: (message.timestamp || new Date()).toISOString(),
      metadata: message.metadata,
    };
  }

  /**
   * Get priority color for Discord
   */
  private getPriorityColor(priority?: string): number {
    switch (priority) {
      case 'high':
        return 0xFF0000; // Red
      case 'low':
        return 0x00FF00; // Green
      case 'normal':
      default:
        return 0xFFFF00; // Yellow
    }
  }
} 