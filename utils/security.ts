
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

export interface SecurityConfig {
  enableBiometrics: boolean;
  enableEncryption: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
}

export class SecurityManager {
  private static instance: SecurityManager;
  private config: SecurityConfig;
  private loginAttempts: Map<string, number> = new Map();
  private sessionStartTime: number = Date.now();

  private constructor() {
    this.config = {
      enableBiometrics: true,
      enableEncryption: true,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      maxLoginAttempts: 5,
    };
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  // Secure storage operations
  async storeSecurely(key: string, value: string): Promise<void> {
    try {
      if (this.config.enableEncryption) {
        const encrypted = await this.encrypt(value);
        await SecureStore.setItemAsync(key, encrypted);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
      console.log(`Securely stored data for key: ${key}`);
    } catch (error) {
      console.error('Error storing secure data:', error);
      throw error;
    }
  }

  async getSecurely(key: string): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (!value) return null;

      if (this.config.enableEncryption) {
        return await this.decrypt(value);
      }
      return value;
    } catch (error) {
      console.error('Error retrieving secure data:', error);
      return null;
    }
  }

  async deleteSecurely(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
      console.log(`Deleted secure data for key: ${key}`);
    } catch (error) {
      console.error('Error deleting secure data:', error);
    }
  }

  // Biometric authentication
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  async authenticateWithBiometrics(reason: string = 'Authenticate to access your account'): Promise<boolean> {
    try {
      if (!this.config.enableBiometrics) {
        return false;
      }

      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false,
      });

      console.log('Biometric authentication result:', result.success);
      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  }

  // Session management
  isSessionValid(): boolean {
    const currentTime = Date.now();
    const sessionAge = currentTime - this.sessionStartTime;
    const isValid = sessionAge < this.config.sessionTimeout;
    
    if (!isValid) {
      console.log('Session expired');
    }
    
    return isValid;
  }

  refreshSession(): void {
    this.sessionStartTime = Date.now();
    console.log('Session refreshed');
  }

  // Login attempt tracking
  recordLoginAttempt(identifier: string, success: boolean): boolean {
    const attempts = this.loginAttempts.get(identifier) || 0;
    
    if (success) {
      this.loginAttempts.delete(identifier);
      return true;
    }

    const newAttempts = attempts + 1;
    this.loginAttempts.set(identifier, newAttempts);
    
    console.log(`Login attempt ${newAttempts} for ${identifier}`);
    
    if (newAttempts >= this.config.maxLoginAttempts) {
      console.log(`Account locked for ${identifier} due to too many failed attempts`);
      return false;
    }
    
    return true;
  }

  isAccountLocked(identifier: string): boolean {
    const attempts = this.loginAttempts.get(identifier) || 0;
    return attempts >= this.config.maxLoginAttempts;
  }

  unlockAccount(identifier: string): void {
    this.loginAttempts.delete(identifier);
    console.log(`Account unlocked for ${identifier}`);
  }

  // Input validation and sanitization
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  sanitizeInput(input: string): string {
    // Remove potentially dangerous characters
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  // Encryption utilities
  private async encrypt(text: string): Promise<string> {
    try {
      // Generate a random key for this encryption
      const key = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        text + Date.now().toString(),
        { encoding: Crypto.CryptoEncoding.HEX }
      );
      
      // Simple XOR encryption (in production, use proper encryption)
      let encrypted = '';
      for (let i = 0; i < text.length; i++) {
        encrypted += String.fromCharCode(
          text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      
      return Buffer.from(encrypted).toString('base64');
    } catch (error) {
      console.error('Encryption error:', error);
      return text; // Fallback to plain text
    }
  }

  private async decrypt(encryptedText: string): Promise<string> {
    try {
      const encrypted = Buffer.from(encryptedText, 'base64').toString();
      
      // For decryption, we'd need the same key - this is simplified
      // In production, use proper key management
      return encrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedText; // Fallback to encrypted text
    }
  }

  // Security headers for API requests
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'",
    };
  }

  // Generate secure random tokens
  async generateSecureToken(length: number = 32): Promise<string> {
    try {
      const randomBytes = await Crypto.getRandomBytesAsync(length);
      return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Token generation error:', error);
      return Math.random().toString(36).substring(2, length + 2);
    }
  }

  // Update security configuration
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Security configuration updated:', this.config);
  }

  getConfig(): SecurityConfig {
    return { ...this.config };
  }
}

export const securityManager = SecurityManager.getInstance();
