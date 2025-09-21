
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/Icon';

export default function SignInScreen() {
  const [email, setEmail] = useState('demo@sourcecall.com');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isLoading, signInWithBiometrics } = useAuth();

  console.log('SignInScreen rendered');

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const result = await signIn(email, password);
    if (result.success) {
      router.replace('/');
    } else {
      Alert.alert('Error', result.error || 'Sign in failed');
    }
  };

  const handleBiometricAuth = async () => {
    const result = await signInWithBiometrics();
    if (result.success) {
      router.replace('/');
    } else {
      Alert.alert('Error', result.error || 'Biometric authentication failed');
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={commonStyles.content}>
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
              <Icon name="chatbubbles" size={80} color={colors.primary} />
              <Text style={commonStyles.title}>Welcome Back</Text>
              <Text style={commonStyles.text}>Sign in to continue messaging</Text>
            </View>

            <View style={{ width: '100%', maxWidth: 400 }}>
              <TextInput
                style={commonStyles.input}
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={{ position: 'relative' }}>
                <TextInput
                  style={commonStyles.input}
                  placeholder="Password"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: 20,
                  }}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[buttonStyles.primary, { marginTop: 20 }]}
                onPress={handleSignIn}
                disabled={isLoading}
              >
                <Text style={buttonStyles.text}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[buttonStyles.secondary, { marginTop: 12 }]}
                onPress={handleBiometricAuth}
              >
                <View style={commonStyles.centerRow}>
                  <Icon name="finger-print" size={20} color={colors.text} />
                  <Text style={[buttonStyles.textSecondary, { marginLeft: 8 }]}>
                    Use Biometrics
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Demo Info */}
              <View style={{
                backgroundColor: colors.cardBackground,
                padding: 16,
                borderRadius: 12,
                marginTop: 20,
                borderWidth: 1,
                borderColor: colors.border,
              }}>
                <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
                  Demo Login
                </Text>
                <Text style={[commonStyles.textSecondary, { fontSize: 14 }]}>
                  Email: demo@sourcecall.com{'\n'}
                  Password: demo123
                </Text>
              </View>

              <View style={[commonStyles.centerRow, { marginTop: 30 }]}>
                <Text style={commonStyles.textSecondary}>Don&apos;t have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                  <Text style={[commonStyles.text, { color: colors.primary, fontWeight: '600' }]}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
