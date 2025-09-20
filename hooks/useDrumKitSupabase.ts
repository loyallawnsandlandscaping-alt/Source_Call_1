
import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { DrumKit, DrumPattern, DrumSession, DrumKitSettings } from '../types/drumKit';
import { analyticsManager } from '../utils/analytics';

export const useDrumKitSupabase = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save drum kit to Supabase
  const saveDrumKit = useCallback(async (drumKit: DrumKit): Promise<string | null> => {
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, skipping drum kit save');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('drum_kits')
        .insert({
          name: drumKit.name,
          description: drumKit.description,
          sounds: drumKit.sounds,
          bpm: drumKit.bpm,
          volume: drumKit.volume,
          effects: drumKit.effects,
        })
        .select()
        .single();

      if (error) throw error;

      analyticsManager.trackEvent('drum_kit_saved', {
        kitId: data.id,
        name: drumKit.name,
        soundCount: drumKit.sounds.length,
      });

      console.log('Drum kit saved to Supabase:', data.id);
      return data.id;
    } catch (err) {
      console.error('Failed to save drum kit:', err);
      setError('Failed to save drum kit');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load drum kits from Supabase
  const loadDrumKits = useCallback(async (): Promise<DrumKit[]> => {
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, returning empty drum kits');
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('drum_kits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const drumKits: DrumKit[] = data.map(kit => ({
        id: kit.id,
        name: kit.name,
        description: kit.description || '',
        sounds: kit.sounds || [],
        bpm: kit.bpm || 120,
        volume: kit.volume || 0.8,
        effects: kit.effects || {
          reverb: 0.2,
          delay: 0.1,
          distortion: 0,
          filter: 0,
          compressor: 0.3,
        },
      }));

      console.log(`Loaded ${drumKits.length} drum kits from Supabase`);
      return drumKits;
    } catch (err) {
      console.error('Failed to load drum kits:', err);
      setError('Failed to load drum kits');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save drum pattern to Supabase
  const saveDrumPattern = useCallback(async (pattern: DrumPattern, kitId: string): Promise<string | null> => {
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, skipping pattern save');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('drum_patterns')
        .insert({
          kit_id: kitId,
          name: pattern.name,
          pattern: pattern.pattern,
          bpm: pattern.bpm,
          time_signature: pattern.timeSignature,
          loop: pattern.loop,
        })
        .select()
        .single();

      if (error) throw error;

      analyticsManager.trackEvent('drum_pattern_saved', {
        patternId: data.id,
        kitId,
        name: pattern.name,
        bpm: pattern.bpm,
      });

      console.log('Drum pattern saved to Supabase:', data.id);
      return data.id;
    } catch (err) {
      console.error('Failed to save drum pattern:', err);
      setError('Failed to save drum pattern');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load drum patterns from Supabase
  const loadDrumPatterns = useCallback(async (kitId?: string): Promise<DrumPattern[]> => {
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, returning empty patterns');
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('drum_patterns')
        .select('*')
        .order('created_at', { ascending: false });

      if (kitId) {
        query = query.eq('kit_id', kitId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const patterns: DrumPattern[] = data.map(pattern => ({
        id: pattern.id,
        name: pattern.name,
        pattern: pattern.pattern || [],
        bpm: pattern.bpm || 120,
        timeSignature: pattern.time_signature || '4/4',
        loop: pattern.loop !== false,
      }));

      console.log(`Loaded ${patterns.length} drum patterns from Supabase`);
      return patterns;
    } catch (err) {
      console.error('Failed to load drum patterns:', err);
      setError('Failed to load drum patterns');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save drum session to Supabase
  const saveDrumSession = useCallback(async (session: DrumSession): Promise<string | null> => {
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, skipping session save');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('drum_sessions')
        .insert({
          kit_id: session.kitId,
          patterns: session.patterns,
          recording_url: session.recording?.audioUrl,
          recording_duration: session.recording?.duration || 0,
          recording_waveform: session.recording?.waveform || [],
          metadata: {
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
          },
        })
        .select()
        .single();

      if (error) throw error;

      analyticsManager.trackEvent('drum_session_saved', {
        sessionId: data.id,
        kitId: session.kitId,
        patternCount: session.patterns.length,
        hasRecording: !!session.recording,
      });

      console.log('Drum session saved to Supabase:', data.id);
      return data.id;
    } catch (err) {
      console.error('Failed to save drum session:', err);
      setError('Failed to save drum session');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load drum sessions from Supabase
  const loadDrumSessions = useCallback(async (kitId?: string): Promise<DrumSession[]> => {
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, returning empty sessions');
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('drum_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (kitId) {
        query = query.eq('kit_id', kitId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const sessions: DrumSession[] = data.map(session => ({
        id: session.id,
        userId: session.user_id,
        kitId: session.kit_id,
        patterns: session.patterns || [],
        recording: session.recording_url ? {
          id: `${session.id}_recording`,
          sessionId: session.id,
          audioUrl: session.recording_url,
          duration: session.recording_duration || 0,
          waveform: session.recording_waveform || [],
          createdAt: new Date(session.created_at),
        } : undefined,
        createdAt: new Date(session.created_at),
        updatedAt: new Date(session.updated_at),
      }));

      console.log(`Loaded ${sessions.length} drum sessions from Supabase`);
      return sessions;
    } catch (err) {
      console.error('Failed to load drum sessions:', err);
      setError('Failed to load drum sessions');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save drum kit settings to Supabase
  const saveDrumKitSettings = useCallback(async (settings: DrumKitSettings): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, skipping settings save');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase
        .from('drum_kit_settings')
        .upsert({
          master_volume: settings.masterVolume,
          metronome: settings.metronome,
          metronome_volume: settings.metronomeVolume,
          recording_enabled: settings.recordingEnabled,
          touch_sensitivity: settings.touchSensitivity,
          visual_feedback: settings.visualFeedback,
          haptic_feedback: settings.hapticFeedback,
          gesture_control: settings.gestureControl,
        });

      if (error) throw error;

      analyticsManager.trackEvent('drum_kit_settings_saved', {
        masterVolume: settings.masterVolume,
        recordingEnabled: settings.recordingEnabled,
        hapticFeedback: settings.hapticFeedback,
      });

      console.log('Drum kit settings saved to Supabase');
      return true;
    } catch (err) {
      console.error('Failed to save drum kit settings:', err);
      setError('Failed to save drum kit settings');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load drum kit settings from Supabase
  const loadDrumKitSettings = useCallback(async (): Promise<DrumKitSettings | null> => {
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, returning null settings');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('drum_kit_settings')
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, return null
          return null;
        }
        throw error;
      }

      const settings: DrumKitSettings = {
        masterVolume: data.master_volume || 0.8,
        metronome: data.metronome || false,
        metronomeVolume: data.metronome_volume || 0.5,
        recordingEnabled: data.recording_enabled !== false,
        touchSensitivity: data.touch_sensitivity || 0.8,
        visualFeedback: data.visual_feedback !== false,
        hapticFeedback: data.haptic_feedback !== false,
        gestureControl: data.gesture_control || false,
      };

      console.log('Loaded drum kit settings from Supabase');
      return settings;
    } catch (err) {
      console.error('Failed to load drum kit settings:', err);
      setError('Failed to load drum kit settings');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    saveDrumKit,
    loadDrumKits,
    saveDrumPattern,
    loadDrumPatterns,
    saveDrumSession,
    loadDrumSessions,
    saveDrumKitSettings,
    loadDrumKitSettings,
  };
};
