
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors } from '../../styles/commonStyles';
import { useMessages } from '../../hooks/useMessages';
import { mockUsers } from '../../data/mockData';
import Icon from '../../components/Icon';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { messages, chats, sendMessage, addReaction, setTyping, loadMessages } = useMessages(id);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const chat = chats.find(c => c.id === id);

  useEffect(() => {
    if (id) {
      loadMessages(id);
    }
  }, [id]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !id) return;

    const messageText = inputText.trim();
    setInputText('');
    setIsTyping(false);
    await setTyping(id, false);

    const result = await sendMessage(id, messageText);
    if (!result.success) {
      Alert.alert('Error', result.error || 'Failed to send message');
    }
  };

  const handleInputChange = async (text: string) => {
    setInputText(text);
    
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      if (id) await setTyping(id, true);
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
      if (id) await setTyping(id, false);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    const result = await addReaction(messageId, emoji);
    if (!result.success) {
      Alert.alert('Error', result.error || 'Failed to add reaction');
    }
  };

  const getUserInfo = (userId: string) => {
    return mockUsers.find(u => u.id === userId) || {
      id: userId,
      displayName: 'Unknown User',
      avatar: '',
    };
  };

  const getChatDisplayInfo = () => {
    if (!chat) return { name: 'Chat', avatar: '' };
    
    if (chat.type === 'group') {
      return {
        name: chat.name || 'Group Chat',
        avatar: chat.avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop',
      };
    } else {
      const otherUserId = chat.participants.find(id => id !== 'current_user');
      const otherUser = getUserInfo(otherUserId || '');
      return {
        name: otherUser.displayName,
        avatar: otherUser.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      };
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const displayInfo = getChatDisplayInfo();

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.background,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 16 }}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Image
          source={{ uri: displayInfo.avatar }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            marginRight: 12,
            backgroundColor: colors.backgroundAlt,
          }}
        />

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
            {displayInfo.name}
          </Text>
          {chat?.isTyping.length > 0 && (
            <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
              typing...
            </Text>
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Video Call', 'Start video call with ' + displayInfo.name + '?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call', onPress: () => router.push('/call/room') }
              ]);
            }}
          >
            <Icon name="videocam" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Audio Call', 'Start audio call with ' + displayInfo.name + '?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call', onPress: () => router.push('/call/room') }
              ]);
            }}
          >
            <Icon name="call" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20 }}
        >
          {messages.map((message) => {
            const isCurrentUser = message.senderId === 'current_user';
            const senderInfo = getUserInfo(message.senderId);

            return (
              <View
                key={message.id}
                style={{
                  alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  marginVertical: 4,
                }}
              >
                {!isCurrentUser && chat?.type === 'group' && (
                  <Text
                    style={[
                      commonStyles.textSecondary,
                      { fontSize: 12, marginBottom: 2, marginLeft: 12 }
                    ]}
                  >
                    {senderInfo.displayName}
                  </Text>
                )}

                <TouchableOpacity
                  onLongPress={() => {
                    Alert.alert(
                      'React to message',
                      'Choose a reaction',
                      [
                        { text: '👍', onPress: () => handleReaction(message.id, '👍') },
                        { text: '❤️', onPress: () => handleReaction(message.id, '❤️') },
                        { text: '😂', onPress: () => handleReaction(message.id, '😂') },
                        { text: '😮', onPress: () => handleReaction(message.id, '😮') },
                        { text: 'Cancel', style: 'cancel' },
                      ]
                    );
                  }}
                  style={{
                    backgroundColor: isCurrentUser ? colors.primary : colors.backgroundAlt,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 20,
                    borderBottomRightRadius: isCurrentUser ? 4 : 20,
                    borderBottomLeftRadius: isCurrentUser ? 20 : 4,
                  }}
                >
                  <Text
                    style={{
                      color: isCurrentUser ? colors.background : colors.text,
                      fontSize: 16,
                    }}
                  >
                    {message.content}
                  </Text>

                  <Text
                    style={{
                      color: isCurrentUser ? colors.background : colors.textSecondary,
                      fontSize: 11,
                      marginTop: 4,
                      opacity: 0.7,
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </Text>
                </TouchableOpacity>

                {/* Reactions */}
                {message.reactions.length > 0 && (
                  <View
                    style={{
                      flexDirection: 'row',
                      marginTop: 4,
                      alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {message.reactions.map((reaction, index) => (
                      <View
                        key={index}
                        style={{
                          backgroundColor: colors.backgroundAlt,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 12,
                          marginRight: 4,
                        }}
                      >
                        <Text style={{ fontSize: 12 }}>{reaction.emoji}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Input */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          }}
        >
          <TouchableOpacity style={{ marginRight: 12 }}>
            <Icon name="add" size={24} color={colors.primary} />
          </TouchableOpacity>

          <TextInput
            style={{
              flex: 1,
              backgroundColor: colors.backgroundAlt,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              color: colors.text,
              maxHeight: 100,
            }}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={handleInputChange}
            multiline
            onSubmitEditing={handleSend}
          />

          <TouchableOpacity
            style={{
              marginLeft: 12,
              backgroundColor: colors.primary,
              borderRadius: 20,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Icon name="send" size={20} color={colors.background} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
