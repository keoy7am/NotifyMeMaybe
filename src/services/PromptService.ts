import { EventEmitter } from 'events';
import { Logger } from '../utils/logger.js';

export interface TelegramPrompt {
  id: string;
  chatId: string;
  username?: string;
  message: string;
  timestamp: Date;
  processed: boolean;
  response?: string;
}

export interface PromptConfig {
  enabled: boolean;
  maxQueueSize: number;
  autoProcess: boolean;
}

/**
 * Prompt service class
 * Handles prompt requests from Telegram
 */
export class PromptService extends EventEmitter {
  private static instance: PromptService;
  private config: PromptConfig;
  private promptQueue: Map<string, TelegramPrompt> = new Map();

  private constructor() {
    super();
    this.config = this.loadConfig();
  }

  public static getInstance(): PromptService {
    if (!PromptService.instance) {
      PromptService.instance = new PromptService();
    }
    return PromptService.instance;
  }

  /**
   * Load prompt configuration
   */
  private loadConfig(): PromptConfig {
    return {
      enabled: process.env.TELEGRAM_PROMPT_ENABLED === 'true',
      maxQueueSize: parseInt(process.env.TELEGRAM_PROMPT_MAX_QUEUE || '10'),
      autoProcess: process.env.TELEGRAM_PROMPT_AUTO_PROCESS !== 'false',
    };
  }

  /**
   * Check if prompt feature is enabled
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Get configuration information
   */
  public getConfig(): PromptConfig {
    return { ...this.config };
  }

  /**
   * Add new prompt to queue
   */
  public async addPrompt(
    chatId: string,
    message: string,
    username?: string
  ): Promise<string> {
    if (!this.config.enabled) {
      throw new Error('Telegram prompt feature is not enabled');
    }

    // Check queue size
    if (this.promptQueue.size >= this.config.maxQueueSize) {
      throw new Error('Prompt queue is full, please try again later');
    }

    const id = this.generatePromptId();
    const prompt: TelegramPrompt = {
      id,
      chatId,
      username,
      message,
      timestamp: new Date(),
      processed: false,
    };

    this.promptQueue.set(id, prompt);
    Logger.info(`New Telegram prompt added to queue: ${id}`);

    // Trigger event
    this.emit('newPrompt', prompt);

    // If auto-processing is enabled, trigger processing event
    if (this.config.autoProcess) {
      this.emit('processPrompt', prompt);
    }

    return id;
  }

  /**
   * Get all pending prompts
   */
  public getPendingPrompts(): TelegramPrompt[] {
    return Array.from(this.promptQueue.values()).filter(p => !p.processed);
  }

  /**
   * Get all prompts (including processed ones)
   */
  public getAllPrompts(): TelegramPrompt[] {
    return Array.from(this.promptQueue.values());
  }

  /**
   * Get prompt by ID
   */
  public getPrompt(id: string): TelegramPrompt | undefined {
    return this.promptQueue.get(id);
  }

  /**
   * Mark prompt as processed and set response
   */
  public markAsProcessed(id: string, response?: string): boolean {
    const prompt = this.promptQueue.get(id);
    if (!prompt) {
      return false;
    }

    prompt.processed = true;
    prompt.response = response;
    
    Logger.info(`Prompt ${id} marked as processed`);
    this.emit('promptProcessed', prompt);
    
    return true;
  }

  /**
   * Remove prompt
   */
  public removePrompt(id: string): boolean {
    const result = this.promptQueue.delete(id);
    if (result) {
      Logger.info(`Prompt ${id} removed from queue`);
      this.emit('promptRemoved', id);
    }
    return result;
  }

  /**
   * Clean up all processed prompts
   */
  public cleanupProcessedPrompts(): number {
    const processedIds = Array.from(this.promptQueue.entries())
      .filter(([, prompt]) => prompt.processed)
      .map(([id]) => id);

    processedIds.forEach(id => this.promptQueue.delete(id));
    
    Logger.info(`Cleaned up ${processedIds.length} processed prompts`);
    return processedIds.length;
  }

  /**
   * Get statistics
   */
  public getStats(): {
    enabled: boolean;
    totalPrompts: number;
    pendingPrompts: number;
    processedPrompts: number;
    maxQueueSize: number;
  } {
    const allPrompts = Array.from(this.promptQueue.values());
    const pendingPrompts = allPrompts.filter(p => !p.processed);
    const processedPrompts = allPrompts.filter(p => p.processed);

    return {
      enabled: this.config.enabled,
      totalPrompts: allPrompts.length,
      pendingPrompts: pendingPrompts.length,
      processedPrompts: processedPrompts.length,
      maxQueueSize: this.config.maxQueueSize,
    };
  }

  /**
   * Generate prompt ID
   */
  private generatePromptId(): string {
    return `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 