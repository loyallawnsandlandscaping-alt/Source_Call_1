
import { useState, useEffect, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrumKit, DrumSound, DrumPattern, DrumKitSettings, DrumSession } from '../types/drumKit';
import { analyticsManager } from '../utils/analytics';
import { useDrumKitSupabase } from './useDrumKitSupabase';

// Complete 35-sound drum kit configuration
const DEFAULT_DRUM_KIT: DrumKit = {
  id: 'complete_kit_35',
  name: 'Complete Drum Kit (35 Sounds)',
  description: 'Professional drum kit with 35 essential sounds for complete music production',
  bpm: 120,
  volume: 0.8,
  effects: {
    reverb: 0.2,
    delay: 0.1,
    distortion: 0,
    filter: 0,
    compressor: 0.3,
  },
  sounds: [
    // KICK DRUMS (5 sounds)
    {
      id: 'kick_1',
      name: 'kick_1',
      displayName: 'Kick 1',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#FF6B6B',
      category: 'kick',
      volume: 1.0,
    },
    {
      id: 'kick_2',
      name: 'kick_2',
      displayName: 'Kick 2',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#FF5252',
      category: 'kick',
      volume: 0.95,
    },
    {
      id: 'kick_3',
      name: 'kick_3',
      displayName: 'Kick 3',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#E53935',
      category: 'kick',
      volume: 0.9,
    },
    {
      id: 'kick_4',
      name: 'kick_4',
      displayName: 'Kick 4',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#D32F2F',
      category: 'kick',
      volume: 0.85,
    },
    {
      id: 'kick_5',
      name: 'kick_5',
      displayName: 'Kick 5',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#C62828',
      category: 'kick',
      volume: 0.8,
    },

    // SNARE DRUMS (6 sounds)
    {
      id: 'snare_1',
      name: 'snare_1',
      displayName: 'Snare 1',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#4ECDC4',
      category: 'snare',
      volume: 0.9,
    },
    {
      id: 'snare_2',
      name: 'snare_2',
      displayName: 'Snare 2',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#26C6DA',
      category: 'snare',
      volume: 0.85,
    },
    {
      id: 'snare_3',
      name: 'snare_3',
      displayName: 'Snare 3',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#00BCD4',
      category: 'snare',
      volume: 0.8,
    },
    {
      id: 'snare_4',
      name: 'snare_4',
      displayName: 'Snare 4',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#00ACC1',
      category: 'snare',
      volume: 0.75,
    },
    {
      id: 'snare_5',
      name: 'snare_5',
      displayName: 'Snare 5',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#0097A7',
      category: 'snare',
      volume: 0.7,
    },
    {
      id: 'snare_6',
      name: 'snare_6',
      displayName: 'Snare 6',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#00838F',
      category: 'snare',
      volume: 0.65,
    },

    // HI-HATS (6 sounds)
    {
      id: 'hihat_closed_1',
      name: 'hihat_closed_1',
      displayName: 'Closed HH 1',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#45B7D1',
      category: 'hihat',
      volume: 0.7,
    },
    {
      id: 'hihat_closed_2',
      name: 'hihat_closed_2',
      displayName: 'Closed HH 2',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#42A5F5',
      category: 'hihat',
      volume: 0.65,
    },
    {
      id: 'hihat_open_1',
      name: 'hihat_open_1',
      displayName: 'Open HH 1',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#96CEB4',
      category: 'hihat',
      volume: 0.8,
    },
    {
      id: 'hihat_open_2',
      name: 'hihat_open_2',
      displayName: 'Open HH 2',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#81C784',
      category: 'hihat',
      volume: 0.75,
    },
    {
      id: 'hihat_pedal',
      name: 'hihat_pedal',
      displayName: 'HH Pedal',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#66BB6A',
      category: 'hihat',
      volume: 0.6,
    },
    {
      id: 'hihat_splash',
      name: 'hihat_splash',
      displayName: 'HH Splash',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#4CAF50',
      category: 'hihat',
      volume: 0.85,
    },

    // CYMBALS (5 sounds)
    {
      id: 'crash_1',
      name: 'crash_1',
      displayName: 'Crash 1',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#FFEAA7',
      category: 'cymbal',
      volume: 0.9,
    },
    {
      id: 'crash_2',
      name: 'crash_2',
      displayName: 'Crash 2',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#FFCC02',
      category: 'cymbal',
      volume: 0.85,
    },
    {
      id: 'ride_1',
      name: 'ride_1',
      displayName: 'Ride 1',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#DDA0DD',
      category: 'cymbal',
      volume: 0.8,
    },
    {
      id: 'ride_2',
      name: 'ride_2',
      displayName: 'Ride 2',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#BA68C8',
      category: 'cymbal',
      volume: 0.75,
    },
    {
      id: 'china',
      name: 'china',
      displayName: 'China',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#AB47BC',
      category: 'cymbal',
      volume: 0.85,
    },

    // TOMS (6 sounds)
    {
      id: 'tom_high_1',
      name: 'tom_high_1',
      displayName: 'High Tom 1',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#FFB347',
      category: 'tom',
      volume: 0.85,
    },
    {
      id: 'tom_high_2',
      name: 'tom_high_2',
      displayName: 'High Tom 2',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#FF9800',
      category: 'tom',
      volume: 0.8,
    },
    {
      id: 'tom_mid_1',
      name: 'tom_mid_1',
      displayName: 'Mid Tom 1',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#FF7F7F',
      category: 'tom',
      volume: 0.85,
    },
    {
      id: 'tom_mid_2',
      name: 'tom_mid_2',
      displayName: 'Mid Tom 2',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#FF8A65',
      category: 'tom',
      volume: 0.8,
    },
    {
      id: 'tom_low_1',
      name: 'tom_low_1',
      displayName: 'Low Tom 1',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#87CEEB',
      category: 'tom',
      volume: 0.9,
    },
    {
      id: 'tom_low_2',
      name: 'tom_low_2',
      displayName: 'Low Tom 2',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#64B5F6',
      category: 'tom',
      volume: 0.85,
    },

    // PERCUSSION (4 sounds)
    {
      id: 'cowbell',
      name: 'cowbell',
      displayName: 'Cowbell',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#A5D6A7',
      category: 'percussion',
      volume: 0.7,
    },
    {
      id: 'woodblock',
      name: 'woodblock',
      displayName: 'Woodblock',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#BCAAA4',
      category: 'percussion',
      volume: 0.75,
    },
    {
      id: 'tambourine',
      name: 'tambourine',
      displayName: 'Tambourine',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#F8BBD9',
      category: 'percussion',
      volume: 0.65,
    },
    {
      id: 'shaker',
      name: 'shaker',
      displayName: 'Shaker',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#E1BEE7',
      category: 'percussion',
      volume: 0.6,
    },

    // ELECTRONIC (3 sounds)
    {
      id: 'electronic_kick',
      name: 'electronic_kick',
      displayName: 'E-Kick',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#FF4081',
      category: 'electronic',
      volume: 0.9,
    },
    {
      id: 'electronic_snare',
      name: 'electronic_snare',
      displayName: 'E-Snare',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#7C4DFF',
      category: 'electronic',
      volume: 0.85,
    },
    {
      id: 'electronic_hihat',
      name: 'electronic_hihat',
      displayName: 'E-HiHat',
      soundUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      color: '#18FFFF',
      category: 'electronic',
      volume: 0.7,
    },
  ],
};

