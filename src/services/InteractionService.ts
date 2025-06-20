import { EventEmitter } from 'events';
import { i18n } from '../i18n/index.js';
import { ConfigManager } from '../config/ConfigManager.js';

export interface InteractionRequest {
  id: string;
  type: 'prompt' | 'confirmation' | 'selection';
  message: string;
  options?: string[];
  timeout?: number;
  timestamp: Date;
}

export interface InteractionResponse {
  id: string;
  response: string | boolean;
  timestamp: Date;
}

export interface InteractionConfig {
  enabled: boolean;
  timeout: number; // Default timeout in milliseconds
  maxPendingRequests: number; // Maximum number of pending requests
  autoReject: boolean; // Whether to auto-reject after timeout
}

/**
 * Interaction service class
 * Handles interaction between agent and users
 */
export class InteractionService extends EventEmitter {
  private static instance: InteractionService;
  private config: InteractionConfig;
  private pendingRequests: Map<string, InteractionRequest> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    super();
    this.config = this.loadConfig();
    this.setupTimeoutCleanup();
  }

  public static getInstance(): InteractionService {
    if (!InteractionService.instance) {
      InteractionService.instance = new InteractionService();
    }
    return InteractionService.instance;
  }

  /**
   * Load interaction configuration
   */
  private loadConfig(): InteractionConfig {
    const configManager = ConfigManager.getInstance();
    return configManager.getInteractionConfig();
  }

  /**
   * Check if interaction feature is enabled
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Get configuration information
   */
  public getConfig(): InteractionConfig {
    return { ...this.config };
  }

  /**
   * Create interaction request
   */
  public async createInteractionRequest(
    type: InteractionRequest['type'],
    message: string,
    options?: string[],
    customTimeout?: number
  ): Promise<string> {
    if (!this.config.enabled) {
      throw new Error(i18n.t('interaction.disabled'));
    }

    if (this.pendingRequests.size >= this.config.maxPendingRequests) {
      throw new Error(i18n.t('interaction.tooManyPendingRequests'));
    }

    const id = this.generateRequestId();
    // Use custom timeout if provided and valid, otherwise use configured default
    const timeout = (customTimeout && customTimeout > 0) ? customTimeout : this.config.timeout;
    
    const request: InteractionRequest = {
      id,
      type,
      message,
      options,
      timeout,
      timestamp: new Date(),
    };

    this.pendingRequests.set(id, request);
    this.setupTimeout(id, timeout);

    // Trigger event for external listeners to know about new request
    this.emit('newRequest', request);

    return id;
  }

  /**
   * Wait for interaction response
   */
  public async waitForResponse(requestId: string): Promise<InteractionResponse> {
    return new Promise((resolve, reject) => {
      const request = this.pendingRequests.get(requestId);
      if (!request) {
        reject(new Error(i18n.t('interaction.requestNotFound')));
        return;
      }

      const responseHandler = (response: InteractionResponse) => {
        if (response.id === requestId) {
          this.removeAllListeners(`response-${requestId}`);
          this.removeAllListeners(`timeout-${requestId}`);
          resolve(response);
        }
      };

      const timeoutHandler = () => {
        this.removeAllListeners(`response-${requestId}`);
        this.removeAllListeners(`timeout-${requestId}`);
        reject(new Error(i18n.t('interaction.timeout')));
      };

      this.once(`response-${requestId}`, responseHandler);
      this.once(`timeout-${requestId}`, timeoutHandler);
    });
  }

  /**
   * Provide interaction response
   */
  public async provideResponse(requestId: string, response: string | boolean): Promise<boolean> {
    const request = this.pendingRequests.get(requestId);
    if (!request) {
      return false;
    }

    const interactionResponse: InteractionResponse = {
      id: requestId,
      response,
      timestamp: new Date(),
    };

    // Clean up timeout
    this.clearTimeout(requestId);
    this.pendingRequests.delete(requestId);

    // Trigger response event
    this.emit(`response-${requestId}`, interactionResponse);

    return true;
  }

  /**
   * Get all pending requests
   */
  public getPendingRequests(): InteractionRequest[] {
    return Array.from(this.pendingRequests.values());
  }

  /**
   * Cancel interaction request
   */
  public cancelRequest(requestId: string): boolean {
    const request = this.pendingRequests.get(requestId);
    if (!request) {
      return false;
    }

    this.clearTimeout(requestId);
    this.pendingRequests.delete(requestId);
    
    // Trigger cancel event
    this.emit(`cancel-${requestId}`);
    
    return true;
  }

  /**
   * Clean up all pending requests
   */
  public clearAllRequests(): void {
    const requestIds = Array.from(this.pendingRequests.keys());
    requestIds.forEach(id => this.cancelRequest(id));
  }

  /**
   * Generate request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set up timeout handling
   */
  private setupTimeout(requestId: string, timeout: number): void {
    const timeoutHandle = setTimeout(() => {
      const request = this.pendingRequests.get(requestId);
      if (request) {
        this.pendingRequests.delete(requestId);
        this.timeouts.delete(requestId);
        
        if (this.config.autoReject) {
          // Auto-reject timeout requests
          this.emit(`timeout-${requestId}`);
        }
      }
    }, timeout);

    this.timeouts.set(requestId, timeoutHandle);
  }

  /**
   * Clean up timeout handler
   */
  private clearTimeout(requestId: string): void {
    const timeoutHandle = this.timeouts.get(requestId);
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
      this.timeouts.delete(requestId);
    }
  }

  /**
   * Set up periodic cleanup of timeout requests
   */
  private setupTimeoutCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [id, request] of this.pendingRequests.entries()) {
        const requestTimeout = request.timeout || this.config.timeout;
        if (now - request.timestamp.getTime() > requestTimeout) {
          this.cancelRequest(id);
        }
      }
    }, 60000); // Clean up every minute
  }

  /**
   * Get interaction statistics
   */
  public getStats(): {
    enabled: boolean;
    pendingCount: number;
    maxPending: number;
    timeout: number;
    autoReject: boolean;
  } {
    return {
      enabled: this.config.enabled,
      pendingCount: this.pendingRequests.size,
      maxPending: this.config.maxPendingRequests,
      timeout: this.config.timeout,
      autoReject: this.config.autoReject,
    };
  }
} 