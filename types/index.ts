
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
  preferences?: UserPreferences;
}

export interface UserPreferences {
  language: string;
  privacySettings: PrivacySettings;
  accessibilitySettings: AccessibilitySettings;
}

export interface PrivacySettings {
  dataCollection: boolean;
  analytics: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  timestamp: Date;
  isRead: boolean;
  reactions: MessageReaction[];
  replyTo?: string;
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

export interface MediaMetadata {
  duration?: number;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  format: string;
  quality?: string;
  bitrate?: number;
  frameRate?: number;
  colorSpace?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  biometricEnabled: boolean;
  federatedIdentities: FederatedIdentity[];
}

export interface FederatedIdentity {
  provider: string;
  id: string;
  email: string;
  verified: boolean;
  connectedAt: Date;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  showPreview: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationSettings;
  privacy: {
    readReceipts: boolean;
    lastSeen: boolean;
    profilePhoto: 'everyone' | 'contacts' | 'nobody';
    dataCollection: boolean;
    analytics: boolean;
  };
  accessibility: AccessibilitySettings;
}

export interface Call {
  id: string;
  type: 'audio' | 'video';
  status: 'incoming' | 'outgoing' | 'active' | 'ended' | 'missed' | 'declined';
  participants: string[];
  initiator: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  isGroup: boolean;
  roomId?: string;
}

export interface CallParticipant {
  id: string;
  userId: string;
  isMuted: boolean;
  isVideoOn: boolean;
  joinedAt: Date;
  leftAt?: Date;
}

// Drum Kit Types
export interface DrumSound {
  id: string;
  name: string;
  displayName: string;
  soundUrl: string;
  color: string;
  category: 'kick' | 'snare' | 'hihat' | 'cymbal' | 'tom' | 'percussion';
  volume: number;
  pitch?: number;
  reverb?: number;
  delay?: number;
}

export interface DrumKit {
  id: string;
  name: string;
  description: string;
  sounds: DrumSound[];
  bpm: number;
  volume: number;
  effects: DrumEffects;
}

export interface DrumEffects {
  reverb: number;
  delay: number;
  distortion: number;
  filter: number;
  compressor: number;
}

export interface DrumPattern {
  id: string;
  name: string;
  pattern: DrumBeat[];
  bpm: number;
  timeSignature: string;
  loop: boolean;
}

export interface DrumBeat {
  soundId: string;
  time: number;
  velocity: number;
  duration?: number;
}

export interface DrumSession {
  id: string;
  userId: string;
  kitId: string;
  patterns: DrumPattern[];
  recording?: DrumRecording;
  createdAt: Date;
  updatedAt: Date;
}

export interface DrumRecording {
  id: string;
  sessionId: string;
  audioUrl: string;
  duration: number;
  waveform: number[];
  createdAt: Date;
}

export interface DrumKitSettings {
  masterVolume: number;
  metronome: boolean;
  metronomeVolume: number;
  recordingEnabled: boolean;
  touchSensitivity: number;
  visualFeedback: boolean;
  hapticFeedback: boolean;
  gestureControl: boolean;
}
