
import { useState, useEffect } from 'react';
import { Message, Chat } from '../types';
import { mockMessages, mockChats } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

export const useMessages = (chatId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChats();
    if (chatId) {
      loadMessages(chatId);
    }

    // Set up real-time subscriptions if Supabase is configured
    if (isSupabaseConfigured()) {
      const messagesSubscription = supabase
        .channel('messages')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            console.log('New message received:', payload.new);
            const newMessage = payload.new as Message;
            setMessages(prev => [...prev, newMessage]);
            
            // Update chat's last message
            setChats(prev => prev.map(chat => 
              chat.id === newMessage.chatId 
                ? { ...chat, lastMessage: newMessage, updatedAt: new Date() }
                : chat
            ));
          }
        )
        .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'messages' },
          (payload) => {
            console.log('Message updated:', payload.new);
            const updatedMessage = payload.new as Message;
            setMessages(prev => prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            ));
          }
        )
        .subscribe();

      const chatsSubscription = supabase
        .channel('chats')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'chats' },
          (payload) => {
            console.log('Chat updated:', payload);
            loadChats(); // Reload chats when any chat changes
          }
        )
        .subscribe();

      return () => {
        messagesSubscription.unsubscribe();
        chatsSubscription.unsubscribe();
      };
    }
  }, [chatId]);

  const loadChats = async () => {
    try {
      console.log('Loading chats...');
      setIsLoading(true);
      
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('chats')
          .select(`
            *,
            participants:chat_participants(
              user:users(*)
            ),
            last_message:messages(*)
          `)
          .order('updated_at', { ascending: false });

        if (error) {
          console.log('Supabase error loading chats:', error);
          setError('Failed to load chats');
        } else {
          setChats(data || []);
          setError(null);
        }
      } else {
        // Fallback to mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        setChats(mockChats);
        setError(null);
      }
    } catch (err) {
      console.log('Error loading chats:', err);
      setError('Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      console.log('Loading messages for chat:', chatId);
      setIsLoading(true);
      
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender:users(*),
            reactions:message_reactions(
              *,
              user:users(*)
            )
          `)
          .eq('chat_id', chatId)
          .order('timestamp', { ascending: true });

        if (error) {
          console.log('Supabase error loading messages:', error);
          setError('Failed to load messages');
        } else {
          setMessages(data || []);
          setError(null);
        }
      } else {
        // Fallback to mock data
        await new Promise(resolve => setTimeout(resolve, 300));
        const chatMessages = mockMessages.filter(msg => msg.chatId === chatId);
        setMessages(chatMessages);
        setError(null);
      }
    } catch (err) {
      console.log('Error loading messages:', err);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (chatId: string, content: string, type: Message['type'] = 'text') => {
    try {
      console.log('Sending message:', content);
      
      if (isSupabaseConfigured()) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return { success: false, error: 'User not authenticated' };
        }

        const newMessage = {
          chat_id: chatId,
          sender_id: user.id,
          content,
          type,
          timestamp: new Date().toISOString(),
          is_read: false,
        };

        const { data, error } = await supabase
          .from('messages')
          .insert([newMessage])
          .select()
          .single();

        if (error) {
          console.log('Supabase error sending message:', error);
          return { success: false, error: 'Failed to send message' };
        }

        // Update chat's updated_at timestamp
        await supabase
          .from('chats')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', chatId);

        return { success: true, message: data };
      } else {
        // Fallback to mock behavior
        const newMessage: Message = {
          id: 'msg_' + Date.now(),
          chatId,
          senderId: 'current_user',
          content,
          type,
          timestamp: new Date(),
          isRead: false,
          reactions: [],
        };

        // Optimistically add message
        setMessages(prev => [...prev, newMessage]);
        
        // Update chat's last message
        setChats(prev => prev.map(chat => 
          chat.id === chatId 
            ? { ...chat, lastMessage: newMessage, updatedAt: new Date() }
            : chat
        ));

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return { success: true, message: newMessage };
      }
    } catch (err) {
      console.log('Error sending message:', err);
      return { success: false, error: 'Failed to send message' };
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      console.log('Adding reaction:', emoji, 'to message:', messageId);
      
      if (isSupabaseConfigured()) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return { success: false, error: 'User not authenticated' };
        }

        // Remove existing reaction from this user for this message
        await supabase
          .from('message_reactions')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', user.id);

        // Add new reaction
        const { error } = await supabase
          .from('message_reactions')
          .insert([{
            message_id: messageId,
            user_id: user.id,
            emoji,
            timestamp: new Date().toISOString(),
          }]);

        if (error) {
          console.log('Supabase error adding reaction:', error);
          return { success: false, error: 'Failed to add reaction' };
        }

        return { success: true };
      } else {
        // Fallback to mock behavior
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? {
                ...msg,
                reactions: [
                  ...msg.reactions.filter(r => r.userId !== 'current_user'),
                  {
                    userId: 'current_user',
                    emoji,
                    timestamp: new Date(),
                  }
                ]
              }
            : msg
        ));
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 200));
        
        return { success: true };
      }
    } catch (err) {
      console.log('Error adding reaction:', err);
      return { success: false, error: 'Failed to add reaction' };
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('id', messageId);

        if (error) {
          console.log('Supabase error marking message as read:', error);
          return { success: false };
        }
      } else {
        // Fallback to mock behavior
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        ));
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      return { success: true };
    } catch (err) {
      console.log('Error marking message as read:', err);
      return { success: false };
    }
  };

  const setTyping = async (chatId: string, isTyping: boolean) => {
    try {
      if (isSupabaseConfigured()) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false };

        // Send typing status via real-time channel
        const channel = supabase.channel(`chat_${chatId}`);
        channel.send({
          type: 'broadcast',
          event: 'typing',
          payload: { user_id: user.id, is_typing: isTyping }
        });
      } else {
        // Fallback to mock behavior
        setChats(prev => prev.map(chat => 
          chat.id === chatId 
            ? {
                ...chat,
                isTyping: isTyping 
                  ? [...chat.isTyping.filter(id => id !== 'current_user'), 'current_user']
                  : chat.isTyping.filter(id => id !== 'current_user')
              }
            : chat
        ));
        
        // Auto-clear typing after 3 seconds
        if (isTyping) {
          setTimeout(() => {
            setChats(prev => prev.map(chat => 
              chat.id === chatId 
                ? { ...chat, isTyping: chat.isTyping.filter(id => id !== 'current_user') }
                : chat
            ));
          }, 3000);
        }
      }
      
      return { success: true };
    } catch (err) {
      console.log('Error setting typing status:', err);
      return { success: false };
    }
  };

  return {
    messages,
    chats,
    isLoading,
    error,
    sendMessage,
    addReaction,
    markAsRead,
    setTyping,
    loadMessages,
    loadChats,
    isSupabaseConfigured: isSupabaseConfigured(),
  };
};
