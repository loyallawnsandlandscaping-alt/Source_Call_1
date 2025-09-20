
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { securityManager } from './security';

export interface LicenseInfo {
  name: string;
  version: string;
  license: string;
  licenseType: 'MIT' | 'Apache-2.0' | 'BSD' | 'ISC' | 'GPL' | 'LGPL' | 'Other';
  isCompatible: boolean;
  description: string;
  repository?: string;
  homepage?: string;
}

export interface SecurityKey {
  id: string;
  name: string;
  description: string;
  keyType: 'api_key' | 'secret' | 'token' | 'certificate';
  environment: 'development' | 'staging' | 'production';
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
  lastUsed?: string;
  permissions: string[];
}

export class LicenseAnalyzer {
  private static instance: LicenseAnalyzer;
  private licenses: Map<string, LicenseInfo> = new Map();
  private securityKeys: Map<string, SecurityKey> = new Map();

  private constructor() {
    this.initializeLicenseDatabase();
    this.loadSecurityKeys();
  }

  static getInstance(): LicenseAnalyzer {
    if (!LicenseAnalyzer.instance) {
      LicenseAnalyzer.instance = new LicenseAnalyzer();
    }
    return LicenseAnalyzer.instance;
  }

  private initializeLicenseDatabase(): void {
    // Current project dependencies with their licenses
    const dependencies: LicenseInfo[] = [
      // Core React Native & Expo
      {
        name: 'react',
        version: '19.1.0',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'A JavaScript library for building user interfaces',
        repository: 'https://github.com/facebook/react',
        homepage: 'https://reactjs.org/'
      },
      {
        name: 'react-native',
        version: '0.81.4',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'A framework for building native apps using React',
        repository: 'https://github.com/facebook/react-native'
      },
      {
        name: 'expo',
        version: '~54.0.1',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'An open-source platform for making universal native apps',
        repository: 'https://github.com/expo/expo'
      },
      
      // Navigation
      {
        name: '@react-navigation/native',
        version: '^7.0.14',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'Routing and navigation for React Native apps',
        repository: 'https://github.com/react-navigation/react-navigation'
      },
      {
        name: '@react-navigation/native-stack',
        version: '^7.2.0',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'Native stack navigator for React Navigation',
        repository: 'https://github.com/react-navigation/react-navigation'
      },
      {
        name: 'expo-router',
        version: '^6.0.0',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'File-based router for universal React Native apps',
        repository: 'https://github.com/expo/router'
      },

      // Supabase & Database
      {
        name: '@supabase/supabase-js',
        version: '^2.57.4',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'The JavaScript client for Supabase',
        repository: 'https://github.com/supabase/supabase-js'
      },

      // Storage & Security
      {
        name: '@react-native-async-storage/async-storage',
        version: '^2.2.0',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'Asynchronous, persistent, key-value storage system',
        repository: 'https://github.com/react-native-async-storage/async-storage'
      },
      {
        name: 'expo-secure-store',
        version: '^15.0.7',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'Provides a way to encrypt and securely store key–value pairs',
        repository: 'https://github.com/expo/expo'
      },
      {
        name: 'expo-local-authentication',
        version: '^17.0.7',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'Use FaceID and TouchID to authenticate the user',
        repository: 'https://github.com/expo/expo'
      },

      // Media & Camera
      {
        name: 'expo-av',
        version: '^16.0.7',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'Provides unified API for implementing audio and video playback',
        repository: 'https://github.com/expo/expo'
      },
      {
        name: 'expo-camera',
        version: 'Built-in',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'Provides Camera component for taking photos and recording videos',
        repository: 'https://github.com/expo/expo'
      },
      {
        name: 'expo-image-picker',
        version: '^17.0.7',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'Provides access to the system\'s UI for selecting images and videos',
        repository: 'https://github.com/expo/expo'
      },
      {
        name: 'expo-media-library',
        version: '^18.2.0',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'Provides access to the user\'s media library',
        repository: 'https://github.com/expo/expo'
      },

      // UI & Styling
      {
        name: 'expo-linear-gradient',
        version: '^15.0.6',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'Provides a React component that renders a gradient view',
        repository: 'https://github.com/expo/expo'
      },
      {
        name: 'expo-blur',
        version: '^15.0.6',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'Provides a component that renders a native blur view',
        repository: 'https://github.com/expo/expo'
      },
      {
        name: '@expo/vector-icons',
        version: '^15.0.2',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'Built-in support for popular icon fonts and the icon images',
        repository: 'https://github.com/expo/vector-icons'
      },

      // Gestures & Animations
      {
        name: 'react-native-gesture-handler',
        version: '^2.24.0',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'Declarative API exposing platform native touch and gesture system',
        repository: 'https://github.com/software-mansion/react-native-gesture-handler'
      },
      {
        name: 'react-native-reanimated',
        version: '~4.1.0',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'React Native\'s Animated library reimplemented',
        repository: 'https://github.com/software-mansion/react-native-reanimated'
      },
      {
        name: 'expo-haptics',
        version: '^15.0.6',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'Provides access to the system\'s haptics engine',
        repository: 'https://github.com/expo/expo'
      },

      // System & Device
      {
        name: 'expo-device',
        version: '^8.0.7',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'Provides specific information about the device',
        repository: 'https://github.com/expo/expo'
      },
      {
        name: 'expo-application',
        version: '^7.0.7',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'Provides application information',
        repository: 'https://github.com/expo/expo'
      },
      {
        name: 'expo-constants',
        version: '~18.0.8',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'Provides system information that remains constant throughout the lifetime of your app',
        repository: 'https://github.com/expo/expo'
      },
      {
        name: 'expo-location',
        version: '^19.0.7',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'Allows reading geolocation information from the device',
        repository: 'https://github.com/expo/expo'
      },
      {
        name: 'expo-network',
        version: '^8.0.7',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'Provides network information',
        repository: 'https://github.com/expo/expo'
      },

      // Analytics & Tracking
      {
        name: 'expo-analytics-amplitude',
        version: '^11.2.0',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'Provides access to Amplitude mobile analytics',
        repository: 'https://github.com/expo/expo'
      },
      {
        name: 'expo-tracking-transparency',
        version: '^6.0.7',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'Provides access to the tracking transparency API on iOS',
        repository: 'https://github.com/expo/expo'
      },

      // File System & Storage
      {
        name: 'expo-file-system',
        version: '^19.0.14',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'Provides access to the local file system on the device',
        repository: 'https://github.com/expo/expo'
      },

      // Maps (Note: Not supported in Natively)
      {
        name: 'react-native-maps',
        version: '^1.20.1',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'React Native Mapview component for iOS + Android (Note: Web not supported in Natively)',
        repository: 'https://github.com/react-native-maps/react-native-maps'
      },

      // Web & PWA
      {
        name: 'react-native-web',
        version: '~0.21.1',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'React Native Components and APIs for the Web',
        repository: 'https://github.com/necolas/react-native-web'
      },
      {
        name: 'workbox-precaching',
        version: '^7.3.0',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'Workbox precaching module',
        repository: 'https://github.com/GoogleChrome/workbox'
      },

      // Build Tools & Development
      {
        name: '@babel/runtime',
        version: '^7.26.9',
        license: 'MIT',
        licenseType: 'MIT',
        isCompatible: true,
        description: 'Babel\'s modular runtime helpers',
        repository: 'https://github.com/babel/babel'
      },
      {
        name: 'typescript',
        version: '^5.8.3',
        license: 'Apache-2.0',
        licenseType: 'Apache-2.0',
        isCompatible: true,
        description: 'TypeScript is a language for application scale JavaScript development',
        repository: 'https://github.com/microsoft/TypeScript'
      }
    ];

    // Store all licenses
    dependencies.forEach(dep => {
      this.licenses.set(dep.name, dep);
    });

    console.log(`Initialized license database with ${dependencies.length} dependencies`);
  }

