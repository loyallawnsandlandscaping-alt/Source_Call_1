
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors } from '../../../styles/commonStyles';
import { useAuth } from '../../../hooks/useAuth';
import Icon from '../../../components/Icon';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isHost: boolean;
}

const RoomCallScreen = () => {
  const { roomId } = useLocalSearchParams();
  const { user } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    // Simulate joining room and getting participants
    const mockParticipants: Participant[] = [
      {
        id: user?.id || 'current_user',
        name: user?.displayName || 'You',
        isMuted: false,
        isVideoOn: true,
        isHost: true,
      },
      {
        id: 'user_2',
        name: 'Alice Johnson',
        isMuted: false,
        isVideoOn: true,
        isHost: false,
      },
      {
        id: 'user_3',
        name: 'Bob Smith',
        isMuted: true,
        isVideoOn: false,
        isHost: false,
      },
    ];

    setParticipants(mockParticipants);

    // Start call duration timer
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setParticipants(prev => prev.map(p => 
      p.id === user?.id ? { ...p, isMuted: !isMuted } : p
    ));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    setParticipants(prev => prev.map(p => 
      p.id === user?.id ? { ...p, isVideoOn: !isVideoOn } : p
    ));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const leaveRoom = () => {
    router.back();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderParticipant = (participant: Participant, index: number) => {
    const isCurrentUser = participant.id === user?.id;
    const participantCount = participants.length;
    
    // Calculate grid layout
    let participantWidth = width;
    let participantHeight = height * 0.6;
    
    if (participantCount === 2) {
      participantWidth = width / 2;
    } else if (participantCount <= 4) {
      participantWidth = width / 2;
      participantHeight = height * 0.3;
    } else if (participantCount <= 6) {
      participantWidth = width / 3;
      participantHeight = height * 0.25;
    } else {
      participantWidth = width / 3;
      participantHeight = height * 0.2;
    }

    return (
      <View
        key={participant.id}
        style={[
          styles.participantVideo,
          {
            width: participantWidth - 4,
            height: participantHeight,
            backgroundColor: participant.isVideoOn ? '#1a1a1a' : '#333',
          }
        ]}
      >
        {/* Video placeholder */}
        <View style={[commonStyles.centered, { flex: 1 }]}>
          <Icon 
            name="person" 
            size={participant.isVideoOn ? 60 : 40} 
            color={participant.isVideoOn ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)'} 
          />
        </View>

        {/* Participant info */}
        <View style={styles.participantInfo}>
          <Text style={styles.participantName}>
            {isCurrentUser ? 'You' : participant.name}
          </Text>
          
          <View style={styles.participantStatus}>
            {participant.isMuted && (
              <Icon name="mic-off" size={16} color={colors.error} />
            )}
            {!participant.isVideoOn && (
              <Icon name="videocam-off" size={16} color={colors.warning} />
            )}
            {participant.isHost && (
              <Icon name="star" size={16} color={colors.primary} />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.roomId}>Room: {roomId}</Text>
          <Text style={styles.duration}>{formatDuration(callDuration)}</Text>
        </View>
        <TouchableOpacity
          style={styles.participantCount}
          onPress={() => {
            // Show participants list
          }}
        >
          <Icon name="people" size={16} color="white" />
          <Text style={styles.participantCountText}>{participants.length}</Text>
        </TouchableOpacity>
      </View>

      {/* Participants Grid */}
      <ScrollView style={styles.participantsContainer} bounces={false}>
        <View style={styles.participantsGrid}>
          {participants.map(renderParticipant)}
        </View>
      </ScrollView>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: isMuted ? colors.error : 'rgba(255,255,255,0.2)' }]}
          onPress={toggleMute}
        >
          <Icon name={isMuted ? 'mic-off' : 'mic'} size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: !isVideoOn ? colors.error : 'rgba(255,255,255,0.2)' }]}
          onPress={toggleVideo}
        >
          <Icon name={isVideoOn ? 'videocam' : 'videocam-off'} size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: isSpeakerOn ? colors.primary : 'rgba(255,255,255,0.2)' }]}
          onPress={toggleSpeaker}
        >
          <Icon name="volume-high" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
          onPress={() => {
            // Screen share functionality
            alert('Screen sharing coming soon!');
          }}
        >
          <Icon name="desktop" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.error }]}
          onPress={leaveRoom}
        >
          <Icon name="call" size={24} color="white" style={{ transform: [{ rotate: '135deg' }] }} />
        </TouchableOpacity>
      </View>

      {/* Demo Notice */}
      <View style={styles.demoNotice}>
        <Text style={styles.demoText}>
          📱 Demo Mode - WebRTC integration will enable real video calling
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerLeft: {
    flex: 1,
  },
  roomId: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  duration: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 2,
  },
  participantCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  participantCountText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  participantsContainer: {
    flex: 1,
  },
  participantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 2,
  },
  participantVideo: {
    margin: 2,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  participantInfo: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  participantStatus: {
    flexDirection: 'row',
    gap: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoNotice: {
    position: 'absolute',
    top: 80,
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

export default RoomCallScreen;
