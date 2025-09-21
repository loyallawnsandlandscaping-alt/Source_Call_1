
// AI functionality has been completely removed from this application
// This file should not exist - redirecting to main screen
import { Redirect } from 'expo-router';

export default function AIScreen() {
  console.log('AI tab accessed - redirecting to main chats');
  return <Redirect href="/(tabs)" />;
}
