
import { User, Chat, Message, AIDetectionData } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'john@example.com',
    username: 'john_doe',
    displayName: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isOnline: true,
    lastSeen: new Date(),
    isVerified: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    email: 'jane@example.com',
    username: 'jane_smith',
    displayName: 'Jane Smith',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    isOnline: false,
    lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
    isVerified: true,
    createdAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    email: 'alex@example.com',
    username: 'alex_wilson',
    displayName: 'Alex Wilson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isOnline: true,
    lastSeen: new Date(),
    isVerified: false,
    createdAt: new Date('2024-01-03'),
  },
];

export const mockChats: Chat[] = [
  {
    id: 'chat1',
    type: 'direct',
    participants: ['current_user', '1'],
    lastMessage: {
      id: 'msg1',
      chatId: 'chat1',
      senderId: '1',
      content: 'Hey! How are you doing?',
      type: 'text',
      timestamp: new Date(Date.now() - 120000), // 2 minutes ago
      isRead: false,
      reactions: [],
    },
    unreadCount: 2,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(Date.now() - 120000),
    isTyping: [],
  },
  {
    id: 'chat2',
    type: 'direct',
    participants: ['current_user', '2'],
    lastMessage: {
      id: 'msg2',
      chatId: 'chat2',
      senderId: 'current_user',
      content: 'Thanks for the help earlier!',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      isRead: true,
      reactions: [
        {
          userId: '2',
          emoji: '👍',
          timestamp: new Date(Date.now() - 3500000),
        },
      ],
    },
    unreadCount: 0,
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date(Date.now() - 3600000),
    isTyping: [],
  },
  {
    id: 'chat3',
    type: 'group',
    participants: ['current_user', '1', '2', '3'],
    name: 'Team Discussion',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop',
    lastMessage: {
      id: 'msg3',
      chatId: 'chat3',
      senderId: '3',
      content: 'Let&apos;s schedule the meeting for tomorrow',
      type: 'text',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      isRead: true,
      reactions: [],
    },
    unreadCount: 1,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date(Date.now() - 7200000),
    isTyping: ['1'],
  },
];

export const mockMessages: Message[] = [
  {
    id: 'msg1',
    chatId: 'chat1',
    senderId: '1',
    content: 'Hey! How are you doing?',
    type: 'text',
    timestamp: new Date(Date.now() - 120000),
    isRead: false,
    reactions: [],
  },
  {
    id: 'msg2',
    chatId: 'chat1',
    senderId: 'current_user',
    content: 'I&apos;m doing great! Just working on some new features.',
    type: 'text',
    timestamp: new Date(Date.now() - 60000),
    isRead: true,
    reactions: [
      {
        userId: '1',
        emoji: '😊',
        timestamp: new Date(Date.now() - 30000),
      },
    ],
  },
  {
    id: 'msg3',
    chatId: 'chat1',
    senderId: '1',
    content: 'That sounds exciting! Can you show me?',
    type: 'text',
    timestamp: new Date(Date.now() - 30000),
    isRead: false,
    reactions: [],
  },
];

export const mockAIDetections: AIDetectionData[] = [
  {
    modelUsed: 'face-detection-v2',
    confidence: 0.95,
    detectedObjects: [
      {
        id: 'face1',
        label: 'face',
        confidence: 0.95,
        boundingBox: { x: 100, y: 150, width: 200, height: 250 },
      },
    ],
    faceData: {
      landmarks: [
        { type: 'left_eye', x: 150, y: 200 },
        { type: 'right_eye', x: 250, y: 200 },
        { type: 'nose', x: 200, y: 250 },
        { type: 'mouth', x: 200, y: 300 },
      ],
      emotions: [
        { emotion: 'happy', confidence: 0.8 },
        { emotion: 'neutral', confidence: 0.2 },
      ],
      age: 28,
      gender: 'male',
    },
  },
];

export const currentUser: User = {
  id: 'current_user',
  email: 'user@example.com',
  username: 'current_user',
  displayName: 'You',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
  isOnline: true,
  lastSeen: new Date(),
  isVerified: true,
  createdAt: new Date('2024-01-01'),
};