  private async loadSecurityKeys(): Promise<void> {
    try {
      const storedKeys = await AsyncStorage.getItem('security_keys');
      if (storedKeys) {
        const keys: SecurityKey[] = JSON.parse(storedKeys);
        keys.forEach(key => {
          this.securityKeys.set(key.id, key);
        });
        console.log(`Loaded ${keys.length} security keys from storage`);
      }
    } catch (error) {
      console.error('Error loading security keys:', error);
    }
  }

  private async saveSecurityKeys(): Promise<void> {
    try {
      const keys = Array.from(this.securityKeys.values());
      await AsyncStorage.setItem('security_keys', JSON.stringify(keys));
      console.log(`Saved ${keys.length} security keys to storage`);
    } catch (error) {
      console.error('Error saving security keys:', error);
    }
  }

  // License Analysis Methods
  getAllLicenses(): LicenseInfo[] {
    return Array.from(this.licenses.values());
  }

  getLicensesByType(licenseType: string): LicenseInfo[] {
    return Array.from(this.licenses.values()).filter(
      license => license.licenseType === licenseType
    );
  }

  getMITLicenses(): LicenseInfo[] {
    return this.getLicensesByType('MIT');
  }

  getApacheLicenses(): LicenseInfo[] {
    return this.getLicensesByType('Apache-2.0');
  }

