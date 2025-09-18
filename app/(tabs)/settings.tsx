
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
  const { user, signOut } = useAuth();
  const [showAbout, setShowAbout] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    vibration: true,
    readReceipts: true,
    lastSeen: true,
    faceDetection: true,
    handDetection: true,
    gestureControl: true,
    autoAnnotation: false,
  });

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
            await signOut();
            router.replace('/auth/signin');
          },
        },
      ]
    );
  };

  const toggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
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
            Customize your messaging experience
          </Text>
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

        {/* AI Features */}
        <View style={{ backgroundColor: colors.card, marginTop: 20 }}>
          <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>
              AI Features
            </Text>
          </View>
          
          <SettingRow
            title="Face Detection"
            subtitle="Enable face detection in camera"
            value={settings.faceDetection}
            onToggle={() => toggleSetting('faceDetection')}
            icon="happy"
          />
          
          <SettingRow
            title="Hand Detection"
            subtitle="Enable hand tracking for gestures"
            value={settings.handDetection}
            onToggle={() => toggleSetting('handDetection')}
            icon="hand-left"
          />
          
          <SettingRow
            title="Gesture Control"
            subtitle="Control app with hand gestures"
            value={settings.gestureControl}
            onToggle={() => toggleSetting('gestureControl')}
            icon="finger-print"
          />
          
          <SettingRow
            title="Auto Annotation"
            subtitle="Automatically create annotations from AI detections"
            value={settings.autoAnnotation}
            onToggle={() => toggleSetting('autoAnnotation')}
            icon="create"
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
            onPress={() => setShowAbout(true)}
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
            onPress={() => Alert.alert('Help', 'Help documentation coming soon!')}
          >
            <Icon name="help-circle" size={24} color={colors.primary} />
            <Text style={[commonStyles.text, { marginLeft: 16, fontWeight: '500' }]}>
              Help & Support
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
            About This App
          </Text>
          
          <Text style={[commonStyles.text, { marginBottom: 16 }]}>
            A secure, real-time messaging app with advanced AI-powered annotation capabilities.
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
              Features:
            </Text>
            <Text style={commonStyles.textSecondary}>
              • Real-time messaging with reactions{'\n'}
              • AI-powered face and hand detection{'\n'}
              • Touchless gesture control{'\n'}
              • Advanced annotation system{'\n'}
              • Video calling capabilities{'\n'}
              • Secure end-to-end encryption
            </Text>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
              AI Models:
            </Text>
            <Text style={commonStyles.textSecondary}>
              • Face Detection & Emotion Analysis{'\n'}
              • Hand Landmark Detection{'\n'}
              • Gesture Recognition{'\n'}
              • Object Detection & Classification{'\n'}
              • Real-time Frame Analysis
            </Text>
          </View>

          <Text style={[commonStyles.textSecondary, { fontSize: 12, textAlign: 'center' }]}>
            Version 1.0.0 • Built with React Native & Expo
          </Text>
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}
