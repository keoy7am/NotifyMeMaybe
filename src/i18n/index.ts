import enMessages from './locales/en.js';
import zhTWMessages from './locales/zh-TW.js';
import zhCNMessages from './locales/zh-CN.js';

/**
 * Internationalization Manager
 */
export type SupportedLanguage = 'en' | 'zh-TW' | 'zh-CN';

export interface Messages {
  [key: string]: string | Messages;
}

/**
 * I18n Manager Class
 */
export class I18nManager {
  private static instance: I18nManager;
  private currentLanguage: SupportedLanguage = 'en';
  private messages: Record<SupportedLanguage, Messages> = {
    'en': enMessages,
    'zh-TW': zhTWMessages,
    'zh-CN': zhCNMessages
  };

  private constructor() {
    // Initialize with environment language if available
    const envLanguage = process.env.LANGUAGE as SupportedLanguage;
    if (envLanguage && this.isLanguageSupported(envLanguage)) {
      this.currentLanguage = envLanguage;
    }
  }

  public static getInstance(): I18nManager {
    if (!I18nManager.instance) {
      I18nManager.instance = new I18nManager();
    }
    return I18nManager.instance;
  }

  /**
   * Set current language
   */
  public setLanguage(language: SupportedLanguage): void {
    if (this.isLanguageSupported(language)) {
      this.currentLanguage = language;
    } else {
      console.warn(`Language ${language} is not supported. Using default language.`);
    }
  }

  /**
   * Get current language
   */
  public getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Check if language is supported
   */
  public isLanguageSupported(language: string): language is SupportedLanguage {
    return ['en', 'zh-TW', 'zh-CN'].includes(language);
  }

  /**
   * Get translated message
   */
  public t(key: string, replacements?: Record<string, string>): string {
    const message = this.getMessage(key, this.currentLanguage);
    
    if (!replacements) {
      return message;
    }

    // Replace placeholders
    return Object.entries(replacements).reduce((result, [placeholder, value]) => {
      return result.replace(new RegExp(`{{${placeholder}}}`, 'g'), value);
    }, message);
  }

  /**
   * Get message for specific language
   */
  private getMessage(key: string, language: SupportedLanguage): string {
    const keys = key.split('.');
    let current: any = this.messages[language];

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback to English if key not found
        if (language !== 'en') {
          return this.getMessage(key, 'en');
        }
        return key; // Return key if not found in any language
      }
    }

    return typeof current === 'string' ? current : key;
  }

  /**
   * Get all supported languages
   */
  public getSupportedLanguages(): SupportedLanguage[] {
    return ['en', 'zh-TW', 'zh-CN'];
  }

  /**
   * Get language display name
   */
  public getLanguageDisplayName(language: SupportedLanguage): string {
    const displayNames: Record<SupportedLanguage, string> = {
      'en': 'English',
      'zh-TW': '繁體中文',
      'zh-CN': '简体中文'
    };
    return displayNames[language] || language;
  }
}

// Export singleton instance for easy use
export const i18n = I18nManager.getInstance(); 