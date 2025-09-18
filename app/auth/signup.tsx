
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

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, isLoading } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !displayName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    const result = await signUp(email, password, displayName);
    if (result.success) {
      Alert.alert(
        'Success',
        'Account created successfully! Please verify your email.',
        [{ text: 'OK', onPress: () => router.replace('/') }]
      );
    } else {
      Alert.alert('Error', result.error || 'Sign up failed');
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
              <Icon name="person-add" size={80} color={colors.primary} />
              <Text style={commonStyles.title}>Create Account</Text>
              <Text style={commonStyles.text}>Join the conversation</Text>
            </View>

            <View style={{ width: '100%', maxWidth: 400 }}>
              <TextInput
                style={commonStyles.input}
                placeholder="Display Name"
                placeholderTextColor={colors.textSecondary}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />

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

              <TextInput
                style={commonStyles.input}
                placeholder="Confirm Password"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={[buttonStyles.primary, { marginTop: 20 }]}
                onPress={handleSignUp}
                disabled={isLoading}
              >
                <Text style={buttonStyles.text}>
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </Text>
              </TouchableOpacity>

              <View style={[commonStyles.centerRow, { marginTop: 30 }]}>
                <Text style={commonStyles.textSecondary}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/auth/signin')}>
                  <Text style={[commonStyles.text, { color: colors.primary, fontWeight: '600' }]}>
                    Sign In
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
