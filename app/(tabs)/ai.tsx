
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import SimpleBottomSheet from '../../components/BottomSheet';
import AIModelCard from '../../components/AIModelCard';
import Icon from '../../components/Icon';
import { useAI } from '../../hooks/useAI';
import { useAIOrchestration } from '../../hooks/useAIOrchestration';

const AIScreen = () => {
  const {
    isInitialized,
    isLoading: aiLoading,
    error: aiError,
    detections,
    analyzeFrame,
    detectFaces,
    detectHands,
    detectPose,
    detectObjects,
    getModelInfo,
    clearDetections
  } = useAI();

  const {
    availableModels,
    activeModels,
    orchestrationConfig,
    benchmarks,
    updateInfo,
    isLoading: orchestrationLoading,
    error: orchestrationError,
    routeRequest,
    benchmarkModel,
    updateModel,
    getModelPerformance,
    optimizeOrchestration,
    getSystemStats
  } = useAIOrchestration();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'models' | 'stats'>('analysis');

  useEffect(() => {
    console.log('AI Screen loaded - AI functionality is disabled');
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      clearDetections();
      setAnalysisResults(null);
      console.log('AI screen refreshed - functionality remains disabled');
    } catch (err) {
      console.log('Error refreshing:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to use this feature.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setAnalysisResults(null);
      }
    } catch (err: any) {
      console.log('Error picking image:', err);
      Alert.alert('Error', `Failed to pick image: ${err.message}`);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first.');
      return;
    }

    try {
      console.log('Starting stubbed image analysis...');
      
      const results = await analyzeFrame(selectedImage);
      
      setAnalysisResults({
        ...results,
        timestamp: new Date(),
        note: 'AI analysis is currently disabled - this is a stub response'
      });

      Alert.alert(
        'Analysis Complete (Stubbed)', 
        'AI functionality is currently disabled. This is a demonstration of the interface only.',
        [
          { text: 'OK' },
          { 
            text: 'Learn More', 
            onPress: () => setShowInfo(true)
          }
        ]
      );
    } catch (err: any) {
      console.log('Error in stubbed analysis:', err);
      Alert.alert('Analysis Failed', 'Stubbed analysis encountered an error.');
    }
  };

  const runStubDetection = async (type: string) => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first.');
      return;
    }
    
    try {
      console.log(`Running stubbed ${type} detection...`);
      
      let result;
      switch (type) {
        case 'face':
          result = await detectFaces(selectedImage);
          Alert.alert('Face Detection (Stubbed)', `AI face detection is disabled. Found ${result.length} stub result(s).`);
          break;
        case 'hand':
          result = await detectHands(selectedImage);
          Alert.alert('Hand Detection (Stubbed)', `AI hand detection is disabled. Found ${result.length} stub result(s).`);
          break;
        case 'pose':
          result = await detectPose(selectedImage);
          Alert.alert('Pose Detection (Stubbed)', `AI pose detection is disabled. Found stub keypoints: ${result.keypoints.length}.`);
          break;
        case 'object':
          result = await detectObjects(selectedImage);
          Alert.alert('Object Detection (Stubbed)', `AI object detection is disabled. Found ${result.length} stub result(s).`);
          break;
      }
    } catch (err: any) {
      Alert.alert('Error', `Stubbed ${type} detection failed: ${err.message}`);
    }
  };

  const handleModelToggle = (modelId: string) => {
    console.log(`Model toggle stubbed: ${modelId}`);
    Alert.alert('Feature Disabled', 'AI model management is currently disabled.');
  };

  const handleModelBenchmark = async (modelId: string) => {
    try {
      console.log(`Benchmarking stubbed for model: ${modelId}`);
      await benchmarkModel(modelId);
      Alert.alert('Benchmark Complete (Stubbed)', `Model ${modelId} benchmark completed with stub results.`);
    } catch (err: any) {
      Alert.alert('Benchmark Failed', 'Stubbed benchmark encountered an error.');
    }
  };

  const handleModelUpdate = async (modelId: string) => {
    try {
      console.log(`Update stubbed for model: ${modelId}`);
      const success = await updateModel(modelId);
      if (success) {
        Alert.alert('Update Complete (Stubbed)', `Model ${modelId} update completed (stubbed).`);
      } else {
        Alert.alert('Update Failed', `Failed to update model ${modelId} (stubbed).`);
      }
    } catch (err: any) {
      Alert.alert('Update Error', `Stubbed update error: ${err.message}`);
    }
  };

  const renderAnalysisTab = () => (
    <ScrollView 
      style={commonStyles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* AI System Status */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>AI System Status</Text>
        <View style={[commonStyles.card, { backgroundColor: colors.warningLight }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Icon name="alert-triangle" size={20} color={colors.warning} />
            <Text style={[commonStyles.text, { marginLeft: 8, fontWeight: '600' }]}>
              AI Features Disabled
            </Text>
          </View>
          
          <Text style={commonStyles.textSecondary}>
            All AI functionality has been replaced with stub responses for demonstration purposes.
          </Text>
          
          <TouchableOpacity 
            style={[buttonStyles.secondary, { marginTop: 12 }]}
            onPress={() => setShowInfo(true)}
          >
            <Icon name="info" size={16} color={colors.primary} />
            <Text style={buttonStyles.secondaryText}>Learn More</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Image Analysis Demo */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Image Analysis Demo</Text>
        
        <TouchableOpacity style={buttonStyles.primary} onPress={pickImage}>
          <Icon name="image" size={20} color="white" />
          <Text style={buttonStyles.primaryText}>Select Image</Text>
        </TouchableOpacity>

        {selectedImage && (
          <View style={commonStyles.card}>
            <Image source={{ uri: selectedImage }} style={{ width: '100%', height: 200, borderRadius: 8 }} />
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              <TouchableOpacity 
                style={[buttonStyles.secondary, { flex: 1, minWidth: '45%' }]} 
                onPress={analyzeImage}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Icon name="zap" size={16} color={colors.primary} />
                    <Text style={buttonStyles.secondaryText}>Analyze (Demo)</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[buttonStyles.secondary, { flex: 1, minWidth: '45%' }]} 
                onPress={() => runStubDetection('face')}
              >
                <Icon name="user" size={16} color={colors.primary} />
                <Text style={buttonStyles.secondaryText}>Faces</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[buttonStyles.secondary, { flex: 1, minWidth: '45%' }]} 
                onPress={() => runStubDetection('hand')}
              >
                <Icon name="hand" size={16} color={colors.primary} />
                <Text style={buttonStyles.secondaryText}>Hands</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[buttonStyles.secondary, { flex: 1, minWidth: '45%' }]} 
                onPress={() => runStubDetection('pose')}
              >
                <Icon name="activity" size={16} color={colors.primary} />
                <Text style={buttonStyles.secondaryText}>Pose</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[buttonStyles.secondary, { flex: 1, minWidth: '45%' }]} 
                onPress={() => runStubDetection('object')}
              >
                <Icon name="eye" size={16} color={colors.primary} />
                <Text style={buttonStyles.secondaryText}>Objects</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Analysis Results */}
        {analysisResults && (
          <View style={commonStyles.card}>
            <Text style={commonStyles.cardTitle}>Demo Analysis Results</Text>
            
            <View style={[{ padding: 12, backgroundColor: colors.warningLight, borderRadius: 8, marginBottom: 12 }]}>
              <Text style={[commonStyles.textSecondary, { fontStyle: 'italic' }]}>
                ⚠️ This is a stub response - AI functionality is disabled
              </Text>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={commonStyles.textSecondary}>
                Model: {analysisResults.modelUsed}
              </Text>
              <Text style={commonStyles.textSecondary}>
                Processing Time: {analysisResults.processingTime}ms
              </Text>
              <Text style={commonStyles.textSecondary}>
                Confidence: {(analysisResults.confidence * 100).toFixed(1)}%
              </Text>
            </View>

            {analysisResults.detectedObjects && analysisResults.detectedObjects.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={commonStyles.text}>Detected Objects (Demo):</Text>
                {analysisResults.detectedObjects.map((obj: any, index: number) => (
                  <Text key={index} style={commonStyles.textSecondary}>
                    • {obj.label} ({(obj.confidence * 100).toFixed(1)}%)
                  </Text>
                ))}
              </View>
            )}

            {analysisResults.explainability && (
              <View style={{ marginBottom: 12 }}>
                <Text style={commonStyles.text}>Explanation:</Text>
                <Text style={commonStyles.textSecondary}>
                  {analysisResults.explainability.reasoning}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Recent Detections */}
      {detections.length > 0 && (
        <View style={commonStyles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={commonStyles.sectionTitle}>Recent Demo Results</Text>
            <TouchableOpacity onPress={clearDetections}>
              <Text style={[commonStyles.textSecondary, { fontSize: 14 }]}>Clear</Text>
            </TouchableOpacity>
          </View>
          
          {detections.slice(-3).map((detection, index) => (
            <View key={index} style={commonStyles.card}>
              <Text style={commonStyles.text}>Model: {detection.modelUsed}</Text>
              <Text style={commonStyles.textSecondary}>
                Confidence: {(detection.confidence * 100).toFixed(1)}%
              </Text>
              <Text style={commonStyles.textSecondary}>
                Objects: {detection.detectedObjects?.length || 0}
              </Text>
              <Text style={[commonStyles.textSecondary, { fontSize: 12, fontStyle: 'italic' }]}>
                (Stub response)
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderModelsTab = () => (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.section}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={commonStyles.sectionTitle}>AI Models (Demo)</Text>
          <TouchableOpacity 
            style={buttonStyles.secondary}
            onPress={optimizeOrchestration}
            disabled={orchestrationLoading}
          >
            {orchestrationLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Icon name="zap" size={16} color={colors.primary} />
                <Text style={buttonStyles.secondaryText}>Optimize</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={[commonStyles.card, { backgroundColor: colors.warningLight, marginBottom: 16 }]}>
          <Text style={[commonStyles.text, { color: colors.warning, fontWeight: '600' }]}>
            AI Models Disabled
          </Text>
          <Text style={commonStyles.textSecondary}>
            All AI models have been replaced with stub implementations. No actual AI processing occurs.
          </Text>
        </View>

        {availableModels.map((model) => {
          const performance = getModelPerformance(model.id);
          const hasUpdate = updateInfo.some(u => u.modelId === model.id);
          const benchmark = benchmarks.find(b => b.modelId === model.id);
          
          return (
            <AIModelCard
              key={model.id}
              model={model}
              benchmark={benchmark}
              isActive={false} // No models are actually active
              onToggle={handleModelToggle}
              onBenchmark={handleModelBenchmark}
              onUpdate={hasUpdate ? handleModelUpdate : undefined}
              hasUpdate={hasUpdate}
            />
          );
        })}
      </View>
    </ScrollView>
  );

  const renderStatsTab = () => {
    const stats = getSystemStats();
    
    return (
      <ScrollView style={commonStyles.container}>
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>System Statistics (Demo)</Text>
          
          <View style={[commonStyles.card, { backgroundColor: colors.warningLight, marginBottom: 16 }]}>
            <Text style={[commonStyles.text, { color: colors.warning, fontWeight: '600' }]}>
              Statistics Disabled
            </Text>
            <Text style={commonStyles.textSecondary}>
              All statistics are stub values. No actual AI processing or metrics are collected.
            </Text>
          </View>
          
          <View style={commonStyles.card}>
            <Text style={commonStyles.cardTitle}>Overview</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={commonStyles.textSecondary}>Total Models</Text>
              <Text style={commonStyles.text}>{stats.totalModels} (stub)</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={commonStyles.textSecondary}>Active Models</Text>
              <Text style={commonStyles.text}>{stats.activeCount} (disabled)</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={commonStyles.textSecondary}>Platform</Text>
              <Text style={commonStyles.text}>{stats.platform}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={commonStyles.textSecondary}>Avg Accuracy</Text>
              <Text style={commonStyles.text}>{stats.avgAccuracy} (stub)</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={commonStyles.textSecondary}>Avg Latency</Text>
              <Text style={commonStyles.text}>{stats.avgLatency} (stub)</Text>
            </View>
          </View>

          <View style={commonStyles.card}>
            <Text style={commonStyles.cardTitle}>Models by Category</Text>
            {Object.entries(stats.categoryCounts).map(([category, count]) => (
              <View key={category} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={commonStyles.textSecondary}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
                <Text style={commonStyles.text}>{count} (stub)</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      {/* Header */}
      <View style={commonStyles.header}>
        <Text style={commonStyles.headerTitle}>AI Demo (Disabled)</Text>
        <TouchableOpacity onPress={() => setShowInfo(true)}>
          <Icon name="info" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={{ flexDirection: 'row', backgroundColor: colors.surface, paddingHorizontal: 16 }}>
        {[
          { key: 'analysis', label: 'Analysis', icon: 'zap' },
          { key: 'models', label: 'Models', icon: 'cpu' },
          { key: 'stats', label: 'Stats', icon: 'bar-chart-2' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: activeTab === tab.key ? colors.primary : 'transparent'
            }}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Icon 
              name={tab.icon} 
              size={20} 
              color={activeTab === tab.key ? colors.primary : colors.textSecondary} 
            />
            <Text 
              style={{
                fontSize: 12,
                marginTop: 4,
                color: activeTab === tab.key ? colors.primary : colors.textSecondary,
                fontWeight: activeTab === tab.key ? '600' : '400'
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'analysis' && renderAnalysisTab()}
      {activeTab === 'models' && renderModelsTab()}
      {activeTab === 'stats' && renderStatsTab()}

      {/* Info Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={showInfo}
        onClose={() => setShowInfo(false)}
      >
        <View style={{ padding: 20 }}>
          <Text style={commonStyles.cardTitle}>AI Features Disabled</Text>
          <Text style={[commonStyles.textSecondary, { marginBottom: 16 }]}>
            All AI functionality has been removed and replaced with stub implementations for the following reasons:
          </Text>
          
          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>Performance Issues:</Text>
            <Text style={commonStyles.textSecondary}>• Large bundle size (100MB+ for AI models)</Text>
            <Text style={commonStyles.textSecondary}>• Slow app startup and high memory usage</Text>
            <Text style={commonStyles.textSecondary}>• Battery drain from real-time processing</Text>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>User Experience:</Text>
            <Text style={commonStyles.textSecondary}>• Complex interface with too many options</Text>
            <Text style={commonStyles.textSecondary}>• Long loading times without proper feedback</Text>
            <Text style={commonStyles.textSecondary}>• No offline functionality</Text>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>Technical Concerns:</Text>
            <Text style={commonStyles.textSecondary}>• Platform compatibility issues</Text>
            <Text style={commonStyles.textSecondary}>• Memory leaks and UI blocking</Text>
            <Text style={commonStyles.textSecondary}>• Privacy and data collection concerns</Text>
          </View>
          
          <TouchableOpacity 
            style={[buttonStyles.primary, { marginTop: 16 }]}
            onPress={() => setShowInfo(false)}
          >
            <Text style={buttonStyles.primaryText}>Got It</Text>
          </TouchableOpacity>
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
};

export default AIScreen;