  getCompatibleLicenses(): LicenseInfo[] {
    return Array.from(this.licenses.values()).filter(
      license => license.isCompatible
    );
  }

  getLicenseCompatibilityReport(): {
    total: number;
    compatible: number;
    incompatible: number;
    byType: Record<string, number>;
    recommendations: string[];
  } {
    const all = this.getAllLicenses();
    const compatible = this.getCompatibleLicenses();
    const byType: Record<string, number> = {};
    const recommendations: string[] = [];

    all.forEach(license => {
      byType[license.licenseType] = (byType[license.licenseType] || 0) + 1;
    });

    // Generate recommendations
    if (byType['GPL'] || byType['LGPL']) {
      recommendations.push('Consider replacing GPL/LGPL licensed dependencies for commercial use');
    }

    if (compatible.length === all.length) {
      recommendations.push('All dependencies use compatible licenses (MIT/Apache-2.0)');
    }

    recommendations.push('MIT and Apache-2.0 licenses are fully compatible for commercial apps');
    recommendations.push('Both licenses allow modification, distribution, and commercial use');

    return {
      total: all.length,
      compatible: compatible.length,
      incompatible: all.length - compatible.length,
      byType,
      recommendations
    };
  }

  // Security Key Management Methods
  async createSecurityKey(keyData: Omit<SecurityKey, 'id' | 'createdAt'>): Promise<SecurityKey> {
    const id = await securityManager.generateSecureToken(16);
    const securityKey: SecurityKey = {
      ...keyData,
      id,
      createdAt: new Date().toISOString()
    };

    this.securityKeys.set(id, securityKey);
    await this.saveSecurityKeys();
    
    console.log(`Created security key: ${keyData.name}`);
    return securityKey;
  }

  async storeSecretKey(keyId: string, secretValue: string): Promise<void> {
    const key = this.securityKeys.get(keyId);
    if (!key) {
      throw new Error('Security key not found');
    }

    await securityManager.storeSecurely(`secret_${keyId}`, secretValue);
    
    // Update last used timestamp
    key.lastUsed = new Date().toISOString();
    this.securityKeys.set(keyId, key);
    await this.saveSecurityKeys();
    
    console.log(`Stored secret for key: ${key.name}`);
  }

  async getSecretKey(keyId: string): Promise<string | null> {
    const key = this.securityKeys.get(keyId);
    if (!key || !key.isActive) {
      console.log(`Key not found or inactive: ${keyId}`);
      return null;
    }

    // Check expiration
    if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
      console.log(`Key expired: ${key.name}`);
      return null;
    }

