
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../../styles/commonStyles';
import Icon from '../../components/Icon';

const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      setIsLoading(true);
      console.log('Taking picture...');
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        exif: true
      });

      // Save to media library
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        Alert.alert('Success', 'Photo saved to gallery!');
      }
    } catch (err: any) {
      console.log('Error taking picture:', err);
      Alert.alert('Error', 'Failed to take picture');
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;

    try {
      console.log('Starting video recording...');
      setIsRecording(true);
      
      const video = await cameraRef.current.recordAsync({
        quality: Camera.Constants.VideoQuality['720p'],
        maxDuration: 60, // Max 60 seconds
        mute: false
      });

      setIsRecording(false);
      
      // Save to media library
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(video.uri);
        Alert.alert('Success', 'Video saved to gallery!');
      }
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

  if (hasPermission === null) {
    return (
      <SafeAreaView style={[commonStyles.safeArea, commonStyles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.text, { marginTop: 16 }]}>
          Requesting camera permission...
        </Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={[commonStyles.safeArea, commonStyles.centered]}>
        <Icon name="camera-off" size={80} color={colors.textSecondary} />
        <Text style={[commonStyles.title, { marginTop: 20, color: colors.textSecondary }]}>
          No Camera Access
        </Text>
        <Text style={[commonStyles.text, { textAlign: 'center', marginTop: 8 }]}>
          Please grant camera permission in your device settings
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <Camera
        ref={cameraRef}
        style={{ flex: 1 }}
        type={type}
        ratio="16:9"
      >
        {/* Top Controls */}
        <View style={{
          position: 'absolute',
          top: 20,
          left: 20,
          right: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Video Call Button */}
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(0,0,0,0.6)',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center'
            }}
            onPress={() => router.push('/call/room')}
          >
            <Icon name="videocam" size={16} color="white" />
            <Text style={{ 
              color: 'white', 
              fontSize: 12, 
              marginLeft: 6,
              fontWeight: '600'
            }}>
              Video Call
            </Text>
          </TouchableOpacity>

          {/* Flip Camera */}
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(0,0,0,0.6)',
              padding: 12,
              borderRadius: 25,
            }}
            onPress={() => {
              setType(
                type === CameraType.back ? CameraType.front : CameraType.back
              );
            }}
          >
            <Icon name="camera-reverse" size={20} color="white" />
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
          {/* Gallery */}
          <TouchableOpacity
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Icon name="images" size={24} color="white" />
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: isRecording ? colors.error : 'white',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 4,
              borderColor: 'rgba(255,255,255,0.3)'
            }}
            onPress={isRecording ? stopRecording : takePicture}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={isRecording ? 'white' : colors.primary} />
            ) : (
              <Icon 
                name={isRecording ? 'stop' : 'camera'} 
                size={32} 
                color={isRecording ? 'white' : colors.primary} 
              />
            )}
          </TouchableOpacity>

          {/* Video Record */}
          <TouchableOpacity
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: isRecording ? colors.error : 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={startRecording}
            disabled={isRecording || isLoading}
          >
            <Icon name="videocam" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Recording Indicator */}
        {isRecording && (
          <View style={{
            position: 'absolute',
            top: 80,
            left: 20,
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
              Recording
            </Text>
          </View>
        )}
      </Camera>
    </SafeAreaView>
  );
};

export default CameraScreen;
