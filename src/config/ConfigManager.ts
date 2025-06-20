import { config } from 'dotenv';
import { z } from 'zod';
import { ServiceConfig } from '../interfaces/INotificationService.js';
import { SupportedLanguage, i18n } from '../i18n/index.js';

// Load environment variables
config();

/**
 * Service configuration schema definition
 */
const ServiceConfigSchema = z.object({
  enabled: z.boolean(),
}).passthrough();

const TelegramConfigSchema = ServiceConfigSchema.extend({
  botToken: z.string().min(1),
  chatId: z.string().min(1),
  enablePromptReceiving: z.boolean().optional().default(true),
});

const LineConfigSchema = ServiceConfigSchema.extend({
  channelAccessToken: z.string().min(1),
  userId: z.string().min(1),
});

const WebhookConfigSchema = ServiceConfigSchema.extend({
  url: z.string().url(),
  secret: z.string().optional(),
  headers: z.record(z.string()).optional(),
});

/**
 * Configuration Manager
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private configs: Map<string, ServiceConfig> = new Map();

  private constructor() {
    this.initializeLanguage();
    this.loadConfigs();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Load all service configurations
   */
  private loadConfigs(): void {
    // Telegram configuration
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const telegramConfig = {
        enabled: true,
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        chatId: process.env.TELEGRAM_CHAT_ID,
        enablePromptReceiving: process.env.TELEGRAM_ENABLE_PROMPT_RECEIVING !== 'false', // Default is true
      };
      
      if (this.validateConfig('telegram', telegramConfig)) {
        this.configs.set('telegram', telegramConfig);
      }
    }

    // Custom Webhook configuration
    if (process.env.CUSTOM_WEBHOOK_URL) {
      const webhookConfig = {
        enabled: true,
        url: process.env.CUSTOM_WEBHOOK_URL,
        secret: process.env.CUSTOM_WEBHOOK_SECRET,
        headers: this.parseHeaders(process.env.CUSTOM_WEBHOOK_HEADERS),
      };
      
      if (this.validateConfig('webhook', webhookConfig)) {
        this.configs.set('webhook', webhookConfig);
      }
    }
  }

  /**
   * Get service configuration
   */
  public getConfig(serviceName: string): ServiceConfig | undefined {
    return this.configs.get(serviceName);
  }

  /**
   * Get all available service names
   */
  public getAvailableServices(): string[] {
    return Array.from(this.configs.keys()).filter(
      service => this.configs.get(service)?.enabled === true
    );
  }

  /**
   * Get the default notification service
   */
  public getDefaultService(): string {
    const defaultService = process.env.DEFAULT_NOTIFICATION_SERVICE;
    if (defaultService && this.configs.has(defaultService)) {
      return defaultService;
    }
    
    // If no default service is set, return the first available service
    const availableServices = this.getAvailableServices();
    return availableServices.length > 0 ? availableServices[0] : 'telegram';
  }

  /**
   * Validate service configuration
   */
  private validateConfig(serviceName: string, config: any): boolean {
    try {
      switch (serviceName) {
        case 'telegram':
          TelegramConfigSchema.parse(config);
          return true;

        case 'webhook':
          WebhookConfigSchema.parse(config);
          return true;
        default:
          ServiceConfigSchema.parse(config);
          return true;
      }
    } catch (error) {
      console.error(`Configuration validation failed - ${serviceName}:`, error);
      return false;
    }
  }

  /**
   * Parse header string
   */
  private parseHeaders(headersStr?: string): Record<string, string> | undefined {
    if (!headersStr) return undefined;
    
    try {
      return JSON.parse(headersStr);
    } catch {
      // If not in JSON format, try parsing key=value,key2=value2 format
      const headers: Record<string, string> = {};
      headersStr.split(',').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value) {
          headers[key.trim()] = value.trim();
        }
      });
      return Object.keys(headers).length > 0 ? headers : undefined;
    }
  }

  /**
   * Initialize language settings
   */
  private initializeLanguage(): void {
    const language = process.env.LANGUAGE as SupportedLanguage;
    if (language && i18n.isLanguageSupported(language)) {
      i18n.setLanguage(language);
    }
  }

  /**
   * Get the current language
   */
  public getCurrentLanguage(): SupportedLanguage {
    return i18n.getCurrentLanguage();
  }

  /**
   * Set the language
   */
  public setLanguage(language: SupportedLanguage): void {
    i18n.setLanguage(language);
  }

  /**
   * Get all service configurations
   */
  public getAllServiceConfigs(): Record<string, ServiceConfig> {
    const configs: Record<string, ServiceConfig> = {};
    
    // Convert all loaded configurations
    for (const [serviceName, config] of this.configs.entries()) {
      if (config.enabled) {
        configs[serviceName] = config;
      }
    }
    
    return configs;
  }

  /**
   * Check if debug mode is enabled
   */
  public isDebugMode(): boolean {
    return process.env.DEBUG === 'true';
  }

  /**
   * Get interaction configuration
   */
  public getInteractionConfig(): {
    enabled: boolean;
    timeout: number;
    maxPendingRequests: number;
    autoReject: boolean;
  } {
    return {
      enabled: process.env.TELEGRAM_INTERACTION_ENABLED === 'true',
      timeout: parseInt(process.env.TELEGRAM_INTERACTION_TIMEOUT || '60000'), // 60 seconds default
      maxPendingRequests: parseInt(process.env.TELEGRAM_INTERACTION_MAX_PENDING || '5'),
      autoReject: process.env.INTERACTION_AUTO_REJECT !== 'false', // Default to true
    };
  }

  /**
   * Get environment variable with fallback
   */
  public getEnvVar(key: string, defaultValue?: string): string | undefined {
    return process.env[key] || defaultValue;
  }
} 