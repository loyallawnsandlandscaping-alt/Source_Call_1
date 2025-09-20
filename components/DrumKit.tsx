
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useDrumKit } from '../hooks/useDrumKit';
import { DrumSound } from '../types/drumKit';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from './Icon';

const { width, height } = Dimensions.get('window');

interface DrumKitProps {
  onClose?: () => void;
  gestureControlEnabled?: boolean;
}

const DrumKit: React.FC<DrumKitProps> = ({ onClose, gestureControlEnabled = false }) => {
  const {
    currentKit,
    settings,
    isPlaying,
    isRecording,
    playSound,
    playPattern,
    stopPattern,
    startRecording,
    stopRecording,
    updateSettings,
    isLoading,
    error,
    loadedSounds,
    totalSounds,
    loadingProgress,
  } = useDrumKit();

  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (error) {
      Alert.alert('Drum Kit Error', error, [
        { text: 'OK', onPress: () => console.log('Error acknowledged') }
      ]);
    }
  }, [error]);

  const handleSoundPress = async (sound: DrumSound) => {
    setActiveSound(sound.id);
    await playSound(sound.id, 1.0);
    
    // Visual feedback
    setTimeout(() => setActiveSound(null), 150);
    
    // Haptic feedback
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const renderDrumPad = (sound: DrumSound, index: number) => {
    const isActive = activeSound === sound.id;
    const padSize = width > 400 ? 70 : 55;
    
    return (
      <TouchableOpacity
        key={sound.id}
        style={[
          styles.drumPad,
          {
            width: padSize,
            height: padSize,
            backgroundColor: isActive ? colors.primary : sound.color,
          },
        ]}
        onPress={() => handleSoundPress(sound)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={isActive ? [colors.primary, colors.secondary] : [sound.color, sound.color + '80']}
          style={[styles.drumPadGradient, { width: padSize, height: padSize }]}
        >
          <Text style={styles.drumPadText} numberOfLines={2}>
            {sound.displayName}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderControls = () => (
    <View style={styles.controlsContainer}>
      <TouchableOpacity
        style={[styles.controlButton, isPlaying && styles.controlButtonActive]}
        onPress={() => isPlaying ? stopPattern() : playDemoPattern()}
      >
        <Icon 
          name={isPlaying ? 'stop' : 'play'} 
          size={24} 
          color={isPlaying ? colors.background : colors.text} 
        />
        <Text style={[styles.controlButtonText, isPlaying && styles.controlButtonTextActive]}>
          {isPlaying ? 'Stop' : 'Demo'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.controlButton, isRecording && styles.recordingButton]}
        onPress={() => isRecording ? stopRecording() : startRecording()}
        disabled={!settings.recordingEnabled}
      >
        <Icon 
          name={isRecording ? 'stop-circle' : 'radio-button-on'} 
          size={24} 
          color={isRecording ? colors.background : (settings.recordingEnabled ? colors.error : colors.textSecondary)} 
        />
        <Text style={[styles.controlButtonText, isRecording && styles.controlButtonTextActive]}>
          {isRecording ? 'Stop Rec' : 'Record'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.controlButton}
        onPress={() => setShowSettings(!showSettings)}
      >
        <Icon name="settings" size={24} color={colors.text} />
        <Text style={styles.controlButtonText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );

  const playDemoPattern = () => {
    const demoPattern = {
      id: 'demo_loyallawns_35_sounds',
      name: 'Demo Pattern (Loyal Lawns 35 Sounds)',
      bpm: 120,
      timeSignature: '4/4',
      loop: true,
      pattern: [
        // Basic rock pattern using various sounds from the 35-sound kit
        { soundId: 'kick_1', time: 0, velocity: 1.0 },
        { soundId: 'hihat_closed_1', time: 0.5, velocity: 0.7 },
        { soundId: 'snare_1', time: 1, velocity: 0.9 },
        { soundId: 'hihat_closed_2', time: 1.5, velocity: 0.7 },
        { soundId: 'kick_2', time: 2, velocity: 1.0 },
        { soundId: 'hihat_open_1', time: 2.5, velocity: 0.8 },
        { soundId: 'snare_2', time: 3, velocity: 0.9 },
        { soundId: 'hihat_closed_1', time: 3.5, velocity: 0.7 },
        // Add some toms and cymbals
        { soundId: 'tom_high_1', time: 3.75, velocity: 0.8 },
        { soundId: 'crash_1', time: 4, velocity: 0.9 },
        // Electronic elements
        { soundId: 'electronic_kick', time: 4.5, velocity: 0.8 },
        { soundId: 'electronic_snare', time: 5, velocity: 0.7 },
        // Percussion
        { soundId: 'cowbell', time: 5.5, velocity: 0.6 },
        { soundId: 'shaker', time: 6, velocity: 0.5 },
      ],
    };
    
    playPattern(demoPattern);
  };

  const renderSettings = () => {
    if (!showSettings) return null;

    return (
      <View style={styles.settingsContainer}>
        <Text style={styles.settingsTitle}>Drum Kit Settings</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Master Volume</Text>
          <View style={styles.volumeControls}>
            <TouchableOpacity
              style={styles.volumeButton}
              onPress={() => updateSettings({ masterVolume: Math.max(0, settings.masterVolume - 0.1) })}
            >
              <Icon name="remove" size={16} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.settingValue}>{Math.round(settings.masterVolume * 100)}%</Text>
            <TouchableOpacity
              style={styles.volumeButton}
              onPress={() => updateSettings({ masterVolume: Math.min(1, settings.masterVolume + 0.1) })}
            >
              <Icon name="add" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Haptic Feedback</Text>
          <TouchableOpacity
            style={[styles.toggle, settings.hapticFeedback && styles.toggleActive]}
            onPress={() => updateSettings({ hapticFeedback: !settings.hapticFeedback })}
          >
            <Text style={[styles.toggleText, settings.hapticFeedback && styles.toggleTextActive]}>
              {settings.hapticFeedback ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Recording</Text>
          <TouchableOpacity
            style={[styles.toggle, settings.recordingEnabled && styles.toggleActive]}
            onPress={() => updateSettings({ recordingEnabled: !settings.recordingEnabled })}
          >
            <Text style={[styles.toggleText, settings.recordingEnabled && styles.toggleTextActive]}>
              {settings.recordingEnabled ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Gesture Control</Text>
          <TouchableOpacity
            style={[styles.toggle, settings.gestureControl && styles.toggleActive]}
            onPress={() => updateSettings({ gestureControl: !settings.gestureControl })}
          >
            <Text style={[styles.toggleText, settings.gestureControl && styles.toggleTextActive]}>
              {settings.gestureControl ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Visual Feedback</Text>
          <TouchableOpacity
            style={[styles.toggle, settings.visualFeedback && styles.toggleActive]}
            onPress={() => updateSettings({ visualFeedback: !settings.visualFeedback })}
          >
            <Text style={[styles.toggleText, settings.visualFeedback && styles.toggleTextActive]}>
              {settings.visualFeedback ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[commonStyles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Loyal Lawns Drum Kit...</Text>
        <Text style={styles.loadingSubtext}>
          {loadedSounds}/{totalSounds} sounds loaded ({Math.round(loadingProgress)}%)
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${loadingProgress}%` }]} />
        </View>
        <Text style={styles.loadingNote}>
          Preparing 35 professional drum sounds for low-latency playback
        </Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{currentKit.name}</Text>
          <Text style={styles.headerSubtitle}>
            {currentKit.sounds.length} Professional Sounds • Low Latency
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.bpmText}>{currentKit.bpm} BPM</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Drum Pads Grid */}
        <View style={styles.drumPadsContainer}>
          <Text style={styles.sectionTitle}>
            All Sounds ({currentKit.sounds.length})
          </Text>
          <View style={styles.drumPadsGrid}>
            {currentKit.sounds.map((sound, index) => renderDrumPad(sound, index))}
          </View>
        </View>

        {/* Controls */}
        {renderControls()}

        {/* Settings */}
        {renderSettings()}

        {/* Kit Info */}
        <View style={styles.kitInfo}>
          <Text style={styles.kitInfoTitle}>Loyal Lawns Drum Kit</Text>
          <Text style={styles.kitInfoText}>{currentKit.description}</Text>
          <Text style={styles.kitInfoText}>
            ✓ {currentKit.sounds.length} professional drum sounds with original names
          </Text>
          <Text style={styles.kitInfoText}>
            ✓ Low-latency playback with sound pooling for polyphonic performance
          </Text>
          <Text style={styles.kitInfoText}>
            ✓ Recording & Pattern playback • Haptic feedback • Gesture control
          </Text>
          <Text style={styles.kitInfoText}>
            ✓ No categories - all sounds displayed with their original names from loyallawnsandlandscaping-alt/Drum-Kit
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 2,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 8,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  bpmText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  drumPadsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  drumPadsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  drumPad: {
    borderRadius: 12,
    marginBottom: 8,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  drumPadGradient: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  drumPadText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.background,
    textAlign: 'center',
    lineHeight: 11,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.backgroundAlt,
    minWidth: 80,
  },
  controlButtonActive: {
    backgroundColor: colors.primary,
  },
  recordingButton: {
    backgroundColor: colors.error,
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
  },
  controlButtonTextActive: {
    color: colors.background,
  },
  settingsContainer: {
    padding: 20,
    backgroundColor: colors.backgroundAlt,
    margin: 20,
    borderRadius: 16,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginHorizontal: 16,
  },
  volumeControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.grey,
  },
  toggle: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.grey,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  toggleTextActive: {
    color: colors.background,
  },
  kitInfo: {
    padding: 20,
  },
  kitInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  kitInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default DrumKit;