    const secretValue = await securityManager.getSecurely(`secret_${keyId}`);
    
    if (secretValue) {
      // Update last used timestamp
      key.lastUsed = new Date().toISOString();
      this.securityKeys.set(keyId, key);
      await this.saveSecurityKeys();
    }

    return secretValue;
  }

  getAllSecurityKeys(): SecurityKey[] {
    return Array.from(this.securityKeys.values());
  }

  getActiveSecurityKeys(): SecurityKey[] {
    return Array.from(this.securityKeys.values()).filter(key => key.isActive);
  }

  async deactivateSecurityKey(keyId: string): Promise<void> {
    const key = this.securityKeys.get(keyId);
    if (key) {
      key.isActive = false;
      this.securityKeys.set(keyId, key);
      await this.saveSecurityKeys();
      console.log(`Deactivated security key: ${key.name}`);
    }
  }

  async deleteSecurityKey(keyId: string): Promise<void> {
    const key = this.securityKeys.get(keyId);
    if (key) {
      // Delete the stored secret
      await securityManager.deleteSecurely(`secret_${keyId}`);
      
      // Remove from memory
      this.securityKeys.delete(keyId);
      await this.saveSecurityKeys();
      
      console.log(`Deleted security key: ${key.name}`);
    }
  }

  // Utility Methods
  async initializeDefaultKeys(): Promise<void> {
    const defaultKeys = [
      {
        name: 'Supabase API Key',
        description: 'Anonymous key for Supabase client',
        keyType: 'api_key' as const,
        environment: 'production' as const,
        isActive: true,
        permissions: ['read', 'write', 'auth']
      },
      {
        name: 'Supabase Service Role',
        description: 'Service role key for admin operations',
        keyType: 'secret' as const,
        environment: 'production' as const,
        isActive: false,
        permissions: ['admin', 'bypass_rls']
      },
      {
        name: 'OpenAI API Key',
        description: 'API key for OpenAI services',
        keyType: 'api_key' as const,
        environment: 'production' as const,
        isActive: false,
        permissions: ['ai_inference']
      },
      {
        name: 'Analytics Key',
        description: 'Key for analytics services',
        keyType: 'token' as const,
        environment: 'production' as const,
        isActive: true,
        permissions: ['analytics', 'tracking']
      }
    ];

    for (const keyData of defaultKeys) {
      // Only create if it doesn't exist
      const existing = Array.from(this.securityKeys.values()).find(
        key => key.name === keyData.name
      );
      
      if (!existing) {
        await this.createSecurityKey(keyData);
      }
    }
  }

  generateSecurityReport(): {
    licenseCompliance: any;
    securityKeys: {
      total: number;
      active: number;
      expired: number;
      byType: Record<string, number>;
    };
    recommendations: string[];
  } {
    const licenseCompliance = this.getLicenseCompatibilityReport();
    const allKeys = this.getAllSecurityKeys();
    const activeKeys = this.getActiveSecurityKeys();
    const now = new Date();
    
    const expiredKeys = allKeys.filter(key => 
      key.expiresAt && new Date(key.expiresAt) < now
    );

    const keysByType: Record<string, number> = {};
    allKeys.forEach(key => {
      keysByType[key.keyType] = (keysByType[key.keyType] || 0) + 1;
    });

    const recommendations = [
      ...licenseCompliance.recommendations,
      `${activeKeys.length} active security keys configured`,
      expiredKeys.length > 0 ? `${expiredKeys.length} keys have expired and should be renewed` : 'All keys are current',
      'Regularly rotate API keys and secrets for security',
      'Use environment-specific keys for development, staging, and production'
    ];

    return {
      licenseCompliance,
      securityKeys: {
        total: allKeys.length,
        active: activeKeys.length,
        expired: expiredKeys.length,
        byType: keysByType
      },
      recommendations
    };
  }
}

export const licenseAnalyzer = LicenseAnalyzer.getInstance();
