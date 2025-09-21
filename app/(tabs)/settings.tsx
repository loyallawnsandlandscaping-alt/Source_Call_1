
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../../styles/commonStyles';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/Icon';
import SimpleBottomSheet from '../../components/BottomSheet';

export default function SettingsScreen() {
  const { user, signOut, isSupabaseConfigured, analyticsManager, securityManager } = useAuth();
  const [showAbout, setShowAbout] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    vibration: true,
    readReceipts: true,
    lastSeen: true,
    autoAnswer: false,
    callRecording: false,
    hdVideo: true,
    biometricAuth: true,
    analyticsTracking: true,
    locationTracking: false,
    crashReporting: true,
    performanceMonitoring: true,
  });

  React.useEffect(() => {
    // Track screen view
    analyticsManager.trackScreenView('settings');
  }, []);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            analyticsManager.trackUserAction('sign_out', 'settings_button');
            await signOut();
            router.replace('/auth/signin');
          },
        },
      ]
    );
  };

  const toggleSetting = (key: string) => {
    const newValue = !settings[key as keyof typeof settings];
    
    setSettings(prev => ({
      ...prev,
      [key]: newValue,
    }));

    // Track setting changes
    analyticsManager.trackUserAction('toggle_setting', key, {
      newValue,
      category: getSettingCategory(key),
    });

    // Update analytics configuration
    if (key === 'analyticsTracking') {
      analyticsManager.updateConfig({ enableTracking: newValue });
    } else if (key === 'locationTracking') {
      analyticsManager.updateConfig({ enableLocationTracking: newValue });
    } else if (key === 'crashReporting') {
      analyticsManager.updateConfig({ enableCrashReporting: newValue });
    } else if (key === 'performanceMonitoring') {
      analyticsManager.updateConfig({ enablePerformanceMonitoring: newValue });
    }

    // Update security configuration
    if (key === 'biometricAuth') {
      securityManager.updateConfig({ enableBiometrics: newValue });
    }
  };

  const getSettingCategory = (key: string): string => {
    if (['notifications', 'sound', 'vibration'].includes(key)) return 'notifications';
    if (['readReceipts', 'lastSeen'].includes(key)) return 'privacy';
    if (['autoAnswer', 'callRecording', 'hdVideo'].includes(key)) return 'calls';
    if (['biometricAuth'].includes(key)) return 'security';
    if (['analyticsTracking', 'locationTracking', 'crashReporting', 'performanceMonitoring'].includes(key)) return 'analytics';
    return 'general';
  };

  const handleClearAnalyticsData = () => {
    Alert.alert(
      'Clear Analytics Data',
      'This will permanently delete all stored analytics data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            await analyticsManager.clearAllData();
            analyticsManager.trackEvent('analytics_data_cleared');
            Alert.alert('Success', 'Analytics data has been cleared.');
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const userData = await analyticsManager.exportUserData();
      analyticsManager.trackUserAction('export_data', 'settings_button');
      
      Alert.alert(
        'Data Export',
        `Found ${userData.sessions.length} sessions and ${userData.events.length} events. In a production app, this data would be exported to a file.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  const SettingRow = ({
    title,
    subtitle,
    value,
    onToggle,
    icon,
  }: {
    title: string;
    subtitle?: string;
    value: boolean;
    onToggle: () => void;
    icon: string;
  }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Icon name={icon as any} size={24} color={colors.primary} />
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={[commonStyles.text, { fontWeight: '500' }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
            {subtitle}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.grey, true: colors.primary }}
        thumbColor={colors.background}
      />
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
          <Text style={commonStyles.title}>Settings</Text>
          <Text style={commonStyles.textSecondary}>
            Customize your Source Call experience
          </Text>
        </View>

        {/* Backend Status */}
        <View style={[commonStyles.card, { margin: 20 }]}>
          <View style={[commonStyles.row, { marginBottom: 12 }]}>
            <Icon 
              name={isSupabaseConfigured ? "cloud-done" : "cloud-offline"} 
              size={24} 
              color={isSupabaseConfigured ? colors.success : colors.warning} 
            />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                Backend Status
              </Text>
              <Text style={commonStyles.textSecondary}>
                {isSupabaseConfigured ? 'Connected to Supabase' : 'Using local storage'}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: isSupabaseConfigured ? colors.success : colors.warning,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
              }}
            >
              <Text style={[commonStyles.text, { color: colors.background, fontSize: 10, fontWeight: '600' }]}>
                {isSupabaseConfigured ? 'CONNECTED' : 'LOCAL'}
              </Text>
            </View>
          </View>
        </View>

        {/* Profile Section */}
        <View style={[commonStyles.card, { margin: 20 }]}>
          <View style={[commonStyles.row, { marginBottom: 12 }]}>
            <Icon name="person-circle" size={50} color={colors.primary} />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600', fontSize: 18 }]}>
                {user?.displayName}
              </Text>
              <Text style={commonStyles.textSecondary}>
                {user?.email}
              </Text>
              {user?.isVerified && (
                <View style={[commonStyles.centerRow, { marginTop: 4 }]}>
                  <Icon name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={[commonStyles.textSecondary, { marginLeft: 4, fontSize: 12 }]}>
                    Verified
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View style={{ backgroundColor: colors.card }}>
          <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>
              Notifications
            </Text>
          </View>
          
          <SettingRow
            title="Push Notifications"
            subtitle="Receive notifications for new messages"
            value={settings.notifications}
            onToggle={() => toggleSetting('notifications')}
            icon="notifications"
          />
          
          <SettingRow
            title="Sound"
            subtitle="Play sound for notifications"
            value={settings.sound}
            onToggle={() => toggleSetting('sound')}
            icon="volume-high"
          />
          
          <SettingRow
            title="Vibration"
            subtitle="Vibrate for notifications"
            value={settings.vibration}
            onToggle={() => toggleSetting('vibration')}
            icon="phone-portrait"
          />
        </View>

        {/* Privacy */}
        <View style={{ backgroundColor: colors.card, marginTop: 20 }}>
          <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>
              Privacy
            </Text>
          </View>
          
          <SettingRow
            title="Read Receipts"
            subtitle="Let others know when you&apos;ve read their messages"
            value={settings.readReceipts}
            onToggle={() => toggleSetting('readReceipts')}
            icon="checkmark-done"
          />
          
          <SettingRow
            title="Last Seen"
            subtitle="Show when you were last online"
            value={settings.lastSeen}
            onToggle={() => toggleSetting('lastSeen')}
            icon="time"
          />
        </View>

        {/* Security */}
        <View style={{ backgroundColor: colors.card, marginTop: 20 }}>
          <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>
              Security
            </Text>
          </View>
          
          <SettingRow
            title="Biometric Authentication"
            subtitle="Use fingerprint or face ID to unlock the app"
            value={settings.biometricAuth}
            onToggle={() => toggleSetting('biometricAuth')}
            icon="finger-print"
          />
        </View>

        {/* Calls */}
        <View style={{ backgroundColor: colors.card, marginTop: 20 }}>
          <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>
              Calls
            </Text>
          </View>
          
          <SettingRow
            title="Auto Answer"
            subtitle="Automatically answer incoming calls"
            value={settings.autoAnswer}
            onToggle={() => toggleSetting('autoAnswer')}
            icon="call"
          />
          
          <SettingRow
            title="Call Recording"
            subtitle="Enable call recording (where legal)"
            value={settings.callRecording}
            onToggle={() => toggleSetting('callRecording')}
            icon="mic"
          />
          
          <SettingRow
            title="HD Video"
            subtitle="Use high definition video for calls"
            value={settings.hdVideo}
            onToggle={() => toggleSetting('hdVideo')}
            icon="videocam"
          />
        </View>

        {/* Analytics & Tracking */}
        <View style={{ backgroundColor: colors.card, marginTop: 20 }}>
          <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>
              Analytics & Tracking
            </Text>
          </View>
          
          <SettingRow
            title="Usage Analytics"
            subtitle="Help improve the app by sharing usage data"
            value={settings.analyticsTracking}
            onToggle={() => toggleSetting('analyticsTracking')}
            icon="analytics"
          />
          
          <SettingRow
            title="Location Tracking"
            subtitle="Include location data in analytics (optional)"
            value={settings.locationTracking}
            onToggle={() => toggleSetting('locationTracking')}
            icon="location"
          />
          
          <SettingRow
            title="Crash Reporting"
            subtitle="Automatically report crashes to help fix bugs"
            value={settings.crashReporting}
            onToggle={() => toggleSetting('crashReporting')}
            icon="bug"
          />
          
          <SettingRow
            title="Performance Monitoring"
            subtitle="Monitor app performance to improve user experience"
            value={settings.performanceMonitoring}
            onToggle={() => toggleSetting('performanceMonitoring')}
            icon="speedometer"
          />
        </View>

        {/* Other Options */}
        <View style={{ backgroundColor: colors.card, marginTop: 20 }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
              paddingHorizontal: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
            onPress={() => {
              analyticsManager.trackUserAction('view_about', 'settings_button');
              setShowAbout(true);
            }}
          >
            <Icon name="information-circle" size={24} color={colors.primary} />
            <Text style={[commonStyles.text, { marginLeft: 16, fontWeight: '500' }]}>
              About
            </Text>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
              paddingHorizontal: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
            onPress={() => {
              analyticsManager.trackUserAction('view_privacy', 'settings_button');
              setShowPrivacy(true);
            }}
          >
            <Icon name="shield-checkmark" size={24} color={colors.primary} />
            <Text style={[commonStyles.text, { marginLeft: 16, fontWeight: '500' }]}>
              Privacy Policy
            </Text>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
              paddingHorizontal: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
            onPress={() => {
              analyticsManager.trackUserAction('view_security', 'settings_button');
              setShowSecurity(true);
            }}
          >
            <Icon name="lock-closed" size={24} color={colors.primary} />
            <Text style={[commonStyles.text, { marginLeft: 16, fontWeight: '500' }]}>
              Security Info
            </Text>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
              paddingHorizontal: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
            onPress={handleExportData}
          >
            <Icon name="download" size={24} color={colors.primary} />
            <Text style={[commonStyles.text, { marginLeft: 16, fontWeight: '500' }]}>
              Export My Data
            </Text>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
              paddingHorizontal: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
            onPress={handleClearAnalyticsData}
          >
            <Icon name="trash" size={24} color={colors.warning} />
            <Text style={[commonStyles.text, { marginLeft: 16, fontWeight: '500', color: colors.warning }]}>
              Clear Analytics Data
            </Text>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
              paddingHorizontal: 20,
            }}
            onPress={handleSignOut}
          >
            <Icon name="log-out" size={24} color={colors.error} />
            <Text style={[commonStyles.text, { marginLeft: 16, fontWeight: '500', color: colors.error }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* About Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={showAbout}
        onClose={() => setShowAbout(false)}
      >
        <View style={{ padding: 20 }}>
          <Text style={[commonStyles.subtitle, { marginBottom: 20 }]}>
            About Source Call
          </Text>
          
          <Text style={[commonStyles.text, { marginBottom: 16 }]}>
            A clean, fast messaging and video calling app focused on privacy and performance.
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
              Features:
            </Text>
            <Text style={commonStyles.textSecondary}>
              • Real-time messaging with reactions{'\n'}
              • HD video and audio calling{'\n'}
              • Group video calls (up to 8 people){'\n'}
              • Media sharing (photos, videos){'\n'}
              • Secure end-to-end encryption{'\n'}
              • Cloud sync with Supabase{'\n'}
              • Biometric authentication{'\n'}
              • Cross-platform support
            </Text>
          </View>

          <Text style={[commonStyles.textSecondary, { fontSize: 12, textAlign: 'center' }]}>
            Version 1.0.0 • Built with React Native & Expo{'\n'}
            Powered by Supabase
          </Text>
        </View>
      </SimpleBottomSheet>

      {/* Privacy Policy Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      >
        <View style={{ padding: 20 }}>
          <Text style={[commonStyles.subtitle, { marginBottom: 20 }]}>
            Privacy Policy
          </Text>
          
          <ScrollView style={{ maxHeight: 400 }}>
            <Text style={[commonStyles.text, { marginBottom: 16 }]}>
              <Text style={{ fontWeight: '600' }}>Data Collection:{'\n'}</Text>
              We collect usage analytics, device information, and app interaction data to improve your experience. All data is encrypted and stored securely.
            </Text>

            <Text style={[commonStyles.text, { marginBottom: 16 }]}>
              <Text style={{ fontWeight: '600' }}>Media Processing:{'\n'}</Text>
              Photos and videos are processed locally on your device for privacy. Cloud storage is used only for backup and sync.
            </Text>

            <Text style={[commonStyles.text, { marginBottom: 16 }]}>
              <Text style={{ fontWeight: '600' }}>Location Data:{'\n'}</Text>
              Location tracking is optional and can be disabled in settings. When enabled, location data helps improve call quality and analytics.
            </Text>

            <Text style={[commonStyles.text, { marginBottom: 16 }]}>
              <Text style={{ fontWeight: '600' }}>Data Sharing:{'\n'}</Text>
              We do not sell or share your personal data with third parties. Analytics data is anonymized and used only for app improvement.
            </Text>

            <Text style={[commonStyles.text, { marginBottom: 16 }]}>
              <Text style={{ fontWeight: '600' }}>Your Rights:{'\n'}</Text>
              You can export, delete, or modify your data at any time through the app settings. Contact us for additional privacy requests.
            </Text>
          </ScrollView>
        </View>
      </SimpleBottomSheet>

      {/* Security Info Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={showSecurity}
        onClose={() => setShowSecurity(false)}
      >
        <View style={{ padding: 20 }}>
          <Text style={[commonStyles.subtitle, { marginBottom: 20 }]}>
            Security Information
          </Text>
          
          <ScrollView style={{ maxHeight: 400 }}>
            <Text style={[commonStyles.text, { marginBottom: 16 }]}>
              <Text style={{ fontWeight: '600' }}>Encryption:{'\n'}</Text>
              All sensitive data is encrypted using industry-standard encryption algorithms. Messages and user data are protected both in transit and at rest.
            </Text>

            <Text style={[commonStyles.text, { marginBottom: 16 }]}>
              <Text style={{ fontWeight: '600' }}>Authentication:{'\n'}</Text>
              Multi-factor authentication including biometric options (fingerprint, face ID) provides secure access to your account.
            </Text>

            <Text style={[commonStyles.text, { marginBottom: 16 }]}>
              <Text style={{ fontWeight: '600' }}>Session Management:{'\n'}</Text>
              Sessions automatically expire after 30 minutes of inactivity. Failed login attempts are tracked and accounts are temporarily locked after 5 failed attempts.
            </Text>

            <Text style={[commonStyles.text, { marginBottom: 16 }]}>
              <Text style={{ fontWeight: '600' }}>Input Validation:{'\n'}</Text>
              All user inputs are validated and sanitized to prevent injection attacks and ensure data integrity.
            </Text>

            <Text style={[commonStyles.text, { marginBottom: 16 }]}>
              <Text style={{ fontWeight: '600' }}>Secure Storage:{'\n'}</Text>
              Sensitive information is stored using the device&apos;s secure storage mechanisms, protected by hardware-level security features.
            </Text>
          </ScrollView>
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}
