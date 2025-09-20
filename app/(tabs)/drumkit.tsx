
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors } from '../../styles/commonStyles';
import DrumKit from '../../components/DrumKit';
import { useDrumKit } from '../../hooks/useDrumKit';
import Icon from '../../components/Icon';
import SimpleBottomSheet from '../../components/BottomSheet';

const DrumKitScreen: React.FC = () => {
  const {
    currentKit,
    settings,
    isLoading,
    error,
    loadedSounds,
    totalSounds,
    sessions,
    isPlaying,
    isRecording,
    loadingProgress,
  } = useDrumKit();

  const [refreshing, setRefreshing] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    console.log('Refreshing drum kit...');
    // The hook will automatically reload when the component refreshes
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleStartDrumming = () => {
    console.log('Starting drum session');
  };

  const renderQuickStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{loadedSounds}</Text>
        <Text style={styles.statLabel}>Loaded</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{totalSounds}</Text>
        <Text style={styles.statLabel}>Total</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{sessions.length}</Text>
        <Text style={styles.statLabel}>Sessions</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{Math.round(settings.masterVolume * 100)}%</Text>
        <Text style={styles.statLabel}>Volume</Text>
      </View>
    </View>
  );

  const renderRecentSessions = () => {
    if (sessions.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        {sessions.slice(0, 3).map((session) => (
          <View key={session.id} style={styles.sessionItem}>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionTitle}>Session {session.id.slice(-4)}</Text>
              <Text style={styles.sessionDate}>
                {new Date(session.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.sessionStats}>
              <Text style={styles.sessionStat}>{session.patterns.length} patterns</Text>
              {session.recording && (
                <Text style={styles.sessionStat}>Recorded</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderKitInfo = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Kit Information</Text>
        <TouchableOpacity onPress={() => setShowInfo(true)}>
          <Icon name="information-circle-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.kitInfoCard}>
        <Text style={styles.kitName}>{currentKit.name}</Text>
        <Text style={styles.kitDescription}>{currentKit.description}</Text>
        
        <View style={styles.kitDetails}>
          <View style={styles.kitDetailRow}>
            <Text style={styles.kitDetailLabel}>BPM:</Text>
            <Text style={styles.kitDetailValue}>{currentKit.bpm}</Text>
          </View>
          <View style={styles.kitDetailRow}>
            <Text style={styles.kitDetailLabel}>Sounds:</Text>
            <Text style={styles.kitDetailValue}>{currentKit.sounds.length}</Text>
          </View>
          <View style={styles.kitDetailRow}>
            <Text style={styles.kitDetailLabel}>Status:</Text>
            <Text style={[
              styles.kitDetailValue,
              { color: error ? colors.error : (loadedSounds === totalSounds ? colors.success : colors.warning) }
            ]}>
              {error ? 'Error' : (loadedSounds === totalSounds ? 'Ready' : 'Loading')}
            </Text>
          </View>
        </View>

        {isLoading && (
          <View style={styles.loadingInfo}>
            <Text style={styles.loadingText}>
              Loading sounds... {Math.round(loadingProgress)}%
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${loadingProgress}%` }]} />
            </View>
          </View>
        )}

        {error && (
          <View style={styles.errorInfo}>
            <Icon name="warning" size={16} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderInfoBottomSheet = () => (
    <SimpleBottomSheet
      isVisible={showInfo}
      onClose={() => setShowInfo(false)}
      title="Loyal Lawns Drum Kit"
    >
      <ScrollView style={styles.infoContent}>
        <Text style={styles.infoTitle}>About This Drum Kit</Text>
        <Text style={styles.infoText}>
          This drum kit contains 35 professional drum sounds from the loyallawnsandlandscaping-alt/Drum-Kit repository.
        </Text>
        
        <Text style={styles.infoSubtitle}>Features:</Text>
        <Text style={styles.infoText}>• Low-latency audio playback with sound pooling</Text>
        <Text style={styles.infoText}>• Polyphonic playback (multiple sounds simultaneously)</Text>
        <Text style={styles.infoText}>• Recording and pattern playback capabilities</Text>
        <Text style={styles.infoText}>• Haptic feedback and visual effects</Text>
        <Text style={styles.infoText}>• Gesture control support</Text>
        
        <Text style={styles.infoSubtitle}>Sound Categories:</Text>
        <Text style={styles.infoText}>• 5 Kick drums</Text>
        <Text style={styles.infoText}>• 6 Snare drums</Text>
        <Text style={styles.infoText}>• 6 Hi-hat variations</Text>
        <Text style={styles.infoText}>• 5 Cymbals (crash, ride, china)</Text>
        <Text style={styles.infoText}>• 6 Toms (high, mid, low)</Text>
        <Text style={styles.infoText}>• 4 Percussion instruments</Text>
        <Text style={styles.infoText}>• 3 Electronic sounds</Text>
        
        <Text style={styles.infoSubtitle}>Performance:</Text>
        <Text style={styles.infoText}>
          All sounds are preloaded into memory for instant playback. Each sound has multiple instances 
          to support polyphonic performance without audio dropouts.
        </Text>
        
        {loadedSounds < totalSounds && (
          <View style={styles.infoWarning}>
            <Icon name="warning" size={16} color={colors.warning} />
            <Text style={styles.infoWarningText}>
              Some audio files may be missing. Please ensure all 35 drum files are placed in the assets/sounds directory.
            </Text>
          </View>
        )}
      </ScrollView>
    </SimpleBottomSheet>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView
        style={commonStyles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Drum Kit</Text>
          <Text style={styles.headerSubtitle}>
            Loyal Lawns Professional Sounds
          </Text>
        </View>

        {/* Quick Stats */}
        {renderQuickStats()}

        {/* Main Drum Kit Component */}
        <View style={styles.drumKitContainer}>
          <DrumKit gestureControlEnabled={settings.gestureControl} />
        </View>

        {/* Kit Information */}
        {renderKitInfo()}

        {/* Recent Sessions */}
        {renderRecentSessions()}

        {/* Status Indicators */}
        <View style={styles.statusContainer}>
          {isPlaying && (
            <View style={styles.statusItem}>
              <Icon name="play" size={16} color={colors.success} />
              <Text style={styles.statusText}>Playing Pattern</Text>
            </View>
          )}
          {isRecording && (
            <View style={styles.statusItem}>
              <Icon name="radio-button-on" size={16} color={colors.error} />
              <Text style={styles.statusText}>Recording</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {renderInfoBottomSheet()}
    </SafeAreaView>
  );
};

const styles = {
  header: {
    padding: 20,
    alignItems: 'center' as const,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.backgroundAlt,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center' as const,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  drumKitContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    overflow: 'hidden' as const,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
  },
  kitInfoCard: {
    backgroundColor: colors.backgroundAlt,
    padding: 16,
    borderRadius: 12,
  },
  kitName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  kitDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  kitDetails: {
    gap: 8,
  },
  kitDetailRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
  },
  kitDetailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  kitDetailValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  loadingInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  loadingText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.grey,
    borderRadius: 2,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  errorInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.error + '20',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginLeft: 8,
    flex: 1,
  },
  sessionItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center' as const,
    padding: 12,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    marginBottom: 8,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  sessionDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sessionStats: {
    alignItems: 'flex-end' as const,
  },
  sessionStat: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    gap: 16,
    paddingVertical: 20,
  },
  statusItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.text,
    marginLeft: 6,
  },
  infoContent: {
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 12,
  },
  infoSubtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  infoWarning: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.warning + '20',
    borderRadius: 8,
  },
  infoWarningText: {
    fontSize: 12,
    color: colors.warning,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
};

export default DrumKitScreen;
