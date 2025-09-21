
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { useAuth } from '../../hooks/useAuth';
import { useCalls } from '../../hooks/useCalls';
import Icon from '../../components/Icon';
import SimpleBottomSheet from '../../components/BottomSheet';

const CallsScreen = () => {
  const { user } = useAuth();
  const { calls, isLoading, startCall, endCall, loadCalls } = useCalls();
  const [refreshing, setRefreshing] = useState(false);
  const [showNewCallSheet, setShowNewCallSheet] = useState(false);

  useEffect(() => {
    loadCalls();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCalls();
    setRefreshing(false);
  };

  const handleStartVideoCall = async (userId: string) => {
    try {
      const result = await startCall(userId, 'video');
      if (result.success) {
        router.push(`/call/${result.callId}`);
      } else {
        Alert.alert('Error', result.error || 'Failed to start call');
      }
    } catch (error) {
      console.log('Error starting video call:', error);
      Alert.alert('Error', 'Failed to start video call');
    }
  };

  const handleStartAudioCall = async (userId: string) => {
    try {
      const result = await startCall(userId, 'audio');
      if (result.success) {
        router.push(`/call/${result.callId}`);
      } else {
        Alert.alert('Error', result.error || 'Failed to start call');
      }
    } catch (error) {
      console.log('Error starting audio call:', error);
      Alert.alert('Error', 'Failed to start audio call');
    }
  };

  const formatCallDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatCallTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
  };

  const renderCallItem = (call: any) => {
    const isOutgoing = call.callerId === user?.id;
    const otherUser = isOutgoing ? call.receiver : call.caller;
    const callIcon = call.type === 'video' ? 'videocam' : 'call';
    const statusIcon = call.status === 'completed' ? 'checkmark-circle' : 
                      call.status === 'missed' ? 'close-circle' : 'time';
    const statusColor = call.status === 'completed' ? colors.success : 
                       call.status === 'missed' ? colors.error : colors.warning;

    return (
      <TouchableOpacity
        key={call.id}
        style={[commonStyles.card, { marginBottom: 12 }]}
        onPress={() => {
          if (call.status === 'completed') {
            // Show call details or start new call
            Alert.alert(
              'Call Options',
              `Call with ${otherUser.displayName}`,
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Video Call', 
                  onPress: () => handleStartVideoCall(otherUser.id) 
                },
                { 
                  text: 'Audio Call', 
                  onPress: () => handleStartAudioCall(otherUser.id) 
                },
              ]
            );
          }
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ position: 'relative', marginRight: 12 }}>
            {otherUser.avatar ? (
              <Image
                source={{ uri: otherUser.avatar }}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: colors.surface,
                }}
              />
            ) : (
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="person" size={24} color={colors.textSecondary} />
              </View>
            )}
            <View
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 2,
              }}
            >
              <Icon name={callIcon} size={16} color={colors.primary} />
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>
              {otherUser.displayName}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Icon 
                name={isOutgoing ? 'arrow-up' : 'arrow-down'} 
                size={14} 
                color={colors.textSecondary} 
              />
              <Text style={[commonStyles.textSecondary, { marginLeft: 4, fontSize: 14 }]}>
                {isOutgoing ? 'Outgoing' : 'Incoming'} • {formatCallTime(call.startedAt)}
              </Text>
            </View>
            {call.duration && (
              <Text style={[commonStyles.textSecondary, { fontSize: 12, marginTop: 2 }]}>
                Duration: {formatCallDuration(call.duration)}
              </Text>
            )}
          </View>

          <View style={{ alignItems: 'center' }}>
            <Icon name={statusIcon} size={20} color={statusColor} />
            <Text style={[commonStyles.textSecondary, { fontSize: 12, marginTop: 2 }]}>
              {call.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      {/* Header */}
      <View style={commonStyles.header}>
        <Text style={commonStyles.headerTitle}>Calls</Text>
        <TouchableOpacity onPress={() => setShowNewCallSheet(true)}>
          <Icon name="add" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Call History */}
      <ScrollView
        style={commonStyles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={commonStyles.content}>
          {calls.length === 0 ? (
            <View style={[commonStyles.centered, { marginTop: 100 }]}>
              <Icon name="call" size={80} color={colors.textSecondary} />
              <Text style={[commonStyles.title, { marginTop: 20, color: colors.textSecondary }]}>
                No Calls Yet
              </Text>
              <Text style={[commonStyles.text, { textAlign: 'center', marginTop: 8 }]}>
                Start your first video or audio call with friends
              </Text>
              <TouchableOpacity
                style={[buttonStyles.primary, { marginTop: 20 }]}
                onPress={() => setShowNewCallSheet(true)}
              >
                <Icon name="videocam" size={20} color="white" />
                <Text style={buttonStyles.primaryText}>Start Call</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ paddingBottom: 20 }}>
              <Text style={[commonStyles.sectionTitle, { marginBottom: 16 }]}>
                Recent Calls
              </Text>
              {calls.map(renderCallItem)}
            </View>
          )}
        </View>
      </ScrollView>

      {/* New Call Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={showNewCallSheet}
        onClose={() => setShowNewCallSheet(false)}
      >
        <View style={{ padding: 20 }}>
          <Text style={[commonStyles.cardTitle, { marginBottom: 20 }]}>Start New Call</Text>
          
          <TouchableOpacity
            style={[buttonStyles.primary, { marginBottom: 12 }]}
            onPress={() => {
              setShowNewCallSheet(false);
              // Navigate to contacts or start instant call
              Alert.alert('Feature Coming Soon', 'Contact selection will be available soon');
            }}
          >
            <Icon name="videocam" size={20} color="white" />
            <Text style={buttonStyles.primaryText}>Video Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.secondary, { marginBottom: 12 }]}
            onPress={() => {
              setShowNewCallSheet(false);
              Alert.alert('Feature Coming Soon', 'Contact selection will be available soon');
            }}
          >
            <Icon name="call" size={20} color={colors.primary} />
            <Text style={buttonStyles.secondaryText}>Audio Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.secondary]}
            onPress={() => {
              setShowNewCallSheet(false);
              router.push('/call/room');
            }}
          >
            <Icon name="people" size={20} color={colors.primary} />
            <Text style={buttonStyles.secondaryText}>Join Room</Text>
          </TouchableOpacity>
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
};

export default CallsScreen;
