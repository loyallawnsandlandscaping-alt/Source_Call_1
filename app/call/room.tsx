
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/Icon';

const CallRoomScreen = () => {
  const { user } = useAuth();
  const [roomId, setRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(id);
  };

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      Alert.alert('Error', 'Please enter a room ID');
      return;
    }

    setIsJoining(true);
    
    try {
      // Simulate room validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to the actual call room
      router.push(`/call/room/${roomId}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to join room');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreateRoom = async () => {
    generateRoomId();
    
    // Auto-join the created room
    setTimeout(() => {
      handleJoinRoom();
    }, 500);
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={commonStyles.content}>
          {/* Header */}
          <View style={[commonStyles.header, { borderBottomWidth: 0 }]}>
            <TouchableOpacity onPress={() => router.back()}>
              <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={commonStyles.headerTitle}>Join Call Room</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
            {/* Icon */}
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
              <Icon name="people" size={80} color={colors.primary} />
              <Text style={[commonStyles.title, { marginTop: 20 }]}>
                Video Call Room
              </Text>
              <Text style={[commonStyles.text, { textAlign: 'center', marginTop: 8 }]}>
                Join an existing room or create a new one
              </Text>
            </View>

            {/* Room ID Input */}
            <View style={{ marginBottom: 30 }}>
              <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>
                Room ID
              </Text>
              <TextInput
                style={[commonStyles.input, { textAlign: 'center', fontSize: 18, letterSpacing: 2 }]}
                placeholder="Enter room ID"
                placeholderTextColor={colors.textSecondary}
                value={roomId}
                onChangeText={setRoomId}
                autoCapitalize="characters"
                maxLength={6}
              />
            </View>

            {/* Buttons */}
            <TouchableOpacity
              style={[buttonStyles.primary, { marginBottom: 12 }]}
              onPress={handleJoinRoom}
              disabled={isJoining || !roomId.trim()}
            >
              <Icon name="log-in" size={20} color="white" />
              <Text style={buttonStyles.primaryText}>
                {isJoining ? 'Joining...' : 'Join Room'}
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
              <Text style={[commonStyles.textSecondary, { marginHorizontal: 16 }]}>or</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            </View>

            <TouchableOpacity
              style={[buttonStyles.secondary]}
              onPress={handleCreateRoom}
              disabled={isJoining}
            >
              <Icon name="add" size={20} color={colors.primary} />
              <Text style={buttonStyles.secondaryText}>Create New Room</Text>
            </TouchableOpacity>

            {/* Info */}
            <View style={[commonStyles.card, { marginTop: 40, backgroundColor: colors.surface }]}>
              <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
                How it works:
              </Text>
              <Text style={[commonStyles.textSecondary, { fontSize: 14, lineHeight: 20 }]}>
                • Share the room ID with friends{'\n'}
                • Up to 8 participants per room{'\n'}
                • Video and audio calling{'\n'}
                • Screen sharing (coming soon)
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CallRoomScreen;
