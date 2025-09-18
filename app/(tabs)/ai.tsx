
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { useAI } from '../../hooks/useAI';
import Icon from '../../components/Icon';
import SimpleBottomSheet from '../../components/BottomSheet';

export default function AIScreen() {
  const {
    isInitialized,
    isLoading,
    error,
    detections,
    analyzeFrame,
    detectFaces,
    detectHands,
    detectGestures,
    clearDetections,
  } = useAI();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        console.log('Image selected:', result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    if (!isInitialized) {
      Alert.alert('Error', 'AI models are not ready yet');
      return;
    }

    try {
      setAnalyzing(true);
      console.log('Analyzing image with AI...');
      
      const result = await analyzeFrame(selectedImage);
      console.log('Analysis complete:', result);
      
      setShowResults(true);
      Alert.alert(
        'Analysis Complete!',
        `Found ${result.detectedObjects.length} objects with ${Math.round(result.confidence * 100)}% confidence`
      );
    } catch (err) {
      console.log('Error analyzing image:', err);
      Alert.alert('Error', 'Failed to analyze image');
    } finally {
      setAnalyzing(false);
    }
  };

  const runFaceDetection = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    try {
      setAnalyzing(true);
      const faces = await detectFaces(selectedImage);
      Alert.alert(
        'Face Detection',
        `Detected ${faces.length} face(s). ${faces[0]?.emotions.map(e => `${e.emotion}: ${Math.round(e.confidence * 100)}%`).join(', ')}`
      );
    } catch (err) {
      Alert.alert('Error', 'Face detection failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const runHandDetection = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    try {
      setAnalyzing(true);
      const hands = await detectHands(selectedImage);
      Alert.alert(
        'Hand Detection',
        `Detected ${hands.length} hand(s). Gestures: ${hands[0]?.gestures.map(g => g.type).join(', ')}`
      );
    } catch (err) {
      Alert.alert('Error', 'Hand detection failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const runGestureDetection = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    try {
      setAnalyzing(true);
      const gestures = await detectGestures(selectedImage);
      Alert.alert(
        'Gesture Detection',
        `Detected gestures: ${gestures.map(g => `${g.type} (${Math.round(g.confidence * 100)}%)`).join(', ')}`
      );
    } catch (err) {
      Alert.alert('Error', 'Gesture detection failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <Text style={commonStyles.title}>AI Detection Tools</Text>
        <Text style={commonStyles.textSecondary}>
          Advanced computer vision and machine learning capabilities
        </Text>

        {/* AI Status */}
        <View style={[commonStyles.card, { marginTop: 20 }]}>
          <View style={[commonStyles.row, { marginBottom: 12 }]}>
            <Icon
              name={isInitialized ? 'checkmark-circle' : 'time'}
              size={24}
              color={isInitialized ? colors.success : colors.warning}
            />
            <Text style={[commonStyles.text, { marginLeft: 12 }]}>
              AI Models Status
            </Text>
          </View>
          <Text style={commonStyles.textSecondary}>
            {isLoading
              ? 'Loading AI models...'
              : isInitialized
              ? 'All models ready for inference'
              : error || 'Models not initialized'}
          </Text>
        </View>

        {/* Image Selection */}
        <View style={[commonStyles.card, { marginTop: 16 }]}>
          <Text style={[commonStyles.text, { marginBottom: 16, fontWeight: '600' }]}>
            Select Image for Analysis
          </Text>
          
          {selectedImage ? (
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Image
                source={{ uri: selectedImage }}
                style={{
                  width: 200,
                  height: 150,
                  borderRadius: 12,
                  backgroundColor: colors.backgroundAlt,
                }}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View
              style={{
                height: 150,
                backgroundColor: colors.backgroundAlt,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                borderWidth: 2,
                borderColor: colors.border,
                borderStyle: 'dashed',
              }}
            >
              <Icon name="image" size={40} color={colors.textSecondary} />
              <Text style={[commonStyles.textSecondary, { marginTop: 8 }]}>
                No image selected
              </Text>
            </View>
          )}

          <TouchableOpacity style={buttonStyles.secondary} onPress={pickImage}>
            <Text style={buttonStyles.textSecondary}>
              {selectedImage ? 'Change Image' : 'Select Image'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI Tools */}
        <View style={[commonStyles.card, { marginTop: 16 }]}>
          <Text style={[commonStyles.text, { marginBottom: 16, fontWeight: '600' }]}>
            AI Detection Tools
          </Text>

          <TouchableOpacity
            style={[buttonStyles.primary, { marginBottom: 12 }]}
            onPress={analyzeImage}
            disabled={!selectedImage || !isInitialized || analyzing}
          >
            <Text style={buttonStyles.text}>
              {analyzing ? 'Analyzing...' : '🧠 Full AI Analysis'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.secondary, { marginBottom: 12 }]}
            onPress={runFaceDetection}
            disabled={!selectedImage || !isInitialized || analyzing}
          >
            <Text style={buttonStyles.textSecondary}>
              😊 Face Detection
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.secondary, { marginBottom: 12 }]}
            onPress={runHandDetection}
            disabled={!selectedImage || !isInitialized || analyzing}
          >
            <Text style={buttonStyles.textSecondary}>
              ✋ Hand Detection
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.secondary, { marginBottom: 12 }]}
            onPress={runGestureDetection}
            disabled={!selectedImage || !isInitialized || analyzing}
          >
            <Text style={buttonStyles.textSecondary}>
              👆 Gesture Recognition
            </Text>
          </TouchableOpacity>
        </View>

        {/* Detection History */}
        {detections.length > 0 && (
          <View style={[commonStyles.card, { marginTop: 16 }]}>
            <View style={[commonStyles.row, { marginBottom: 16 }]}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                Detection History ({detections.length})
              </Text>
              <TouchableOpacity onPress={() => setShowResults(true)}>
                <Text style={[commonStyles.text, { color: colors.primary }]}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={buttonStyles.secondary}
              onPress={clearDetections}
            >
              <Text style={buttonStyles.textSecondary}>Clear History</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* AI Capabilities Info */}
        <View style={[commonStyles.card, { marginTop: 16 }]}>
          <Text style={[commonStyles.text, { marginBottom: 16, fontWeight: '600' }]}>
            AI Capabilities
          </Text>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={[commonStyles.text, { fontSize: 14, fontWeight: '500' }]}>
              • Face Detection & Emotion Analysis
            </Text>
            <Text style={commonStyles.textSecondary}>
              Detect faces and analyze emotions in real-time
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={[commonStyles.text, { fontSize: 14, fontWeight: '500' }]}>
              • Hand & Gesture Recognition
            </Text>
            <Text style={commonStyles.textSecondary}>
              Track hand movements and recognize gestures
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={[commonStyles.text, { fontSize: 14, fontWeight: '500' }]}>
              • Object Detection
            </Text>
            <Text style={commonStyles.textSecondary}>
              Identify and classify objects in images
            </Text>
          </View>

          <View>
            <Text style={[commonStyles.text, { fontSize: 14, fontWeight: '500' }]}>
              • Touchless Annotation Control
            </Text>
            <Text style={commonStyles.textSecondary}>
              Control annotations using hand gestures
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Results Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={showResults}
        onClose={() => setShowResults(false)}
      >
        <View style={{ padding: 20 }}>
          <Text style={[commonStyles.subtitle, { marginBottom: 20 }]}>
            AI Detection Results
          </Text>

          {detections.length === 0 ? (
            <Text style={commonStyles.textSecondary}>
              No detections yet. Analyze an image to see results.
            </Text>
          ) : (
            <ScrollView style={{ maxHeight: 400 }}>
              {detections.map((detection, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: colors.backgroundAlt,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
                    Detection #{index + 1}
                  </Text>
                  
                  <Text style={commonStyles.textSecondary}>
                    Model: {detection.modelUsed}
                  </Text>
                  <Text style={commonStyles.textSecondary}>
                    Confidence: {Math.round(detection.confidence * 100)}%
                  </Text>
                  <Text style={commonStyles.textSecondary}>
                    Objects: {detection.detectedObjects.length}
                  </Text>
                  
                  {detection.faceData && (
                    <Text style={commonStyles.textSecondary}>
                      Emotions: {detection.faceData.emotions.map(e => e.emotion).join(', ')}
                    </Text>
                  )}
                  
                  {detection.gestureData && (
                    <Text style={commonStyles.textSecondary}>
                      Gesture: {detection.gestureData.type}
                    </Text>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}
