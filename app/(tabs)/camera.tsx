
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors } from '../../styles/commonStyles';
import Icon from '../../components/Icon';

const { width, height } = Dimensions.get('window');

const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [isRecording, setIsRecording] = useState(false);
  const [showAIDisabledMessage, setShowAIDisabledMessage] = useState(true);
  
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    // Show AI disabled message for a few seconds
    const timer = setTimeout(() => {
      setShowAIDisabledMessage(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      console.log('Taking picture (AI analysis disabled)...');
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        exif: true
      });

      // Save to media library
      await MediaLibrary.saveToLibraryAsync(photo.uri);

      Alert.alert(
        'Photo Saved', 
        'Photo saved to gallery. AI analysis features are currently disabled.',
        [
          { text: 'OK' },
          { 
            text: 'Why Disabled?', 
            onPress: () => showAIDisabledInfo()
          }
        ]
      );
    } catch (err: any) {
      console.log('Error taking picture:', err);
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;

    try {
      console.log('Starting video recording (AI analysis disabled)...');
      setIsRecording(true);
      
      const video = await cameraRef.current.recordAsync({
        quality: Camera.Constants.VideoQuality['720p'],
        maxDuration: 60, // Max 60 seconds
        mute: false
      });

      setIsRecording(false);
      
      // Save to media library
      await MediaLibrary.saveToLibraryAsync(video.uri);
      
      Alert.alert('Video Saved', 'Video recorded and saved to gallery. AI analysis features are disabled.');
    } catch (err: any) {
      console.log('Error recording video:', err);
      setIsRecording(false);
      Alert.alert('Error', 'Failed to record video');
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  const showAIDisabledInfo = () => {
    Alert.alert(
      'AI Features Disabled',
      'AI camera analysis has been disabled to improve:\n\n' +
      '• App performance and battery life\n' +
      '• Startup speed and memory usage\n' +
      '• User privacy and data security\n' +
      '• Overall app stability\n\n' +
      'The camera still works normally for photos and videos.',
      [{ text: 'Understood' }]
    );
  };

  if (hasPermission === null) {
    return (
      <View style={[commonStyles.container, commonStyles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={commonStyles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[commonStyles.container, commonStyles.centered]}>
        <Icon name="camera-off" size={64} color={colors.textSecondary} />
        <Text style={commonStyles.text}>No access to camera</Text>
        <Text style={commonStyles.textSecondary}>
          Please grant camera permissions to use this feature
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      {/* Camera View */}
      <Camera
        ref={cameraRef}
        style={{ flex: 1 }}
        type={type}
        ratio="16:9"
      >
        {/* AI Disabled Message */}
        {showAIDisabledMessage && (
          <View style={{
            position: 'absolute',
            top: 20,
            left: 20,
            right: 20,
            backgroundColor: 'rgba(255, 193, 7, 0.9)',
            padding: 12,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <Icon name="alert-triangle" size={20} color="white" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                AI Analysis Disabled
              </Text>
              <Text style={{ color: 'white', fontSize: 12 }}>
                Camera works normally, but AI features are turned off
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowAIDisabledMessage(false)}>
              <Icon name="x" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* Top Controls */}
        <View style={{
          position: 'absolute',
          top: showAIDisabledMessage ? 100 : 20,
          left: 20,
          right: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Camera Status */}
          <View style={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: colors.success,
              marginRight: 6
            }} />
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
              Camera Ready
            </Text>
          </View>

          {/* Info Button */}
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(0,0,0,0.6)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center'
            }}
            onPress={showAIDisabledInfo}
          >
            <Icon name="info" size={16} color="white" />
            <Text style={{ 
              color: 'white', 
              fontSize: 12, 
              marginLeft: 4,
              fontWeight: '600'
            }}>
              Info
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View style={{
          position: 'absolute',
          bottom: 40,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          paddingHorizontal: 40
        }}>
          {/* Flip Camera */}
          <TouchableOpacity
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={() => {
              setType(
                type === CameraType.back ? CameraType.front : CameraType.back
              );
            }}
          >
            <Icon name="rotate-ccw" size={24} color="white" />
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'white',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 4,
              borderColor: 'transparent'
            }}
            onPress={takePicture}
          >
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: colors.primary
            }} />
          </TouchableOpacity>

          {/* Record Button */}
          <TouchableOpacity
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: isRecording ? colors.error : 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Icon 
              name={isRecording ? 'square' : 'video'} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>

        {/* Recording Indicator */}
        {isRecording && (
          <View style={{
            position: 'absolute',
            top: showAIDisabledMessage ? 100 : 20,
            left: '50%',
            marginLeft: -30,
            backgroundColor: colors.error,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: 'white',
              marginRight: 6
            }} />
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
              REC
            </Text>
          </View>
        )}

        {/* No AI Features Notice */}
        <View style={{
          position: 'absolute',
          bottom: 140,
          left: 20,
          right: 20,
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: 12,
          borderRadius: 8,
          alignItems: 'center'
        }}>
          <Text style={{ color: 'white', fontSize: 12, textAlign: 'center' }}>
            📸 Standard camera functionality available
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 11, textAlign: 'center', marginTop: 2 }}>
            AI features disabled for better performance
          </Text>
        </View>
      </Camera>
    </SafeAreaView>
  );
};

export default CameraScreen;