const DEFAULT_SETTINGS: DrumKitSettings = {
  masterVolume: 0.8,
  metronome: false,
  metronomeVolume: 0.5,
  recordingEnabled: true,
  touchSensitivity: 0.8,
  visualFeedback: true,
  hapticFeedback: true,
  gestureControl: false,
};

export const useDrumKit = () => {
  const [currentKit, setCurrentKit] = useState<DrumKit>(DEFAULT_DRUM_KIT);
  const [settings, setSettings] = useState<DrumKitSettings>(DEFAULT_SETTINGS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentPattern, setCurrentPattern] = useState<DrumPattern | null>(null);
  const [loadedSounds, setLoadedSounds] = useState<Map<string, Audio.Sound>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<DrumSession[]>([]);
  const [availableKits, setAvailableKits] = useState<DrumKit[]>([]);
  const [availablePatterns, setAvailablePatterns] = useState<DrumPattern[]>([]);

  const metronomeRef = useRef<Audio.Sound | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const patternIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isLoading: supabaseLoading,
    error: supabaseError,
    saveDrumKit,
    loadDrumKits,
    saveDrumPattern,
    loadDrumPatterns,
    saveDrumSession,
    loadDrumSessions,
    saveDrumKitSettings,
    loadDrumKitSettings,
  } = useDrumKitSupabase();

  // Initialize audio and load sounds
  useEffect(() => {
    initializeAudio();
    loadSettings();
    loadSessions();
    loadAvailableData();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeAudio = async () => {
    try {
      console.log('Initializing drum kit audio with 35 sounds...');
      setIsLoading(true);
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });

      await loadDrumSounds();
      setIsLoading(false);
      console.log('Drum kit initialized successfully with 35 sounds');
    } catch (err) {
      console.error('Failed to initialize drum kit:', err);
      setError('Failed to initialize drum kit');
      setIsLoading(false);
    }
  };

  const loadDrumSounds = async () => {
    const soundMap = new Map<string, Audio.Sound>();
    
    console.log(`Loading ${currentKit.sounds.length} drum sounds...`);
    
    for (const drumSound of currentKit.sounds) {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: drumSound.soundUrl },
          { 
            shouldPlay: false,
            volume: drumSound.volume * settings.masterVolume,
          }
        );
        soundMap.set(drumSound.id, sound);
        console.log(`Loaded sound: ${drumSound.displayName} (${drumSound.category})`);
      } catch (err) {
        console.error(`Failed to load sound ${drumSound.displayName}:`, err);
        // Create a silent sound as fallback
        try {
          const { sound } = await Audio.Sound.createAsync(
            require('../assets/sounds/silence.mp3'),
            { shouldPlay: false, volume: 0 }
          );
          soundMap.set(drumSound.id, sound);
        } catch (fallbackErr) {
          console.error(`Failed to create fallback sound for ${drumSound.displayName}:`, fallbackErr);
        }
      }
    }
    
    setLoadedSounds(soundMap);
    console.log(`Successfully loaded ${soundMap.size} out of ${currentKit.sounds.length} sounds`);
  };

  const loadAvailableData = async () => {
    try {
      // Load available kits and patterns from Supabase
      const [kits, patterns, sessions] = await Promise.all([
        loadDrumKits(),
        loadDrumPatterns(),
        loadDrumSessions(),
      ]);
      
      setAvailableKits(kits);
      setAvailablePatterns(patterns);
      setSessions(sessions);
    } catch (err) {
      console.error('Failed to load available data:', err);
    }
  };

  const playSound = useCallback(async (soundId: string, velocity: number = 1.0) => {
    try {
      const sound = loadedSounds.get(soundId);
      if (!sound) {
        console.warn(`Sound ${soundId} not found`);
        return;
      }

      const drumSound = currentKit.sounds.find(s => s.id === soundId);
      if (!drumSound) {
        console.warn(`Drum sound config ${soundId} not found`);
        return;
      }

      // Stop any currently playing instance
      await sound.stopAsync();
      await sound.setPositionAsync(0);
      
      // Set volume based on velocity and settings
      const volume = drumSound.volume * velocity * settings.masterVolume;
      await sound.setVolumeAsync(Math.min(volume, 1.0));
      
      // Play the sound
      await sound.playAsync();

      // Haptic feedback
      if (settings.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Analytics
      analyticsManager.trackEvent('drum_sound_played', {
        soundId,
        velocity,
        kitId: currentKit.id,
        category: drumSound.category,
      });

      console.log(`Played sound: ${drumSound.displayName} (${drumSound.category}) with velocity: ${velocity}`);
    } catch (err) {
      console.error(`Failed to play sound ${soundId}:`, err);
    }
  }, [loadedSounds, currentKit, settings]);

  const playPattern = useCallback(async (pattern: DrumPattern) => {
    if (isPlaying) {
      stopPattern();
      return;
    }

    setIsPlaying(true);
    setCurrentPattern(pattern);
    
    const beatDuration = (60 / pattern.bpm) * 1000; // ms per beat
    let currentBeat = 0;
    
    const playBeat = () => {
      const beatsAtCurrentTime = pattern.pattern.filter(beat => 
        Math.floor(beat.time) === currentBeat
      );
      
      beatsAtCurrentTime.forEach(beat => {
        playSound(beat.soundId, beat.velocity);
      });
      
      currentBeat++;
      
      // Find the maximum beat time to know when to loop
      const maxBeat = Math.max(...pattern.pattern.map(beat => Math.ceil(beat.time)));
      
      if (currentBeat > maxBeat) {
        if (pattern.loop) {
          currentBeat = 0;
        } else {
          stopPattern();
          return;
        }
      }
    };

    // Start playing immediately
    playBeat();
    
    // Set up interval for subsequent beats
    patternIntervalRef.current = setInterval(playBeat, beatDuration);

    analyticsManager.trackEvent('drum_pattern_played', {
      patternId: pattern.id,
      bpm: pattern.bpm,
      kitId: currentKit.id,
    });
  }, [isPlaying, playSound, currentKit]);

  const stopPattern = useCallback(() => {
    if (patternIntervalRef.current) {
      clearInterval(patternIntervalRef.current);
      patternIntervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentPattern(null);
    console.log('Stopped drum pattern');
  }, []);

  const startRecording = useCallback(async () => {
    if (!settings.recordingEnabled) {
      console.warn('Recording is disabled');
      return;
    }

    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        setError('Microphone permission required for recording');
        return;
      }

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      
      recordingRef.current = recording;
      setIsRecording(true);
      
      analyticsManager.trackEvent('drum_recording_started', {
        kitId: currentKit.id,
      });
      
      console.log('Started drum recording');
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording');
    }
  }, [settings.recordingEnabled, currentKit]);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return;

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      
      if (uri) {
        // Save recording to sessions
        const newSession: DrumSession = {
          id: Date.now().toString(),
          userId: 'current_user', // Replace with actual user ID
          kitId: currentKit.id,
          patterns: currentPattern ? [currentPattern] : [],
          recording: {
            id: Date.now().toString(),
            sessionId: Date.now().toString(),
            audioUrl: uri,
            duration: 0, // You'd calculate this from the recording
            waveform: [], // You'd generate this from the audio
            createdAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        setSessions(prev => [newSession, ...prev]);
        await saveSession(newSession);
        
        // Save to Supabase
        await saveDrumSession(newSession);
      }
      
      recordingRef.current = null;
      setIsRecording(false);
      
      analyticsManager.trackEvent('drum_recording_stopped', {
        kitId: currentKit.id,
        duration: 0, // Calculate actual duration
      });
      
      console.log('Stopped drum recording');
    } catch (err) {
      console.error('Failed to stop recording:', err);
      setError('Failed to stop recording');
    }
  }, [currentKit, currentPattern, saveDrumSession]);

  const updateSettings = useCallback(async (newSettings: Partial<DrumKitSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Update volume for all loaded sounds
    if (newSettings.masterVolume !== undefined) {
      for (const [soundId, sound] of loadedSounds.entries()) {
        const drumSound = currentKit.sounds.find(s => s.id === soundId);
        if (drumSound) {
          const volume = drumSound.volume * updatedSettings.masterVolume;
          await sound.setVolumeAsync(Math.min(volume, 1.0));
        }
      }
    }
    
    await saveSettings(updatedSettings);
    
    // Save to Supabase
    await saveDrumKitSettings(updatedSettings);
    
    console.log('Updated drum kit settings:', newSettings);
  }, [settings, loadedSounds, currentKit, saveDrumKitSettings]);

  const switchKit = useCallback(async (kit: DrumKit) => {
    setCurrentKit(kit);
    
    // Reload sounds for the new kit
    await loadDrumSounds();
    
    analyticsManager.trackEvent('drum_kit_switched', {
      fromKitId: currentKit.id,
      toKitId: kit.id,
    });
    
    console.log(`Switched to drum kit: ${kit.name}`);
  }, [currentKit]);

  const saveCurrentKit = useCallback(async () => {
    const kitId = await saveDrumKit(currentKit);
    if (kitId) {
      // Reload available kits
      const kits = await loadDrumKits();
      setAvailableKits(kits);
    }
  }, [currentKit, saveDrumKit, loadDrumKits]);

  const loadSettings = async () => {
    try {
      // Try to load from Supabase first
      const supabaseSettings = await loadDrumKitSettings();
      if (supabaseSettings) {
        setSettings(supabaseSettings);
        return;
      }
      
      // Fallback to local storage
      const saved = await AsyncStorage.getItem('drumKitSettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load drum kit settings:', err);
    }
  };

  const saveSettings = async (settingsToSave: DrumKitSettings) => {
    try {
      await AsyncStorage.setItem('drumKitSettings', JSON.stringify(settingsToSave));
    } catch (err) {
      console.error('Failed to save drum kit settings:', err);
    }
  };

  const loadSessions = async () => {
    try {
      // Try to load from Supabase first
      const supabaseSessions = await loadDrumSessions();
      if (supabaseSessions.length > 0) {
        setSessions(supabaseSessions);
        return;
      }
      
      // Fallback to local storage
      const saved = await AsyncStorage.getItem('drumSessions');
      if (saved) {
        setSessions(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load drum sessions:', err);
    }
  };

  const saveSession = async (session: DrumSession) => {
    try {
      const currentSessions = await AsyncStorage.getItem('drumSessions');
      const sessions = currentSessions ? JSON.parse(currentSessions) : [];
      sessions.unshift(session);
      
      // Keep only the last 50 sessions
      const trimmedSessions = sessions.slice(0, 50);
      await AsyncStorage.setItem('drumSessions', JSON.stringify(trimmedSessions));
    } catch (err) {
      console.error('Failed to save drum session:', err);
    }
  };

  const cleanup = async () => {
    console.log('Cleaning up drum kit...');
    
    // Stop any playing patterns
    if (patternIntervalRef.current) {
      clearInterval(patternIntervalRef.current);
    }
    
    // Stop recording if active
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (err) {
        console.error('Error stopping recording during cleanup:', err);
      }
    }
    
    // Unload all sounds
    for (const sound of loadedSounds.values()) {
      try {
        await sound.unloadAsync();
      } catch (err) {
        console.error('Error unloading sound during cleanup:', err);
      }
    }
    
    // Clean up metronome
    if (metronomeRef.current) {
      try {
        await metronomeRef.current.unloadAsync();
      } catch (err) {
        console.error('Error unloading metronome during cleanup:', err);
      }
    }
  };

  return {
    // State
    currentKit,
    settings,
    isPlaying,
    isRecording,
    currentPattern,
    isLoading: isLoading || supabaseLoading,
    error: error || supabaseError,
    sessions,
    availableKits,
    availablePatterns,
    
    // Actions
    playSound,
    playPattern,
    stopPattern,
    startRecording,
    stopRecording,
    updateSettings,
    setCurrentKit,
    switchKit,
    saveCurrentKit,
    
    // Computed
    loadedSounds: loadedSounds.size,
    totalSounds: currentKit.sounds.length,
  };
};
