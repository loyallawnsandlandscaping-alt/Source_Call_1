
import { useState, useEffect } from 'react';
import { AuthState, User } from '../types';
import { currentUser } from '../data/mockData';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    checkAuthStatus();
    
    // Listen for auth changes if Supabase is configured
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Supabase auth event:', event);
          if (session?.user) {
            const user: User = {
              id: session.user.id,
              email: session.user.email || '',
              displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || '',
              username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || '',
              avatar: session.user.user_metadata?.avatar_url || currentUser.avatar,
              isOnline: true,
              lastSeen: new Date(),
              isVerified: session.user.email_confirmed_at !== null,
            };
            
            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking authentication status...');
      
      if (isSupabaseConfigured()) {
        // Use Supabase authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || '',
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || '',
            avatar: session.user.user_metadata?.avatar_url || currentUser.avatar,
            isOnline: true,
            lastSeen: new Date(),
            isVerified: session.user.email_confirmed_at !== null,
          };
          
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } else {
        // Fallback to local authentication
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
      
      if (isSupabaseConfigured()) {
        // Use Supabase authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: error.message,
          }));
          return { success: false, error: error.message };
        }
        
        return { success: true };
      } else {
        // Fallback to mock authentication
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const token = 'mock_jwt_token_' + Date.now();
        await SecureStore.setItemAsync('auth_token', token);
        
        setAuthState({
          user: currentUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        return { success: true };
      }
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
      
      if (isSupabaseConfigured()) {
        // Use Supabase authentication
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
              username: email.split('@')[0],
            }
          }
        });
        
        if (error) {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: error.message,
          }));
          return { success: false, error: error.message };
        }
        
        // User will be automatically signed in if email confirmation is disabled
        // Otherwise, they need to confirm their email first
        return { success: true };
      } else {
        // Fallback to mock authentication
        await new Promise(resolve => setTimeout(resolve, 2000));
        
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
      }
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
      
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      } else {
        await SecureStore.deleteItemAsync('auth_token');
      }
      
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
        promptMessage: 'Authenticate to access Source Call',
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
    isSupabaseConfigured: isSupabaseConfigured(),
  };
};
