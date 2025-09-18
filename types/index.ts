
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  isVerified: boolean;
  createdAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'annotation';
  timestamp: Date;
  isRead: boolean;
  reactions: MessageReaction[];
  replyTo?: string;
  annotations?: Annotation[];
  mediaUrl?: string;
  mediaMetadata?: MediaMetadata;
}

export interface MessageReaction {
  userId: string;
  emoji: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  participants: string[];
  name?: string;
  avatar?: string;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  isTyping: string[];
}

export interface Annotation {
  id: string;
  type: 'highlight' | 'note' | 'audio' | 'gesture' | 'ai_detection';
  content: string;
  position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  layer: number;
  timestamp: Date;
  userId: string;
  aiData?: AIDetectionData;
}

export interface AIDetectionData {
  modelUsed: string;
  confidence: number;
  detectedObjects: DetectedObject[];
  faceData?: FaceData;
  handData?: HandData;
  gestureData?: GestureData;
  productData?: ProductData;
}

export interface DetectedObject {
  id: string;
  label: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  metadata?: any;
}

export interface FaceData {
  landmarks: FaceLandmark[];
  emotions: EmotionData[];
  age?: number;
  gender?: string;
}

export interface FaceLandmark {
  type: string;
  x: number;
  y: number;
}

export interface EmotionData {
  emotion: string;
  confidence: number;
}

export interface HandData {
  landmarks: HandLandmark[];
  gestures: GestureData[];
  isVisible: boolean;
}

export interface HandLandmark {
  type: string;
  x: number;
  y: number;
  z?: number;
}

export interface GestureData {
  type: 'pinch' | 'point' | 'swipe' | 'tap' | 'grab' | 'peace' | 'thumbs_up';
  confidence: number;
  timestamp: Date;
}

export interface ProductData {
  name: string;
  price?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  category: string;
  confidence: number;
}

export interface MediaMetadata {
  duration?: number;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  format: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  showPreview: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  notifications: NotificationSettings;
  privacy: {
    readReceipts: boolean;
    lastSeen: boolean;
    profilePhoto: 'everyone' | 'contacts' | 'nobody';
  };
  ai: {
    faceDetection: boolean;
    handDetection: boolean;
    gestureControl: boolean;
    productRecognition: boolean;
    autoAnnotation: boolean;
  };
}
