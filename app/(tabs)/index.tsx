
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
  const [refreshing, setRefreshing] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const { chats, loading } = useMessages();
  const { isAuthenticated, analyticsManager } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Track screen view
      analyticsManager.trackScreenView('chats_list');
      
      // Track feature usage
      analyticsManager.trackFeatureUsage('messaging', {
        chatsCount: chats.length,
      });
    }
  }, [isAuthenticated, chats.length]);

  const onRefresh = async () => {
    setRefreshing(true);
    analyticsManager.trackUserAction('refresh', 'chats_list');
    
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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
    return mockUsers.find(user => user.id === userId) || {
      id: userId,
      displayName: 'Unknown User',
      avatar: null,
    };
  };

  const getChatDisplayInfo = (chat: any) => {
    if (chat.type === 'group') {
      return {
        name: chat.name,
        avatar: chat.avatar,
        subtitle: `${chat.participants.length} members`,
      };
    } else {
      const otherParticipant = chat.participants.find((p: string) => p !== 'current-user');
      const userInfo = getUserInfo(otherParticipant);
      return {
        name: userInfo.displayName,
        avatar: userInfo.avatar,
        subtitle: 'Online',
      };
    }
  };

  const handleChatPress = (chatId: string) => {
    analyticsManager.trackUserAction('open_chat', 'chat_item', {
      chatId,
      source: 'chats_list',
    });
    
    router.push(`/chat/${chatId}`);
  };

  const handleNewChat = () => {
    analyticsManager.trackUserAction('new_chat', 'fab_button');
    setShowNewChat(true);
  };

  const handleStartChat = (userId: string) => {
    analyticsManager.trackUserAction('start_new_chat', 'user_selection', {
      targetUserId: userId,
    });
    
    // In a real app, you would create a new chat here
    setShowNewChat(false);
    router.push(`/chat/new-${userId}`);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.centerContainer, { padding: 20 }]}>
          <Icon name="chatbubbles" size={64} color={colors.textSecondary} />
          <Text style={[commonStyles.title, { marginTop: 16, textAlign: 'center' }]}>
            Welcome to Source Call
          </Text>
          <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 8 }]}>
            Sign in to start messaging with AI-powered features
          </Text>
          <TouchableOpacity
            style={[commonStyles.button, { marginTop: 24, backgroundColor: colors.primary }]}
            onPress={() => {
              analyticsManager.trackUserAction('sign_in_prompt', 'chats_screen');
              router.push('/auth/signin');
            }}
          >
            <Text style={[commonStyles.buttonText, { color: colors.background }]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={[commonStyles.row, { paddingHorizontal: 20, paddingVertical: 16 }]}>
        <View style={{ flex: 1 }}>
          <Text style={commonStyles.title}>Chats</Text>
          <Text style={commonStyles.textSecondary}>
            {chats.length} conversation{chats.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            analyticsManager.trackUserAction('search', 'header_button');
            // Implement search functionality
          }}
          style={{
            padding: 8,
            borderRadius: 8,
            backgroundColor: colors.card,
          }}
        >
          <Icon name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {loading ? (
          <View style={[commonStyles.centerContainer, { padding: 40 }]}>
            <Text style={commonStyles.textSecondary}>Loading chats...</Text>
          </View>
        ) : chats.length === 0 ? (
          <View style={[commonStyles.centerContainer, { padding: 40 }]}>
            <Icon name="chatbubbles-outline" size={48} color={colors.textSecondary} />
            <Text style={[commonStyles.text, { marginTop: 16, textAlign: 'center' }]}>
              No chats yet
            </Text>
            <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 8 }]}>
              Start a conversation to see it here
            </Text>
          </View>
        ) : (
          chats.map((chat) => {
            const displayInfo = getChatDisplayInfo(chat);
            const lastMessage = chat.lastMessage;
            
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
                onPress={() => handleChatPress(chat.id)}
              >
                {/* Avatar */}
                <View style={{ position: 'relative' }}>
                  {displayInfo.avatar ? (
                    <Image
                      source={{ uri: displayInfo.avatar }}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: colors.card,
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: colors.primary,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={[commonStyles.text, { color: colors.background, fontWeight: '600' }]}>
                        {displayInfo.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  
                  {/* Online indicator */}
                  {chat.type === 'direct' && (
                    <View
                      style={{
                        position: 'absolute',
                        bottom: 2,
                        right: 2,
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: colors.success,
                        borderWidth: 2,
                        borderColor: colors.background,
                      }}
                    />
                  )}
                </View>

                {/* Chat Info */}
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <View style={[commonStyles.row, { marginBottom: 4 }]}>
                    <Text style={[commonStyles.text, { fontWeight: '600', flex: 1 }]}>
                      {displayInfo.name}
                    </Text>
                    {lastMessage && (
                      <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                        {formatTime(new Date(lastMessage.createdAt))}
                      </Text>
                    )}
                  </View>
                  
                  <View style={[commonStyles.row, { alignItems: 'center' }]}>
                    <Text
                      style={[
                        commonStyles.textSecondary,
                        { flex: 1, fontSize: 14 },
                        chat.unreadCount > 0 && { fontWeight: '500', color: colors.text }
                      ]}
                      numberOfLines={1}
                    >
                      {lastMessage ? lastMessage.content : displayInfo.subtitle}
                    </Text>
                    
                    {chat.unreadCount > 0 && (
                      <View
                        style={{
                          backgroundColor: colors.primary,
                          borderRadius: 10,
                          minWidth: 20,
                          height: 20,
                          justifyContent: 'center',
                          alignItems: 'center',
                          paddingHorizontal: 6,
                        }}
                      >
                        <Text style={[commonStyles.text, { color: colors.background, fontSize: 12, fontWeight: '600' }]}>
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 8,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
        onPress={handleNewChat}
      >
        <Icon name="add" size={28} color={colors.background} />
      </TouchableOpacity>

      {/* New Chat Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={showNewChat}
        onClose={() => setShowNewChat(false)}
      >
        <View style={{ padding: 20 }}>
          <Text style={[commonStyles.subtitle, { marginBottom: 20 }]}>
            Start New Chat
          </Text>
          
          <ScrollView style={{ maxHeight: 300 }}>
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
                onPress={() => handleStartChat(user.id)}
              >
                {user.avatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: colors.card,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: colors.primary,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={[commonStyles.text, { color: colors.background, fontWeight: '600' }]}>
                      {user.displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                
                <View style={{ marginLeft: 16, flex: 1 }}>
                  <Text style={[commonStyles.text, { fontWeight: '500' }]}>
                    {user.displayName}
                  </Text>
                  <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                    {user.email}
                  </Text>
                </View>
                
                <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}
