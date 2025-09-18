
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as Network from 'expo-network';
import * as Location from 'expo-location';
import * as TrackingTransparency from 'expo-tracking-transparency';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface UserEvent {
  eventName: string;
  properties: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

export interface UserSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  screenViews: string[];
  events: UserEvent[];
  deviceInfo: DeviceInfo;
  networkInfo: NetworkInfo;
  locationInfo?: LocationInfo;
}

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  osName: string;
  osVersion: string;
  appVersion: string;
  buildVersion: string;
  screenWidth: number;
  screenHeight: number;
  isDevice: boolean;
  brand: string;
  manufacturer: string;
  modelName: string;
  totalMemory?: number;
}

export interface NetworkInfo {
  type: string;
  isConnected: boolean;
  isInternetReachable: boolean;
}

export interface LocationInfo {
  latitude: number;
  longitude: number;
  accuracy: number;
  city?: string;
  country?: string;
  region?: string;
}

export interface AnalyticsConfig {
  enableTracking: boolean;
  enableLocationTracking: boolean;
  enableCrashReporting: boolean;
  enablePerformanceMonitoring: boolean;
  batchSize: number;
  flushInterval: number;
  maxStoredEvents: number;
}

export class AnalyticsManager {
  private static instance: AnalyticsManager;
  private config: AnalyticsConfig;
  private currentSession: UserSession | null = null;
  private eventQueue: UserEvent[] = [];
  private isInitialized = false;
  private hasTrackingPermission = false;

