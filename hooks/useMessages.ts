
import { useState, useEffect } from 'react';
import { Message, Chat } from '../types';
import { mockMessages, mockChats } from '../data/mockData';

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
  }, [chatId]);

  const loadChats = async () => {
    try {
      console.log('Loading chats...');
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setChats(mockChats);
      setError(null);
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      const chatMessages = mockMessages.filter(msg => msg.chatId === chatId);
      setMessages(chatMessages);
      setError(null);
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
    } catch (err) {
      console.log('Error sending message:', err);
      return { success: false, error: 'Failed to send message' };
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      console.log('Adding reaction:', emoji, 'to message:', messageId);
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
    } catch (err) {
      console.log('Error adding reaction:', err);
      return { success: false, error: 'Failed to add reaction' };
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      ));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { success: true };
    } catch (err) {
      console.log('Error marking message as read:', err);
      return { success: false };
    }
  };

  const setTyping = async (chatId: string, isTyping: boolean) => {
    try {
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
  };
};
