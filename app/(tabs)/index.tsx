
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../../styles/commonStyles';
import { useAuth } from '../../hooks/useAuth';
import { useMessages } from '../../hooks/useMessages';
import { mockUsers } from '../../data/mockData';
import Icon from '../../components/Icon';
import SimpleBottomSheet from '../../components/BottomSheet';

export default function ChatsScreen() {
  const { user, isAuthenticated } = useAuth();
  const { chats, isLoading, loadChats } = useMessages();
  const [refreshing, setRefreshing] = useState(false);
  const [showNewChatSheet, setShowNewChatSheet] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/signin');
    }
  }, [isAuthenticated]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const getUserInfo = (userId: string) => {
    return mockUsers.find(u => u.id === userId) || {
      id: userId,
      displayName: 'Unknown User',
      avatar: '',
      isOnline: false,
    };
  };

  const getChatDisplayInfo = (chat: any) => {
    if (chat.type === 'group') {
      return {
        name: chat.name || 'Group Chat',
        avatar: chat.avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop',
      };
    } else {
      const otherUserId = chat.participants.find((id: string) => id !== 'current_user');
      const otherUser = getUserInfo(otherUserId);
      return {
        name: otherUser.displayName,
        avatar: otherUser.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      };
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
        <View style={[commonStyles.row, { marginBottom: 20 }]}>
          <Text style={commonStyles.title}>Messages</Text>
          <TouchableOpacity onPress={() => setShowNewChatSheet(true)}>
            <Icon name="add-circle" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {chats.map((chat) => {
          const displayInfo = getChatDisplayInfo(chat);
          const isTyping = chat.isTyping.length > 0;
          
          return (
            <TouchableOpacity
              key={chat.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
              onPress={() => router.push(`/chat/${chat.id}`)}
            >
              <View style={{ position: 'relative', marginRight: 16 }}>
                <Image
                  source={{ uri: displayInfo.avatar }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: colors.backgroundAlt,
                  }}
                />
                {chat.unreadCount > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      backgroundColor: colors.error,
                      borderRadius: 10,
                      minWidth: 20,
                      height: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: colors.background,
                        fontSize: 12,
                        fontWeight: '600',
                      }}
                    >
                      {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                    </Text>
                  </View>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <View style={[commonStyles.row, { marginBottom: 4 }]}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: colors.text,
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {displayInfo.name}
                  </Text>
                  <Text style={commonStyles.textSecondary}>
                    {chat.lastMessage ? formatTime(chat.lastMessage.timestamp) : ''}
                  </Text>
                </View>

                <Text
                  style={[
                    commonStyles.textSecondary,
                    {
                      fontStyle: isTyping ? 'italic' : 'normal',
                      color: isTyping ? colors.primary : colors.textSecondary,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {isTyping
                    ? 'typing...'
                    : chat.lastMessage?.content || 'No messages yet'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {chats.length === 0 && !isLoading && (
          <View style={[commonStyles.content, { marginTop: 100 }]}>
            <Icon name="chatbubbles-outline" size={80} color={colors.textSecondary} />
            <Text style={[commonStyles.text, { marginTop: 16 }]}>
              No conversations yet
            </Text>
            <Text style={commonStyles.textSecondary}>
              Start a new chat to begin messaging
            </Text>
          </View>
        )}
      </ScrollView>

      <SimpleBottomSheet
        isVisible={showNewChatSheet}
        onClose={() => setShowNewChatSheet(false)}
      >
        <View style={{ padding: 20 }}>
          <Text style={[commonStyles.subtitle, { marginBottom: 20 }]}>
            Start New Chat
          </Text>
          
          {mockUsers.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
              onPress={() => {
                setShowNewChatSheet(false);
                // Create new chat logic would go here
                console.log('Starting chat with:', user.displayName);
              }}
            >
              <Image
                source={{ uri: user.avatar }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  marginRight: 12,
                  backgroundColor: colors.backgroundAlt,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>
                  {user.displayName}
                </Text>
                <Text style={commonStyles.textSecondary}>
                  @{user.username}
                </Text>
              </View>
              {user.isOnline && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.success,
                  }}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}
