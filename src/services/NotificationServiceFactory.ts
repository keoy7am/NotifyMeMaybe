import { INotificationService } from '../interfaces/INotificationService.js';
import { TelegramService } from './TelegramService.js';
import { WebhookService } from './WebhookService.js';

/**
 * Notification service factory
 */
export class NotificationServiceFactory {
  private static serviceInstances: Record<string, INotificationService> = {};

  /**
   * Create notification service instance (singleton pattern)
   */
  public static createService(serviceName: string): INotificationService | null {
    // Return existing instance if available
    if (this.serviceInstances[serviceName]) {
      return this.serviceInstances[serviceName];
    }

    try {
      let service: INotificationService | null = null;
      
      switch (serviceName) {
        case 'telegram':
          service = TelegramService.getInstance();
          break;
        case 'webhook':
          service = new WebhookService();
          break;
        default:
          console.error(`Unsupported notification service: ${serviceName}`);
          return null;
      }

      if (service) {
        this.serviceInstances[serviceName] = service;
      }
      
      return service;
    } catch (error) {
      console.error(`Failed to create service (${serviceName}):`, error);
      return null;
    }
  }

  /**
   * Get all supported service names
   */
  public static getSupportedServices(): string[] {
    return ['telegram', 'webhook'];
  }

  /**
   * Check if specified service is supported
   */
  public static isServiceSupported(serviceName: string): boolean {
    return ['telegram', 'webhook'].includes(serviceName);
  }
} 