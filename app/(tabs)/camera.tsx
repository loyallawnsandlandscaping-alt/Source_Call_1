
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { commonStyles, colors } from '../../styles/commonStyles';
import { useAI } from '../../hooks/useAI';
import Icon from '../../components/Icon';

const { width, height } = Dimensions.get('window');

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const { analyzeFrame, isInitialized } = useAI();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === 'granted' && mediaLibraryStatus.status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        console.log('Taking picture...');
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        // Save to media library
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        
        // Analyze with AI
        if (isInitialized) {
          setIsAnalyzing(true);
          try {
            const aiData = await analyzeFrame(photo.uri);
            console.log('AI Analysis:', aiData);
            Alert.alert(
              'AI Analysis Complete',
              `Detected ${aiData.detectedObjects.length} objects with ${Math.round(aiData.confidence * 100)}% confidence`
            );
          } catch (error) {
            console.log('AI analysis error:', error);
          } finally {
            setIsAnalyzing(false);
          }
        }
        
        Alert.alert('Success', 'Photo saved and analyzed!');
      } catch (error) {
        console.log('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        console.log('Starting video recording...');
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync({
          quality: Camera.Constants.VideoQuality['720p'],
          maxDuration: 60,
        });
        
        await MediaLibrary.saveToLibraryAsync(video.uri);
        Alert.alert('Success', 'Video saved!');
      } catch (error) {
        console.log('Error recording video:', error);
        Alert.alert('Error', 'Failed to record video');
      } finally {
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      console.log('Stopping video recording...');
      cameraRef.current.stopRecording();
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.content}>
          <Text style={commonStyles.text}>Requesting camera permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.content}>
          <Icon name="camera-off" size={80} color={colors.textSecondary} />
          <Text style={[commonStyles.title, { marginTop: 20 }]}>
            Camera Access Required
          </Text>
          <Text style={commonStyles.text}>
            Please enable camera permissions in your device settings to use this feature.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={{ flex: 1 }}>
        <Camera
          ref={cameraRef}
          style={{ flex: 1 }}
          type={type}
          ratio="16:9"
        >
          {/* AI Status Indicator */}
          {isAnalyzing && (
            <View
              style={{
                position: 'absolute',
                top: 50,
                left: 20,
                right: 20,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderRadius: 8,
                padding: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: colors.background, fontSize: 14 }}>
                🧠 AI Analyzing Frame...
              </Text>
            </View>
          )}

          {/* Recording Indicator */}
          {isRecording && (
            <View
              style={{
                position: 'absolute',
                top: 50,
                right: 20,
                backgroundColor: colors.error,
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.background,
                  marginRight: 6,
                }}
              />
              <Text style={{ color: colors.background, fontSize: 12, fontWeight: '600' }}>
                REC
              </Text>
            </View>
          )}

          {/* Controls */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              paddingVertical: 30,
              paddingHorizontal: 20,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {/* Flip Camera */}
              <TouchableOpacity
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 30,
                  width: 60,
                  height: 60,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  setType(
                    type === CameraType.back ? CameraType.front : CameraType.back
                  );
                }}
              >
                <Icon name="camera-reverse" size={24} color={colors.background} />
              </TouchableOpacity>

              {/* Capture Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 40,
                  width: 80,
                  height: 80,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 4,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
                onPress={takePicture}
                disabled={isAnalyzing}
              >
                <Icon name="camera" size={32} color={colors.text} />
              </TouchableOpacity>

              {/* Video Record */}
              <TouchableOpacity
                style={{
                  backgroundColor: isRecording ? colors.error : 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 30,
                  width: 60,
                  height: 60,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <Icon
                  name={isRecording ? 'stop' : 'videocam'}
                  size={24}
                  color={colors.background}
                />
              </TouchableOpacity>
            </View>

            {/* AI Status */}
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <Text
                style={{
                  color: colors.background,
                  fontSize: 12,
                  opacity: 0.8,
                }}
              >
                {isInitialized ? '🧠 AI Ready' : '⏳ Loading AI Models...'}
              </Text>
            </View>
          </View>
        </Camera>
      </View>
    </SafeAreaView>
  );
}
