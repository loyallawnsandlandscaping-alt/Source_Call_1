
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
import { useDrumKit } from '../../hooks/useDrumKit';
import DrumKit from '../../components/DrumKit';
import SimpleBottomSheet from '../../components/BottomSheet';
import Icon from '../../components/Icon';

export default function DrumKitScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showDrumKit, setShowDrumKit] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  
  const {
    currentKit,
    settings,
    sessions,
    isLoading,
    error,
    loadedSounds,
    totalSounds,
  } = useDrumKit();

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh drum kit data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleStartDrumming = () => {
    if (error) {
      Alert.alert('Error', 'Drum kit failed to load. Please try again.');
      return;
    }
    setShowDrumKit(true);
  };

  const renderQuickStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Icon name="musical-notes" size={24} color={colors.primary} />
        <Text style={styles.statNumber}>{totalSounds}</Text>
        <Text style={styles.statLabel}>Sounds</Text>
      </View>
      
      <View style={styles.statCard}>
        <Icon name="play-circle" size={24} color={colors.accent} />
        <Text style={styles.statNumber}>{sessions.length}</Text>
        <Text style={styles.statLabel}>Sessions</Text>
      </View>
      
      <View style={styles.statCard}>
        <Icon name="speedometer" size={24} color={colors.secondary} />
        <Text style={styles.statNumber}>{currentKit.bpm}</Text>
        <Text style={styles.statLabel}>BPM</Text>
      </View>
    </View>
  );

  const renderRecentSessions = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        <TouchableOpacity onPress={() => setShowSessions(true)}>
          <Text style={styles.sectionAction}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {sessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="musical-notes-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyStateText}>No sessions yet</Text>
          <Text style={styles.emptyStateSubtext}>Start drumming to create your first session</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {sessions.slice(0, 5).map((session, index) => (
            <TouchableOpacity key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <Icon name="play-circle" size={20} color={colors.primary} />
                <Text style={styles.sessionDate}>
                  {session.createdAt.toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.sessionKit}>{currentKit.name}</Text>
              <Text style={styles.sessionPatterns}>
                {session.patterns.length} patterns
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderKitInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Current Kit</Text>
      <View style={styles.kitCard}>
        <View style={styles.kitHeader}>
          <Text style={styles.kitName}>{currentKit.name}</Text>
          <View style={styles.kitBadge}>
            <Text style={styles.kitBadgeText}>{currentKit.bpm} BPM</Text>
          </View>
        </View>
        <Text style={styles.kitDescription}>{currentKit.description}</Text>
        <View style={styles.kitStats}>
          <Text style={styles.kitStat}>{currentKit.sounds.length} sounds</Text>
          <Text style={styles.kitStat}>•</Text>
          <Text style={styles.kitStat}>Volume: {Math.round(settings.masterVolume * 100)}%</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Drum Kit</Text>
        <TouchableOpacity onPress={() => Alert.alert('Info', 'Drum kit integrated from loyallawnsandlandscaping_alt/Drum_Kit')}>
          <Icon name="information-circle-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        {renderQuickStats()}

        {/* Main Action Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.mainButton}
            onPress={handleStartDrumming}
            disabled={isLoading}
          >
            <Icon 
              name={isLoading ? "hourglass" : "play"} 
              size={32} 
              color={colors.background} 
            />
            <Text style={styles.mainButtonText}>
              {isLoading ? 'Loading...' : 'Start Drumming'}
            </Text>
            {isLoading && (
              <Text style={styles.mainButtonSubtext}>
                {loadedSounds}/{totalSounds} sounds loaded
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Kit Info */}
        {renderKitInfo()}

        {/* Recent Sessions */}
        {renderRecentSessions()}

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <Icon name="hand-left" size={24} color={colors.primary} />
              <Text style={styles.featureTitle}>Touch Control</Text>
              <Text style={styles.featureDescription}>Tap drum pads to play sounds</Text>
            </View>
            
            <View style={styles.featureCard}>
              <Icon name="radio-button-on" size={24} color={colors.error} />
              <Text style={styles.featureTitle}>Recording</Text>
              <Text style={styles.featureDescription}>Record your drum sessions</Text>
            </View>
            
            <View style={styles.featureCard}>
              <Icon name="play-circle" size={24} color={colors.accent} />
              <Text style={styles.featureTitle}>Patterns</Text>
              <Text style={styles.featureDescription}>Play demo patterns</Text>
            </View>
            
            <View style={styles.featureCard}>
              <Icon name="settings" size={24} color={colors.secondary} />
              <Text style={styles.featureTitle}>Customizable</Text>
              <Text style={styles.featureDescription}>Adjust volume and effects</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Drum Kit Modal */}
      <SimpleBottomSheet
        isVisible={showDrumKit}
        onClose={() => setShowDrumKit(false)}
      >
        <DrumKit onClose={() => setShowDrumKit(false)} />
      </SimpleBottomSheet>

      {/* Sessions Modal */}
      <SimpleBottomSheet
        isVisible={showSessions}
        onClose={() => setShowSessions(false)}
      >
        <View style={styles.sessionsModal}>
          <Text style={styles.modalTitle}>Drum Sessions</Text>
          {sessions.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="musical-notes-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>No sessions recorded</Text>
            </View>
          ) : (
            <ScrollView>
              {sessions.map((session) => (
                <TouchableOpacity key={session.id} style={styles.sessionListItem}>
                  <View style={styles.sessionListHeader}>
                    <Text style={styles.sessionListDate}>
                      {session.createdAt.toLocaleDateString()}
                    </Text>
                    <Text style={styles.sessionListTime}>
                      {session.createdAt.toLocaleTimeString()}
                    </Text>
                  </View>
                  <Text style={styles.sessionListKit}>{currentKit.name}</Text>
                  <Text style={styles.sessionListInfo}>
                    {session.patterns.length} patterns • {session.recording ? 'Recorded' : 'No recording'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}

const styles = {
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  mainButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mainButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.background,
    marginTop: 8,
  },
  mainButtonSubtext: {
    fontSize: 12,
    color: colors.background,
    opacity: 0.8,
    marginTop: 4,
  },
  kitCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  kitName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  kitBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  kitBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.background,
  },
  kitDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  kitStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kitStat: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 8,
  },
  sessionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 140,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  sessionKit: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  sessionPatterns: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  sessionsModal: {
    padding: 20,
    maxHeight: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  sessionListItem: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sessionListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sessionListDate: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  sessionListTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sessionListKit: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  sessionListInfo: {
    fontSize: 12,
    color: colors.textSecondary,
  },
};