  private constructor() {
    this.config = {
      enableTracking: true,
      enableLocationTracking: false,
      enableCrashReporting: true,
      enablePerformanceMonitoring: true,
      batchSize: 50,
      flushInterval: 30000, // 30 seconds
      maxStoredEvents: 1000,
    };
  }

  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  async initialize(userId?: string): Promise<void> {
    try {
      console.log('Initializing analytics manager...');
      
      // Request tracking permission on iOS
      if (Platform.OS === 'ios') {
        const { status } = await TrackingTransparency.requestTrackingPermissionsAsync();
        this.hasTrackingPermission = status === 'granted';
        console.log('Tracking permission:', status);
      } else {
        this.hasTrackingPermission = true;
      }

      if (!this.hasTrackingPermission || !this.config.enableTracking) {
        console.log('Analytics tracking disabled');
        return;
      }

      // Start new session
      await this.startSession(userId);
      
      // Set up periodic flush
      setInterval(() => {
        this.flushEvents();
      }, this.config.flushInterval);

      this.isInitialized = true;
      console.log('Analytics manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  async startSession(userId?: string): Promise<void> {
    try {
      const sessionId = await this.generateSessionId();
      const deviceInfo = await this.getDeviceInfo();
      const networkInfo = await this.getNetworkInfo();
      const locationInfo = this.config.enableLocationTracking 
        ? await this.getLocationInfo() 
        : undefined;

      this.currentSession = {
        sessionId,
        startTime: Date.now(),
        screenViews: [],
        events: [],
        deviceInfo,
        networkInfo,
        locationInfo,
      };

      // Track session start
      this.trackEvent('session_start', {
        userId,
        deviceInfo,
        networkInfo,
        locationInfo,
      });

      console.log('New session started:', sessionId);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  }

  async endSession(): Promise<void> {
    if (!this.currentSession) return;

    try {
      const endTime = Date.now();
      const duration = endTime - this.currentSession.startTime;

      this.currentSession.endTime = endTime;
      this.currentSession.duration = duration;

      // Track session end
      this.trackEvent('session_end', {
        duration,
        screenViews: this.currentSession.screenViews.length,
        eventsCount: this.currentSession.events.length,
      });

      // Save session data
      await this.saveSession(this.currentSession);
      
      // Flush remaining events
      await this.flushEvents();

      console.log('Session ended:', this.currentSession.sessionId, 'Duration:', duration);
      this.currentSession = null;
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }

  trackEvent(eventName: string, properties: Record<string, any> = {}): void {
    if (!this.hasTrackingPermission || !this.config.enableTracking || !this.currentSession) {
      return;
    }

    try {
      const event: UserEvent = {
        eventName,
        properties: {
          ...properties,
          timestamp: Date.now(),
          sessionId: this.currentSession.sessionId,
        },
        timestamp: Date.now(),
        sessionId: this.currentSession.sessionId,
      };

      this.eventQueue.push(event);
      this.currentSession.events.push(event);

      console.log('Event tracked:', eventName, properties);

      // Auto-flush if queue is full
      if (this.eventQueue.length >= this.config.batchSize) {
        this.flushEvents();
      }
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  trackScreenView(screenName: string, properties: Record<string, any> = {}): void {
    if (!this.currentSession) return;

    this.currentSession.screenViews.push(screenName);
    this.trackEvent('screen_view', {
      screenName,
      ...properties,
    });
  }

  trackUserAction(action: string, target: string, properties: Record<string, any> = {}): void {
    this.trackEvent('user_action', {
      action,
      target,
      ...properties,
    });
  }

  trackPerformance(metric: string, value: number, properties: Record<string, any> = {}): void {
    if (!this.config.enablePerformanceMonitoring) return;

    this.trackEvent('performance_metric', {
      metric,
      value,
      ...properties,
    });
  }

  trackError(error: Error, context: string, properties: Record<string, any> = {}): void {
    if (!this.config.enableCrashReporting) return;

    this.trackEvent('error', {
      errorMessage: error.message,
      errorStack: error.stack,
      context,
      ...properties,
    });
  }

  trackAIUsage(modelName: string, operation: string, duration: number, success: boolean): void {
    this.trackEvent('ai_usage', {
      modelName,
      operation,
      duration,
      success,
      timestamp: Date.now(),
    });
  }

  trackFeatureUsage(featureName: string, properties: Record<string, any> = {}): void {
    this.trackEvent('feature_usage', {
      featureName,
      ...properties,
    });
  }

  async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    try {
      const eventsToFlush = [...this.eventQueue];
      this.eventQueue = [];

      // In a real app, you would send these to your analytics service
      await this.saveEventsLocally(eventsToFlush);
      
      console.log(`Flushed ${eventsToFlush.length} events`);
    } catch (error) {
      console.error('Failed to flush events:', error);
      // Re-add events to queue on failure
      this.eventQueue.unshift(...this.eventQueue);
    }
  }

  private async getDeviceInfo(): Promise<DeviceInfo> {
    try {
      const deviceInfo: DeviceInfo = {
        deviceId: await this.getDeviceId(),
        deviceName: Device.deviceName || 'Unknown',
        deviceType: Device.deviceType?.toString() || 'Unknown',
        osName: Device.osName || Platform.OS,
        osVersion: Device.osVersion || 'Unknown',
        appVersion: Application.nativeApplicationVersion || '1.0.0',
        buildVersion: Application.nativeBuildVersion || '1',
        screenWidth: 0, // Will be set by the UI
        screenHeight: 0, // Will be set by the UI
        isDevice: Device.isDevice,
        brand: Device.brand || 'Unknown',
        manufacturer: Device.manufacturer || 'Unknown',
        modelName: Device.modelName || 'Unknown',
        totalMemory: Device.totalMemory,
      };

      return deviceInfo;
    } catch (error) {
      console.error('Failed to get device info:', error);
      return {
        deviceId: 'unknown',
        deviceName: 'Unknown',
        deviceType: 'Unknown',
        osName: Platform.OS,
        osVersion: 'Unknown',
        appVersion: '1.0.0',
        buildVersion: '1',
        screenWidth: 0,
        screenHeight: 0,
        isDevice: false,
        brand: 'Unknown',
        manufacturer: 'Unknown',
        modelName: 'Unknown',
      };
    }
  }

  private async getNetworkInfo(): Promise<NetworkInfo> {
    try {
      const networkState = await Network.getNetworkStateAsync();
      return {
        type: networkState.type.toString(),
        isConnected: networkState.isConnected,
        isInternetReachable: networkState.isInternetReachable,
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      return {
        type: 'unknown',
        isConnected: false,
        isInternetReachable: false,
      };
    }
  }

  private async getLocationInfo(): Promise<LocationInfo | undefined> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return undefined;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const address = reverseGeocode[0];

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        city: address?.city,
        country: address?.country,
        region: address?.region,
      };
    } catch (error) {
      console.error('Failed to get location info:', error);
      return undefined;
    }
  }

  private async getDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem('analytics_device_id');
      if (!deviceId) {
        deviceId = `${Platform.OS}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        await AsyncStorage.setItem('analytics_device_id', deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('Failed to get device ID:', error);
      return `${Platform.OS}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    }
  }

  private async generateSessionId(): Promise<string> {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private async saveSession(session: UserSession): Promise<void> {
    try {
      const sessions = await this.getStoredSessions();
      sessions.push(session);
      
      // Keep only recent sessions
      const recentSessions = sessions.slice(-100);
      await AsyncStorage.setItem('analytics_sessions', JSON.stringify(recentSessions));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  private async saveEventsLocally(events: UserEvent[]): Promise<void> {
    try {
      const storedEvents = await this.getStoredEvents();
      const allEvents = [...storedEvents, ...events];
      
      // Keep only recent events
      const recentEvents = allEvents.slice(-this.config.maxStoredEvents);
      await AsyncStorage.setItem('analytics_events', JSON.stringify(recentEvents));
    } catch (error) {
      console.error('Failed to save events locally:', error);
    }
  }

  async getStoredSessions(): Promise<UserSession[]> {
    try {
      const sessionsJson = await AsyncStorage.getItem('analytics_sessions');
      return sessionsJson ? JSON.parse(sessionsJson) : [];
    } catch (error) {
      console.error('Failed to get stored sessions:', error);
      return [];
    }
  }

  async getStoredEvents(): Promise<UserEvent[]> {
    try {
      const eventsJson = await AsyncStorage.getItem('analytics_events');
      return eventsJson ? JSON.parse(eventsJson) : [];
    } catch (error) {
      console.error('Failed to get stored events:', error);
      return [];
    }
  }

  // Configuration methods
  updateConfig(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Analytics configuration updated:', this.config);
  }

  getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  // Privacy methods
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem('analytics_sessions');
      await AsyncStorage.removeItem('analytics_events');
      await AsyncStorage.removeItem('analytics_device_id');
      this.eventQueue = [];
      this.currentSession = null;
      console.log('All analytics data cleared');
    } catch (error) {
      console.error('Failed to clear analytics data:', error);
    }
  }

  async exportUserData(): Promise<{ sessions: UserSession[]; events: UserEvent[] }> {
    try {
      const sessions = await this.getStoredSessions();
      const events = await this.getStoredEvents();
      return { sessions, events };
    } catch (error) {
      console.error('Failed to export user data:', error);
      return { sessions: [], events: [] };
    }
  }

  isTrackingEnabled(): boolean {
    return this.hasTrackingPermission && this.config.enableTracking;
  }

  getCurrentSession(): UserSession | null {
    return this.currentSession;
  }
}

export const analyticsManager = AnalyticsManager.getInstance();
