
import { useState, useEffect } from 'react';
import { AuthState, User } from '../types';
import { currentUser } from '../data/mockData';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking authentication status...');
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        // Simulate API call to verify token
        setTimeout(() => {
          setAuthState({
            user: currentUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        }, 1000);
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.log('Auth check error:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Authentication check failed',
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in user:', email);
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful login
      const token = 'mock_jwt_token_' + Date.now();
      await SecureStore.setItemAsync('auth_token', token);
      
      setAuthState({
        user: currentUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      return { success: true };
    } catch (error) {
      console.log('Sign in error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Invalid credentials',
      }));
      return { success: false, error: 'Invalid credentials' };
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      console.log('Signing up user:', email);
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful registration
      const token = 'mock_jwt_token_' + Date.now();
      await SecureStore.setItemAsync('auth_token', token);
      
      const newUser: User = {
        ...currentUser,
        email,
        displayName,
        username: email.split('@')[0],
        isVerified: false,
      };
      
      setAuthState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      return { success: true };
    } catch (error) {
      console.log('Sign up error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Registration failed',
      }));
      return { success: false, error: 'Registration failed' };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user...');
      await SecureStore.deleteItemAsync('auth_token');
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.log('Sign out error:', error);
    }
  };

  const authenticateWithBiometrics = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!hasHardware || !isEnrolled) {
        return { success: false, error: 'Biometric authentication not available' };
      }
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your messages',
        fallbackLabel: 'Use passcode',
      });
      
      if (result.success) {
        await checkAuthStatus();
        return { success: true };
      } else {
        return { success: false, error: 'Authentication failed' };
      }
    } catch (error) {
      console.log('Biometric auth error:', error);
      return { success: false, error: 'Biometric authentication failed' };
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    authenticateWithBiometrics,
    checkAuthStatus,
  };
};
