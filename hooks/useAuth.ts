
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { securityManager } from '../utils/security';
import { analyticsManager } from '../utils/analytics';
import { AuthState, User } from '../types';
import { currentUser } from '../data/mockData';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('Initializing authentication...');
      
      // Initialize analytics
      await analyticsManager.initialize();
      
      // Check for stored session
      const storedSession = await securityManager.getSecurely('user_session');
      
      if (storedSession && securityManager.isSessionValid()) {
        const sessionData = JSON.parse(storedSession);
        
        if (isSupabaseConfigured()) {
          // Check Supabase session
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              user: {
                id: session.user.id,
                email: session.user.email || '',
                displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'User',
                avatar: session.user.user_metadata?.avatar_url,
                isVerified: session.user.email_confirmed_at !== null,
                createdAt: session.user.created_at,
                lastSeen: new Date().toISOString(),
              },
            });
            
            analyticsManager.trackEvent('auth_session_restored', {
              method: 'supabase',
              userId: session.user.id,
            });
            
            securityManager.refreshSession();
            return;
          }
        } else {
          // Use mock user for local development
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: currentUser,
          });
          
          analyticsManager.trackEvent('auth_session_restored', {
            method: 'local',
            userId: currentUser.id,
          });
          
          securityManager.refreshSession();
          return;
        }
      }

      // No valid session found
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
      
      console.log('No valid session found');
    } catch (error) {
      console.error('Auth initialization error:', error);
      analyticsManager.trackError(error as Error, 'auth_initialization');
      
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      console.log('Attempting sign up for:', email);
      
      // Validate input
      if (!securityManager.validateEmail(email)) {
        throw new Error('Invalid email format');
      }
      
      const passwordValidation = securityManager.validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }
      
      // Sanitize inputs
      const sanitizedEmail = securityManager.sanitizeInput(email);
      const sanitizedDisplayName = displayName ? securityManager.sanitizeInput(displayName) : undefined;
      
      analyticsManager.trackEvent('auth_signup_attempt', {
        email: sanitizedEmail,
        hasDisplayName: !!sanitizedDisplayName,
      });

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email: sanitizedEmail,
          password,
          options: {
            data: {
              display_name: sanitizedDisplayName || sanitizedEmail.split('@')[0],
            },
          },
        });

        if (error) {
          analyticsManager.trackEvent('auth_signup_failed', {
            error: error.message,
            email: sanitizedEmail,
          });
          throw error;
        }

        if (data.user) {
          const user: User = {
            id: data.user.id,
            email: data.user.email || '',
            displayName: data.user.user_metadata?.display_name || sanitizedEmail.split('@')[0],
            avatar: data.user.user_metadata?.avatar_url,
            isVerified: data.user.email_confirmed_at !== null,
            createdAt: data.user.created_at,
            lastSeen: new Date().toISOString(),
          };

          // Store session securely
          await securityManager.storeSecurely('user_session', JSON.stringify({
            user,
            timestamp: Date.now(),
          }));

          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user,
          });

          analyticsManager.trackEvent('auth_signup_success', {
            userId: user.id,
            email: user.email,
          });

          return { data, error: null };
        }
      } else {
        // Mock signup for local development
        const mockUser: User = {
          id: `user_${Date.now()}`,
          email: sanitizedEmail,
          displayName: sanitizedDisplayName || sanitizedEmail.split('@')[0],
          isVerified: false,
          createdAt: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
        };

        await securityManager.storeSecurely('user_session', JSON.stringify({
          user: mockUser,
          timestamp: Date.now(),
        }));

        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: mockUser,
        });

        analyticsManager.trackEvent('auth_signup_success', {
          userId: mockUser.id,
          email: mockUser.email,
          method: 'local',
        });

        return { data: { user: mockUser }, error: null };
      }

      return { data: null, error: new Error('Unknown error occurred') };
    } catch (error) {
      console.error('Sign up error:', error);
      analyticsManager.trackError(error as Error, 'auth_signup');
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      
      // Check if account is locked
      if (securityManager.isAccountLocked(email)) {
        throw new Error('Account is temporarily locked due to too many failed attempts');
      }
      
      // Validate and sanitize input
      if (!securityManager.validateEmail(email)) {
        throw new Error('Invalid email format');
      }
      
      const sanitizedEmail = securityManager.sanitizeInput(email);
      
      analyticsManager.trackEvent('auth_signin_attempt', {
        email: sanitizedEmail,
      });

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password,
        });

        const success = !error && data.user;
        securityManager.recordLoginAttempt(sanitizedEmail, success);

        if (error) {
          analyticsManager.trackEvent('auth_signin_failed', {
            error: error.message,
            email: sanitizedEmail,
          });
          throw error;
        }

        if (data.user) {
          const user: User = {
            id: data.user.id,
            email: data.user.email || '',
            displayName: data.user.user_metadata?.display_name || sanitizedEmail.split('@')[0],
            avatar: data.user.user_metadata?.avatar_url,
            isVerified: data.user.email_confirmed_at !== null,
            createdAt: data.user.created_at,
            lastSeen: new Date().toISOString(),
          };

          // Store session securely
          await securityManager.storeSecurely('user_session', JSON.stringify({
            user,
            timestamp: Date.now(),
          }));

          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user,
          });

          analyticsManager.trackEvent('auth_signin_success', {
            userId: user.id,
            email: user.email,
          });

          return { data, error: null };
        }
      } else {
        // Mock signin for local development
        if (sanitizedEmail === 'demo@sourcecall.com' && password === 'demo123') {
          const mockUser = currentUser;
          
          await securityManager.storeSecurely('user_session', JSON.stringify({
            user: mockUser,
            timestamp: Date.now(),
          }));

          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: mockUser,
          });

          securityManager.recordLoginAttempt(sanitizedEmail, true);
          analyticsManager.trackEvent('auth_signin_success', {
            userId: mockUser.id,
            email: mockUser.email,
            method: 'local',
          });

          return { data: { user: mockUser }, error: null };
        } else {
          securityManager.recordLoginAttempt(sanitizedEmail, false);
          throw new Error('Invalid credentials');
        }
      }

      return { data: null, error: new Error('Unknown error occurred') };
    } catch (error) {
      console.error('Sign in error:', error);
      analyticsManager.trackError(error as Error, 'auth_signin');
      return { data: null, error };
    }
  };

  const signInWithBiometrics = async () => {
    try {
      console.log('Attempting biometric authentication...');
      
      const isAvailable = await securityManager.isBiometricAvailable();
      if (!isAvailable) {
        throw new Error('Biometric authentication is not available');
      }

      const success = await securityManager.authenticateWithBiometrics(
        'Use your biometric to sign in to Source Call'
      );

      if (!success) {
        throw new Error('Biometric authentication failed');
      }

      // Get stored user session
      const storedSession = await securityManager.getSecurely('user_session');
      if (!storedSession) {
        throw new Error('No stored session found');
      }

      const sessionData = JSON.parse(storedSession);
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: sessionData.user,
      });

      analyticsManager.trackEvent('auth_biometric_success', {
        userId: sessionData.user.id,
      });

      securityManager.refreshSession();
      return { data: { user: sessionData.user }, error: null };
    } catch (error) {
      console.error('Biometric authentication error:', error);
      analyticsManager.trackError(error as Error, 'auth_biometric');
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      
      analyticsManager.trackEvent('auth_signout', {
        userId: authState.user?.id,
      });

      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }

      // Clear stored session
      await securityManager.deleteSecurely('user_session');
      
      // End analytics session
      await analyticsManager.endSession();

      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
      analyticsManager.trackError(error as Error, 'auth_signout');
    }
  };

  const refreshSession = async () => {
    try {
      if (isSupabaseConfigured()) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          securityManager.refreshSession();
          analyticsManager.trackEvent('auth_session_refreshed', {
            userId: session.user.id,
          });
        }
      } else {
        securityManager.refreshSession();
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      analyticsManager.trackError(error as Error, 'auth_session_refresh');
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!authState.user) {
        throw new Error('No authenticated user');
      }

      console.log('Updating user profile...');
      
      // Sanitize inputs
      const sanitizedUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
          acc[key] = securityManager.sanitizeInput(value);
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.updateUser({
          data: sanitizedUpdates,
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          const updatedUser: User = {
            ...authState.user,
            ...sanitizedUpdates,
            displayName: data.user.user_metadata?.display_name || authState.user.displayName,
            avatar: data.user.user_metadata?.avatar_url || authState.user.avatar,
          };

          setAuthState(prev => ({
            ...prev,
            user: updatedUser,
          }));

          // Update stored session
          await securityManager.storeSecurely('user_session', JSON.stringify({
            user: updatedUser,
            timestamp: Date.now(),
          }));

          analyticsManager.trackEvent('auth_profile_updated', {
            userId: updatedUser.id,
            updatedFields: Object.keys(sanitizedUpdates),
          });

          return { data: updatedUser, error: null };
        }
      } else {
        // Mock profile update
        const updatedUser = { ...authState.user, ...sanitizedUpdates };
        
        setAuthState(prev => ({
          ...prev,
          user: updatedUser,
        }));

        await securityManager.storeSecurely('user_session', JSON.stringify({
          user: updatedUser,
          timestamp: Date.now(),
        }));

        analyticsManager.trackEvent('auth_profile_updated', {
          userId: updatedUser.id,
          updatedFields: Object.keys(sanitizedUpdates),
          method: 'local',
        });

        return { data: updatedUser, error: null };
      }

      return { data: null, error: new Error('Unknown error occurred') };
    } catch (error) {
      console.error('Profile update error:', error);
      analyticsManager.trackError(error as Error, 'auth_profile_update');
      return { data: null, error };
    }
  };

  return {
    ...authState,
    signUp,
    signIn,
    signInWithBiometrics,
    signOut,
    refreshSession,
    updateProfile,
    isSupabaseConfigured: isSupabaseConfigured(),
    securityManager,
    analyticsManager,
  };
};
