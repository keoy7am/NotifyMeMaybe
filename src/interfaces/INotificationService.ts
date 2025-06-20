/**
 * Notification message structure
 */
export interface NotificationMessage {
  title: string;
  message: string;
  priority?: 'low' | 'normal' | 'high';
  timestamp?: Date;
  metadata?: Record<string, any>;
}

/**
 * Notification result
 */
export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

/**
 * Notification service configuration
 */
export interface ServiceConfig {
  enabled: boolean;
  [key: string]: any;
}

/**
 * Notification service interface
 */
export interface INotificationService {
  /**
   * Service name
   */
  readonly serviceName: string;

  /**
   * Initialize the service
   */
  initialize(config: ServiceConfig): Promise<void>;

  /**
   * Send a notification
   */
  sendNotification(message: NotificationMessage): Promise<NotificationResult>;

  /**
   * Validate if the configuration is correct
   */
  validateConfig(config: ServiceConfig): boolean;

  /**
   * Test the connection
   */
  testConnection(): Promise<boolean>;

  /**
   * Check the service health status
   */
  isHealthy(): Promise<boolean>;
} 