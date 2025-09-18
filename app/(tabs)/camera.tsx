
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
import { useAI } from '../../hooks/useAI';
import { useAIOrchestration } from '../../hooks/useAIOrchestration';

const { width, height } = Dimensions.get('window');

const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [realTimeAnalysis, setRealTimeAnalysis] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);
  const [analysisOverlay, setAnalysisOverlay] = useState<any[]>([]);
  
  const cameraRef = useRef<Camera>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isInitialized,
    analyzeFrame,
    detectFaces,
    detectHands,
    detectObjects,
    detectPose
  } = useAI();

  const {
    routeRequest,
    activeModels
  } = useAIOrchestration();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (realTimeAnalysis && isInitialized) {
      startRealTimeAnalysis();
    } else {
      stopRealTimeAnalysis();
    }

    return () => {
      stopRealTimeAnalysis();
    };
  }, [realTimeAnalysis, isInitialized]);

  const startRealTimeAnalysis = () => {
    if (analysisIntervalRef.current) return;

    console.log('Starting real-time AI analysis...');
    analysisIntervalRef.current = setInterval(async () => {
      if (cameraRef.current && !isAnalyzing) {
        try {
          setIsAnalyzing(true);
          
          // Take a photo for analysis
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.3, // Lower quality for faster processing
            base64: false,
            skipProcessing: true
          });

          // Route to best available vision model
          const visionModel = routeRequest('real_time_analysis', {
            category: 'vision',
            latency: 200, // Max 200ms for real-time
            priority: 'high'
          });

          if (visionModel) {
            console.log(`Using ${visionModel.name} for real-time analysis`);
            
            // Run lightweight analysis
            const [faces, hands, objects] = await Promise.all([
              detectFaces(photo.uri).catch(() => []),
              detectHands(photo.uri).catch(() => []),
              detectObjects(photo.uri).catch(() => [])
            ]);

            const analysis = {
              faces,
              hands,
              objects,
              timestamp: new Date(),
              modelUsed: visionModel.name
            };

            setLastAnalysis(analysis);
            updateAnalysisOverlay(analysis);
          }
        } catch (err) {
          console.log('Real-time analysis error:', err);
        } finally {
          setIsAnalyzing(false);
        }
      }
    }, 1000); // Analyze every second
  };

  const stopRealTimeAnalysis = () => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
      console.log('Stopped real-time AI analysis');
    }
  };

  const updateAnalysisOverlay = (analysis: any) => {
    const overlays: any[] = [];

    // Add face detection overlays
    if (analysis.faces && analysis.faces.length > 0) {
      analysis.faces.forEach((face: any, index: number) => {
        overlays.push({
          type: 'face',
          id: `face_${index}`,
          data: face,
          color: '#3498db'
        });
      });
    }

    // Add hand detection overlays
    if (analysis.hands && analysis.hands.length > 0) {
      analysis.hands.forEach((hand: any, index: number) => {
        overlays.push({
          type: 'hand',
          id: `hand_${index}`,
          data: hand,
          color: '#2ecc71'
        });
      });
    }

    // Add object detection overlays
    if (analysis.objects && analysis.objects.length > 0) {
      analysis.objects.forEach((obj: any, index: number) => {
        overlays.push({
          type: 'object',
          id: `object_${index}`,
          data: obj,
          color: '#e74c3c'
        });
      });
    }

    setAnalysisOverlay(overlays);
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      console.log('Taking picture with AI analysis...');
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        exif: true
      });

      // Save to media library
      await MediaLibrary.saveToLibraryAsync(photo.uri);

      // Perform comprehensive AI analysis
      if (isInitialized) {
        setIsAnalyzing(true);
        
        try {
          const analysis = await analyzeFrame(photo.uri);
          
          Alert.alert(
            'Photo Captured & Analyzed',
            `Detected ${analysis.detectedObjects?.length || 0} objects, ` +
            `${analysis.faceData ? '1 face, ' : ''}` +
            `${analysis.handData ? '1 hand' : ''}`,
            [
              { text: 'OK' },
              { 
                text: 'View Details', 
                onPress: () => showAnalysisDetails(analysis) 
              }
            ]
          );
        } catch (err: any) {
          Alert.alert('Analysis Failed', err.message);
        } finally {
          setIsAnalyzing(false);
        }
      } else {
        Alert.alert('Photo Saved', 'Photo saved to gallery. AI analysis unavailable.');
      }
    } catch (err: any) {
      console.log('Error taking picture:', err);
      Alert.alert('Error', 'Failed to take picture');
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
      await MediaLibrary.saveToLibraryAsync(video.uri);
      
      Alert.alert('Video Saved', 'Video recorded and saved to gallery');
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

  const showAnalysisDetails = (analysis: any) => {
    let details = `Model: ${analysis.modelUsed}\n`;
    details += `Confidence: ${(analysis.confidence * 100).toFixed(1)}%\n`;
    details += `Processing Time: ${analysis.processingTime}ms\n\n`;

    if (analysis.detectedObjects && analysis.detectedObjects.length > 0) {
      details += 'Objects:\n';
      analysis.detectedObjects.forEach((obj: any) => {
        details += `• ${obj.label} (${(obj.confidence * 100).toFixed(1)}%)\n`;
      });
      details += '\n';
    }

    if (analysis.faceData) {
      details += 'Face Analysis:\n';
      details += `• Landmarks: ${analysis.faceData.landmarks?.length || 0}\n`;
      if (analysis.faceData.emotions && analysis.faceData.emotions.length > 0) {
        details += `• Emotion: ${analysis.faceData.emotions[0].emotion} (${(analysis.faceData.emotions[0].confidence * 100).toFixed(1)}%)\n`;
      }
      details += '\n';
    }

    if (analysis.handData) {
      details += 'Hand Analysis:\n';
      details += `• Handedness: ${analysis.handData.handedness}\n`;
      details += `• Landmarks: ${analysis.handData.landmarks?.length || 0}\n`;
      if (analysis.handData.gestures && analysis.handData.gestures.length > 0) {
        details += `• Gesture: ${analysis.handData.gestures[0].type}\n`;
      }
    }

    Alert.alert('Analysis Details', details);
  };

  const renderAnalysisOverlay = () => {
    if (!realTimeAnalysis || analysisOverlay.length === 0) return null;

    return (
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none'
      }}>
        {analysisOverlay.map((overlay) => (
          <View
            key={overlay.id}
            style={{
              position: 'absolute',
              borderWidth: 2,
              borderColor: overlay.color,
              borderRadius: 4,
              // Position would be calculated based on detection coordinates
              // This is a simplified example
              top: '20%',
              left: '20%',
              width: 100,
              height: 100,
            }}
          >
            <View style={{
              backgroundColor: overlay.color,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 2,
              position: 'absolute',
              top: -20,
              left: 0,
            }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>
                {overlay.type}
              </Text>
            </View>
          </View>
        ))}
      </View>
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
        {/* Analysis Overlay */}
        {renderAnalysisOverlay()}

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
          {/* AI Status */}
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
              backgroundColor: isInitialized ? colors.success : colors.warning,
              marginRight: 6
            }} />
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
              AI {isInitialized ? 'Ready' : 'Loading'}
            </Text>
            {realTimeAnalysis && (
              <>
                <Text style={{ color: 'white', fontSize: 12, marginLeft: 6 }}>•</Text>
                <Text style={{ color: 'white', fontSize: 12, marginLeft: 6 }}>
                  Live Analysis
                </Text>
              </>
            )}
          </View>

          {/* Real-time Analysis Toggle */}
          <TouchableOpacity
            style={{
              backgroundColor: realTimeAnalysis ? colors.primary : 'rgba(0,0,0,0.6)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center'
            }}
            onPress={() => setRealTimeAnalysis(!realTimeAnalysis)}
            disabled={!isInitialized}
          >
            <Icon 
              name="zap" 
              size={16} 
              color={realTimeAnalysis ? 'white' : colors.textSecondary} 
            />
            <Text style={{ 
              color: realTimeAnalysis ? 'white' : colors.textSecondary, 
              fontSize: 12, 
              marginLeft: 4,
              fontWeight: '600'
            }}>
              AI
            </Text>
          </TouchableOpacity>
        </View>

        {/* Analysis Info */}
        {lastAnalysis && realTimeAnalysis && (
          <View style={{
            position: 'absolute',
            top: 80,
            left: 20,
            right: 20,
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: 12,
            borderRadius: 8
          }}>
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
              Live Analysis Results
            </Text>
            <Text style={{ color: 'white', fontSize: 11 }}>
              Objects: {lastAnalysis.objects?.length || 0} • 
              Faces: {lastAnalysis.faces?.length || 0} • 
              Hands: {lastAnalysis.hands?.length || 0}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 2 }}>
              Model: {lastAnalysis.modelUsed}
            </Text>
          </View>
        )}

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
              borderColor: isAnalyzing ? colors.primary : 'transparent'
            }}
            onPress={takePicture}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: colors.primary
              }} />
            )}
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
            top: 20,
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
      </Camera>
    </SafeAreaView>
  );
};

export default CameraScreen;
