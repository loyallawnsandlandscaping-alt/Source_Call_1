
import { useState, useEffect, useCallback } from 'react';
import { DrumKit, DrumPattern, DrumSession, DrumKitSettings } from '../types/drumKit';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { analyticsManager } from '../utils/analytics';

export const useDrumKitSupabase = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save drum kit to Supabase
  const saveDrumKit = useCallback(async (drumKit: DrumKit): Promise<string | null> => {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured, skipping drum kit save');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const kitData = {
        user_id: user.id,
        name: drumKit.name,
        description: drumKit.description,
        bpm: drumKit.bpm,
        volume: drumKit.volume,
        effects: drumKit.effects,
        sounds: drumKit.sounds,
      };

      const { data, error: saveError } = await supabase
        .from('drum_kits')
        .upsert(kitData, { onConflict: 'id' })
        .select('id')
        .single();

      if (saveError) {
        throw saveError;
      }

      analyticsManager.trackEvent('drum_kit_saved', {
        kitId: data.id,
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
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured, returning empty drum kits');
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error: loadError } = await supabase
        .from('drum_kits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (loadError) {
        throw loadError;
      }

      const drumKits: DrumKit[] = (data || []).map(kit => ({
        id: kit.id,
        name: kit.name,
        description: kit.description || '',
        bpm: kit.bpm || 120,
        volume: kit.volume || 0.8,
        effects: kit.effects || {
          reverb: 0.2,
          delay: 0.1,
          distortion: 0,
          filter: 0,
          compressor: 0.3,
        },
        sounds: kit.sounds || [],
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
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured, skipping pattern save');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const patternData = {
        user_id: user.id,
        kit_id: kitId,
        name: pattern.name,
        bpm: pattern.bpm,
        time_signature: pattern.timeSignature,
        loop: pattern.loop,
        pattern: pattern.pattern,
      };

      const { data, error: saveError } = await supabase
        .from('drum_patterns')
        .upsert(patternData, { onConflict: 'id' })
        .select('id')
        .single();

      if (saveError) {
        throw saveError;
      }

      analyticsManager.trackEvent('drum_pattern_saved', {
        patternId: data.id,
        kitId,
        beatCount: pattern.pattern.length,
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
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured, returning empty patterns');
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('drum_patterns')
        .select('*')
        .eq('user_id', user.id);

      if (kitId) {
        query = query.eq('kit_id', kitId);
      }

      const { data, error: loadError } = await query.order('created_at', { ascending: false });

      if (loadError) {
        throw loadError;
      }

      const patterns: DrumPattern[] = (data || []).map(pattern => ({
        id: pattern.id,
        name: pattern.name,
        bpm: pattern.bpm || 120,
        timeSignature: pattern.time_signature || '4/4',
        loop: pattern.loop !== false,
        pattern: pattern.pattern || [],
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
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured, skipping session save');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const sessionData = {
        user_id: user.id,
        kit_id: session.kitId,
        patterns: session.patterns,
        recording_url: session.recording?.audioUrl || null,
        recording_duration: session.recording?.duration || 0,
        recording_waveform: session.recording?.waveform || [],
      };

      const { data, error: saveError } = await supabase
        .from('drum_sessions')
        .upsert(sessionData, { onConflict: 'id' })
        .select('id')
        .single();

      if (saveError) {
        throw saveError;
      }

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
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured, returning empty sessions');
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('drum_sessions')
        .select('*')
        .eq('user_id', user.id);

      if (kitId) {
        query = query.eq('kit_id', kitId);
      }

      const { data, error: loadError } = await query.order('created_at', { ascending: false });

      if (loadError) {
        throw loadError;
      }

      const sessions: DrumSession[] = (data || []).map(session => ({
        id: session.id,
        userId: session.user_id,
        kitId: session.kit_id,
        patterns: session.patterns || [],
        recording: session.recording_url ? {
          id: session.id + '_recording',
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
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured, skipping settings save');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const settingsData = {
        user_id: user.id,
        master_volume: settings.masterVolume,
        metronome: settings.metronome,
        metronome_volume: settings.metronomeVolume,
        recording_enabled: settings.recordingEnabled,
        touch_sensitivity: settings.touchSensitivity,
        visual_feedback: settings.visualFeedback,
        haptic_feedback: settings.hapticFeedback,
        gesture_control: settings.gestureControl,
      };

      const { error: saveError } = await supabase
        .from('drum_kit_settings')
        .upsert(settingsData, { onConflict: 'user_id' });

      if (saveError) {
        throw saveError;
      }

      analyticsManager.trackEvent('drum_kit_settings_saved', {
        masterVolume: settings.masterVolume,
        hapticFeedback: settings.hapticFeedback,
        gestureControl: settings.gestureControl,
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
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured, returning null settings');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error: loadError } = await supabase
        .from('drum_kit_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (loadError) {
        if (loadError.code === 'PGRST116') {
          // No settings found, return null
          console.log('No drum kit settings found in Supabase');
          return null;
        }
        throw loadError;
      }

      const settings: DrumKitSettings = {
        masterVolume: data.master_volume || 0.8,
        metronome: data.metronome !== false,
        metronomeVolume: data.metronome_volume || 0.5,
        recordingEnabled: data.recording_enabled !== false,
        touchSensitivity: data.touch_sensitivity || 0.8,
        visualFeedback: data.visual_feedback !== false,
        hapticFeedback: data.haptic_feedback !== false,
        gestureControl: data.gesture_control === true,
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
