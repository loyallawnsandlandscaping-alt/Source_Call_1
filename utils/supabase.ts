
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyticsManager } from './analytics';
import { securityManager } from './security';

// These will be set when the user connects to Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      ...securityManager.getSecurityHeaders(),
    },
  },
});

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  const isConfigured = !!(supabaseUrl && supabaseAnonKey);
  console.log('Supabase configuration status:', isConfigured);
  return isConfigured;
};

// Enhanced error handling for Supabase operations
export const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Supabase ${operation} error:`, error);
  
  // Track error in analytics
  analyticsManager.trackError(error, `supabase_${operation}`, {
    errorCode: error.code,
    errorMessage: error.message,
    operation,
  });

  // Return user-friendly error message
  switch (error.code) {
    case 'invalid_credentials':
      return 'Invalid email or password. Please try again.';
    case 'email_not_confirmed':
      return 'Please check your email and click the confirmation link.';
    case 'signup_disabled':
      return 'New user registration is currently disabled.';
    case 'email_address_invalid':
      return 'Please enter a valid email address.';
    case 'password_too_short':
      return 'Password must be at least 6 characters long.';
    case 'user_already_registered':
      return 'An account with this email already exists.';
    case 'rate_limit_exceeded':
      return 'Too many requests. Please wait a moment and try again.';
    case 'network_error':
      return 'Network error. Please check your internet connection.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};

// Enhanced database operations with error handling and analytics
export const supabaseOperations = {
  // Profile operations
  async getProfile(userId: string) {
    try {
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const duration = Date.now() - startTime;
      analyticsManager.trackPerformance('supabase_get_profile', duration);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error, 'get_profile') };
    }
  },

  async updateProfile(userId: string, updates: any) {
    try {
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      const duration = Date.now() - startTime;
      analyticsManager.trackPerformance('supabase_update_profile', duration);

      if (error) throw error;
      
      analyticsManager.trackEvent('profile_updated', {
        userId,
        updatedFields: Object.keys(updates),
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error, 'update_profile') };
    }
  },

  // Chat operations
  async getChats(userId: string) {
    try {
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('chat_list_view')
        .select('*')
        .order('updated_at', { ascending: false });

      const duration = Date.now() - startTime;
      analyticsManager.trackPerformance('supabase_get_chats', duration);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error, 'get_chats') };
    }
  },

  async createChat(chatData: any) {
    try {
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('chats')
        .insert(chatData)
        .select()
        .single();

      const duration = Date.now() - startTime;
      analyticsManager.trackPerformance('supabase_create_chat', duration);

      if (error) throw error;
      
      analyticsManager.trackEvent('chat_created', {
        chatId: data.id,
        chatType: data.type,
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error, 'create_chat') };
    }
  },

  // Message operations
  async getMessages(chatId: string, limit: number = 50) {
    try {
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(id, display_name, avatar_url),
          reactions:message_reactions(emoji, user_id, profiles(display_name))
        `)
        .eq('chat_id', chatId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      const duration = Date.now() - startTime;
      analyticsManager.trackPerformance('supabase_get_messages', duration);

      if (error) throw error;
      return { data: data?.reverse() || [], error: null };
    } catch (error) {
      return { data: [], error: handleSupabaseError(error, 'get_messages') };
    }
  },

  async sendMessage(messageData: any) {
    try {
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select(`
          *,
          sender:profiles(id, display_name, avatar_url)
        `)
        .single();

      const duration = Date.now() - startTime;
      analyticsManager.trackPerformance('supabase_send_message', duration);

      if (error) throw error;
      
      analyticsManager.trackEvent('message_sent', {
        chatId: messageData.chat_id,
        messageType: messageData.message_type,
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error, 'send_message') };
    }
  },

  // AI operations
  async saveAIAnnotation(annotationData: any) {
    try {
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('ai_annotations')
        .insert(annotationData)
        .select()
        .single();

      const duration = Date.now() - startTime;
      analyticsManager.trackPerformance('supabase_save_ai_annotation', duration);

      if (error) throw error;
      
      analyticsManager.trackEvent('ai_annotation_saved', {
        annotationType: annotationData.annotation_type,
        modelName: annotationData.model_name,
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error, 'save_ai_annotation') };
    }
  },

  async logAIUsage(usageData: any) {
    try {
      const { data, error } = await supabase
        .from('ai_model_usage')
        .insert(usageData);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error, 'log_ai_usage') };
    }
  },

  // Analytics operations
  async saveUserSession(sessionData: any) {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error, 'save_user_session') };
    }
  },

  async saveUserEvents(events: any[]) {
    try {
      const { data, error } = await supabase
        .from('user_events')
        .insert(events);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error, 'save_user_events') };
    }
  },

  // Real-time subscriptions
  subscribeToChat(chatId: string, callback: (payload: any) => void) {
    const subscription = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        callback
      )
      .subscribe();

    analyticsManager.trackEvent('realtime_subscription_created', {
      type: 'chat',
      chatId,
    });

    return subscription;
  },

  subscribeToUserPresence(userId: string, callback: (payload: any) => void) {
    const subscription = supabase
      .channel(`user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    return subscription;
  },
};

// Connection health monitoring
export const monitorConnection = () => {
  let isConnected = true;
  
  const checkConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (error) throw error;
      
      if (!isConnected) {
        isConnected = true;
        analyticsManager.trackEvent('supabase_connection_restored');
        console.log('Supabase connection restored');
      }
    } catch (error) {
      if (isConnected) {
        isConnected = false;
        analyticsManager.trackEvent('supabase_connection_lost', {
          error: error.message,
        });
        console.log('Supabase connection lost:', error.message);
      }
    }
  };

  // Check connection every 30 seconds
  const interval = setInterval(checkConnection, 30000);
  
  // Initial check
  checkConnection();
  
  return () => clearInterval(interval);
};

// Initialize connection monitoring if Supabase is configured
if (isSupabaseConfigured()) {
  monitorConnection();
}

export default supabase;
