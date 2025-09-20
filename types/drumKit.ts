
export interface DrumSound {
  id: string;
  name: string;
  displayName: string;
  soundUrl: string;
  color: string;
  category: 'kick' | 'snare' | 'hihat' | 'cymbal' | 'tom' | 'percussion' | 'electronic' | 'fx';
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

export interface DrumSoundCategory {
  id: string;
  name: string;
  color: string;
  sounds: DrumSound[];
}
