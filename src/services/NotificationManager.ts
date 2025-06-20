import { ConfigManager } from '../config/ConfigManager.js';
import { i18n } from '../i18n/index.js';
import {
  INotificationService,
  NotificationMessage,
  NotificationResult,
} from '../interfaces/INotificationService.js';
import { Logger } from '../utils/logger.js';
import { NotificationServiceFactory } from './NotificationServiceFactory.js';

/**
 * Notification Manager (Singleton) with Async Initialization
 */
export class NotificationManager {
  private static instance: NotificationManager;
  private services: Map<string, INotificationService> = new Map();
  private activeServices: string[] = [];
  private configManager: ConfigManager;

  private constructor() {
    this.configManager = ConfigManager.getInstance();
  }

  /**
   * Asynchronously gets the singleton instance.
   * The first call will initialize the services.
   */
  public static async getInstance(): Promise<NotificationManager> {
    if (!NotificationManager.instance) {
      const instance = new NotificationManager();
      await instance.initializeServices();
      NotificationManager.instance = instance;
    }
    return NotificationManager.instance;
  }

  private async initializeServices(): Promise<void> {
    const serviceConfigs = this.configManager.getAllServiceConfigs();
    const serviceNames = Object.keys(serviceConfigs);

    const initializationPromises = serviceNames.map(async (name) => {
      try {
        const service = NotificationServiceFactory.createService(name);
        if (service) {
          const config = serviceConfigs[name];
          await service.initialize(config);
          
          if (await service.isHealthy()) {
            this.services.set(name, service);
            this.activeServices.push(name);
            Logger.info(i18n.t('service.initialized', { serviceName: name }));
          } else {
            Logger.warn(`Service ${name} is configured but unhealthy. It will be inactive.`);
          }
        }
      } catch (error) {
        Logger.error(i18n.t('service.initializationFailed', { serviceName: name, error: String(error) }));
      }
    });

    await Promise.all(initializationPromises);
  }

  public getActiveServices(): string[] {
    return this.activeServices;
  }

  public getSupportedServices(): string[] {
    return NotificationServiceFactory.getSupportedServices();
  }

  public async sendNotification(
    message: NotificationMessage,
    serviceName?: string
  ): Promise<NotificationResult> {
    const targetServiceName = serviceName || this.configManager.getDefaultService();
    const service = this.services.get(targetServiceName);

    if (!service) {
      const errorMsg = i18n.t('notification.serviceNotFound', { serviceName: targetServiceName });
      Logger.error(errorMsg);
      return { success: false, error: errorMsg, timestamp: new Date() };
    }

    try {
      return await service.sendNotification(message);
    } catch (error) {
      const errorMsg = i18n.t('notification.sendFailed', { error: String(error) });
      Logger.error(errorMsg);
      return { success: false, error: errorMsg, timestamp: new Date() };
    }
  }

  public async broadcastNotification(
    message: NotificationMessage
  ): Promise<NotificationResult[]> {
    if (this.activeServices.length === 0) {
      Logger.warn(i18n.t('notification.noServicesAvailable'));
      return [];
    }

    const results = await Promise.all(
      this.activeServices.map((name) =>
        this.sendNotification(message, name)
      )
    );

    Logger.info(i18n.t('notification.broadcastComplete'));
    return results;
  }

  public async testService(name: string): Promise<boolean> {
    const service = this.services.get(name);
    if (!service) {
      // If service is not in the active map, it's considered unhealthy
      return this.getSupportedServices().includes(name) ? false : false;
    }
    return await service.isHealthy();
  }

  public async testAllServices(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    const supportedServices = this.getSupportedServices();
  
    for (const name of supportedServices) {
      // Only test services that are active, assume others are false
      results[name] = this.activeServices.includes(name) 
        ? await this.testService(name) 
        : false;
    }
  
    return results;
  }
} 