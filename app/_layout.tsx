
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { analyticsManager } from '../utils/analytics';
import { securityManager } from '../utils/security';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing Source Call app...');
        
        // Initialize security manager
        securityManager.updateConfig({
          enableBiometrics: true,
          enableEncryption: true,
          sessionTimeout: 30 * 60 * 1000, // 30 minutes
          maxLoginAttempts: 5,
        });

        // Initialize analytics
        await analyticsManager.initialize();
        
        // Track app launch
        analyticsManager.trackEvent('app_launched', {
          timestamp: Date.now(),
          version: '1.0.0',
        });

        console.log('App initialization complete');
        
        // Hide splash screen after initialization
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('App initialization error:', error);
        analyticsManager.trackError(error as Error, 'app_initialization');
        
        // Hide splash screen even if there's an error
        await SplashScreen.hideAsync();
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    // Handle app state changes for analytics
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        analyticsManager.trackEvent('app_foreground');
      } else if (nextAppState === 'background') {
        analyticsManager.trackEvent('app_background');
        analyticsManager.flushEvents();
      }
    };

    // Note: In a real app, you'd use AppState from react-native
    // AppState.addEventListener('change', handleAppStateChange);

    return () => {
      // AppState.removeEventListener('change', handleAppStateChange);
      analyticsManager.endSession();
    };
  }, []);



  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth/signin" />
          <Stack.Screen name="auth/signup" />
          <Stack.Screen name="chat/[id]" />
        </Stack>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
