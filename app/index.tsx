
import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles } from '../styles/commonStyles';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/auth/signin');
      }
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.content}>
          <Text style={commonStyles.title}>Loading...</Text>
          <Text style={commonStyles.text}>Initializing your messaging app</Text>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}
