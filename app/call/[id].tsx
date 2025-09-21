
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors } from '../../styles/commonStyles';
import { useCalls } from '../../hooks/useCalls';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/Icon';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const CallScreen = () => {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { calls, endCall, answerCall, declineCall } = useCalls();
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  const call = calls.find(c => c.id === id);

  useEffect(() => {
    if (call?.status === 'active') {
      // Start call duration timer
      intervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [call?.status]);

  useEffect(() => {
    // Haptic feedback for call events
    if (call?.status === 'ringing') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [call?.status]);

  const handleEndCall = async () => {
    if (call) {
      await endCall(call.id);
      router.back();
    }
  };

  const handleAnswerCall = async () => {
    if (call) {
      await answerCall(call.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleDeclineCall = async () => {
    if (call) {
      await declineCall(call.id);
      router.back();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!call) {
    return (
      <SafeAreaView style={[commonStyles.safeArea, { backgroundColor: colors.error }]}>
        <View style={[commonStyles.centered, { flex: 1 }]}>
          <Icon name="alert-circle" size={80} color="white" />
          <Text style={[commonStyles.title, { color: 'white', marginTop: 20 }]}>
            Call Not Found
          </Text>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: 'rgba(255,255,255,0.2)', marginTop: 20 }]}
            onPress={() => router.back()}
          >
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isIncoming = call.receiverId === user?.id;
  const otherUser = isIncoming ? call.caller : call.receiver;
  const isVideoCall = call.type === 'video';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isVideoCall ? '#000' : colors.primary }]}>
      {/* Video Area */}
      {isVideoCall && (
        <View style={styles.videoContainer}>
          {/* Remote Video */}
          <View style={styles.remoteVideo}>
            <View style={[commonStyles.centered, { flex: 1 }]}>
              <Icon name="person" size={120} color="rgba(255,255,255,0.3)" />
              <Text style={[commonStyles.text, { color: 'white', marginTop: 20 }]}>
                {otherUser.displayName}
              </Text>
            </View>
          </View>

          {/* Local Video */}
          {isVideoOn && (
            <View style={styles.localVideo}>
              <View style={[commonStyles.centered, { flex: 1 }]}>
                <Icon name="person" size={40} color="rgba(255,255,255,0.8)" />
              </View>
            </View>
          )}
        </View>
      )}

      {/* Call Info */}
      <View style={styles.callInfo}>
        {!isVideoCall && (
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Icon name="person" size={80} color="white" />
            </View>
          </View>
        )}

        <Text style={styles.callerName}>{otherUser.displayName}</Text>
        
        <Text style={styles.callStatus}>
          {call.status === 'ringing' && isIncoming && 'Incoming call...'}
          {call.status === 'ringing' && !isIncoming && 'Calling...'}
          {call.status === 'active' && formatDuration(callDuration)}
          {call.status === 'completed' && 'Call ended'}
          {call.status === 'declined' && 'Call declined'}
          {call.status === 'missed' && 'Missed call'}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {call.status === 'ringing' && isIncoming ? (
          // Incoming call controls
          <View style={styles.incomingControls}>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.error }]}
              onPress={handleDeclineCall}
            >
              <Icon name="call" size={32} color="white" style={{ transform: [{ rotate: '135deg' }] }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.success }]}
              onPress={handleAnswerCall}
            >
              <Icon name="call" size={32} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          // Active call controls
          <View style={styles.activeControls}>
            <TouchableOpacity
              style={[styles.smallControlButton, { backgroundColor: isMuted ? colors.error : 'rgba(255,255,255,0.2)' }]}
              onPress={toggleMute}
            >
              <Icon name={isMuted ? 'mic-off' : 'mic'} size={24} color="white" />
            </TouchableOpacity>

            {isVideoCall && (
              <TouchableOpacity
                style={[styles.smallControlButton, { backgroundColor: !isVideoOn ? colors.error : 'rgba(255,255,255,0.2)' }]}
                onPress={toggleVideo}
              >
                <Icon name={isVideoOn ? 'videocam' : 'videocam-off'} size={24} color="white" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.smallControlButton, { backgroundColor: isSpeakerOn ? colors.primary : 'rgba(255,255,255,0.2)' }]}
              onPress={toggleSpeaker}
            >
              <Icon name="volume-high" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.error }]}
              onPress={handleEndCall}
            >
              <Icon name="call" size={32} color="white" style={{ transform: [{ rotate: '135deg' }] }} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Demo Notice */}
      <View style={styles.demoNotice}>
        <Text style={styles.demoText}>
          📱 Demo Mode - Video calling functionality will be implemented with WebRTC
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  localVideo: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    backgroundColor: '#333',
    borderRadius: 12,
    overflow: 'hidden',
  },
  callInfo: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callerName: {
    fontSize: 28,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
  },
  controls: {
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  incomingControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallControlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoNotice: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 8,
  },
  demoText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default CallScreen;
