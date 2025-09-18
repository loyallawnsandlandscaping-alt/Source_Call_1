
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
    analyzeText,
    translateText,
    analyzeAudio,
    detectProducts,
    analyzeMedicalImage,
    analyzeFinancialData,
    detectAnomalies,
    generateRecommendations,
    createDataVisualization,
    getModelInfo,
    benchmarkModels,
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
  const [showModelManager, setShowModelManager] = useState(false);
  const [showBenchmarks, setShowBenchmarks] = useState(false);
  const [showSystemStats, setShowSystemStats] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'models' | 'benchmarks' | 'stats'>('analysis');

  useEffect(() => {
    if (!isInitialized && !aiLoading) {
      console.log('AI system not initialized, attempting to initialize...');
    }
  }, [isInitialized, aiLoading]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await optimizeOrchestration();
      clearDetections();
      setAnalysisResults(null);
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

    if (!isInitialized) {
      Alert.alert('AI Not Ready', 'AI models are still loading. Please wait.');
      return;
    }

    try {
      console.log('Starting comprehensive image analysis...');
      
      // Use AI orchestration to route requests to best models
      const visionModel = routeRequest('image_analysis', { category: 'vision', accuracy: 0.8 });
      console.log('Selected vision model:', visionModel?.name);

      const results = await analyzeFrame(selectedImage);
      
      // Additional specialized analyses
      const [products, textAnalysis] = await Promise.all([
        detectProducts(selectedImage).catch(() => []),
        analyzeText('Sample text for analysis').catch(() => null)
      ]);

      setAnalysisResults({
        ...results,
        products,
        textAnalysis,
        timestamp: new Date(),
        modelUsed: visionModel?.name || 'Multi-model ensemble'
      });

      Alert.alert('Analysis Complete', 'Image analysis completed successfully!');
    } catch (err: any) {
      console.log('Error analyzing image:', err);
      Alert.alert('Analysis Failed', err.message);
    }
  };

  const runFaceDetection = async () => {
    if (!selectedImage) return;
    
    try {
      const faces = await detectFaces(selectedImage);
      Alert.alert('Face Detection', `Detected ${faces.length} face(s)`);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const runHandDetection = async () => {
    if (!selectedImage) return;
    
    try {
      const hands = await detectHands(selectedImage);
      Alert.alert('Hand Detection', `Detected ${hands.length} hand(s)`);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const runPoseDetection = async () => {
    if (!selectedImage) return;
    
    try {
      const pose = await detectPose(selectedImage);
      Alert.alert('Pose Detection', `Detected pose with ${pose.keypoints.length} keypoints`);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const runObjectDetection = async () => {
    if (!selectedImage) return;
    
    try {
      const objects = await detectObjects(selectedImage);
      Alert.alert('Object Detection', `Detected ${objects.length} object(s)`);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleModelToggle = (modelId: string) => {
    console.log(`Toggling model: ${modelId}`);
    // In a real implementation, this would activate/deactivate the model
    Alert.alert('Model Toggle', `Model ${modelId} toggled`);
  };

  const handleModelBenchmark = async (modelId: string) => {
    try {
      await benchmarkModel(modelId);
      Alert.alert('Benchmark Complete', `Model ${modelId} benchmarked successfully`);
    } catch (err: any) {
      Alert.alert('Benchmark Failed', err.message);
    }
  };

  const handleModelUpdate = async (modelId: string) => {
    try {
      const success = await updateModel(modelId);
      if (success) {
        Alert.alert('Update Complete', `Model ${modelId} updated successfully`);
      } else {
        Alert.alert('Update Failed', `Failed to update model ${modelId}`);
      }
    } catch (err: any) {
      Alert.alert('Update Error', err.message);
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
        <View style={commonStyles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Icon 
              name={isInitialized ? 'check-circle' : 'clock'} 
              size={20} 
              color={isInitialized ? colors.success : colors.warning} 
            />
            <Text style={[commonStyles.text, { marginLeft: 8 }]}>
              {isInitialized ? 'AI System Ready' : 'Initializing AI Models...'}
            </Text>
          </View>
          
          {orchestrationConfig && (
            <Text style={commonStyles.textSecondary}>
              Primary Model: {availableModels.find(m => m.id === orchestrationConfig.primaryModel)?.name || 'Unknown'}
            </Text>
          )}
          
          <Text style={commonStyles.textSecondary}>
            Active Models: {Object.keys(activeModels).length} / {availableModels.length}
          </Text>
        </View>
      </View>

      {/* Image Analysis */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Image Analysis</Text>
        
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
                    <Text style={buttonStyles.secondaryText}>Full Analysis</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[buttonStyles.secondary, { flex: 1, minWidth: '45%' }]} 
                onPress={runFaceDetection}
              >
                <Icon name="user" size={16} color={colors.primary} />
                <Text style={buttonStyles.secondaryText}>Faces</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[buttonStyles.secondary, { flex: 1, minWidth: '45%' }]} 
                onPress={runHandDetection}
              >
                <Icon name="hand" size={16} color={colors.primary} />
                <Text style={buttonStyles.secondaryText}>Hands</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[buttonStyles.secondary, { flex: 1, minWidth: '45%' }]} 
                onPress={runPoseDetection}
              >
                <Icon name="activity" size={16} color={colors.primary} />
                <Text style={buttonStyles.secondaryText}>Pose</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[buttonStyles.secondary, { flex: 1, minWidth: '45%' }]} 
                onPress={runObjectDetection}
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
            <Text style={commonStyles.cardTitle}>Analysis Results</Text>
            
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
                <Text style={commonStyles.text}>Objects Detected:</Text>
                {analysisResults.detectedObjects.map((obj: any, index: number) => (
                  <Text key={index} style={commonStyles.textSecondary}>
                    • {obj.label} ({(obj.confidence * 100).toFixed(1)}%)
                  </Text>
                ))}
              </View>
            )}

            {analysisResults.faceData && (
              <View style={{ marginBottom: 12 }}>
                <Text style={commonStyles.text}>Face Analysis:</Text>
                <Text style={commonStyles.textSecondary}>
                  Landmarks: {analysisResults.faceData.landmarks?.length || 0}
                </Text>
                {analysisResults.faceData.emotions && (
                  <Text style={commonStyles.textSecondary}>
                    Primary Emotion: {analysisResults.faceData.emotions[0]?.emotion} 
                    ({(analysisResults.faceData.emotions[0]?.confidence * 100).toFixed(1)}%)
                  </Text>
                )}
              </View>
            )}

            {analysisResults.handData && (
              <View style={{ marginBottom: 12 }}>
                <Text style={commonStyles.text}>Hand Analysis:</Text>
                <Text style={commonStyles.textSecondary}>
                  Handedness: {analysisResults.handData.handedness}
                </Text>
                <Text style={commonStyles.textSecondary}>
                  Landmarks: {analysisResults.handData.landmarks?.length || 0}
                </Text>
                {analysisResults.handData.gestures && analysisResults.handData.gestures.length > 0 && (
                  <Text style={commonStyles.textSecondary}>
                    Gesture: {analysisResults.handData.gestures[0].type} 
                    ({(analysisResults.handData.gestures[0].confidence * 100).toFixed(1)}%)
                  </Text>
                )}
              </View>
            )}

            {analysisResults.products && analysisResults.products.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={commonStyles.text}>Products Detected:</Text>
                {analysisResults.products.map((product: any, index: number) => (
                  <View key={index} style={{ marginLeft: 12, marginBottom: 4 }}>
                    <Text style={commonStyles.textSecondary}>• {product.name}</Text>
                    {product.price && (
                      <Text style={commonStyles.textSecondary}>  Price: ${product.price}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>

      {/* Recent Detections */}
      {detections.length > 0 && (
        <View style={commonStyles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={commonStyles.sectionTitle}>Recent Detections</Text>
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
            </View>
          ))}
        </View>
      )}

      {/* Error Display */}
      {(aiError || orchestrationError) && (
        <View style={commonStyles.section}>
          <View style={[commonStyles.card, { backgroundColor: colors.errorLight }]}>
            <Text style={[commonStyles.text, { color: colors.error }]}>
              {aiError || orchestrationError}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderModelsTab = () => (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.section}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={commonStyles.sectionTitle}>AI Models</Text>
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

        {availableModels.map((model) => {
          const performance = getModelPerformance(model.id);
          const hasUpdate = updateInfo.some(u => u.modelId === model.id);
          const benchmark = benchmarks.find(b => b.modelId === model.id);
          
          return (
            <AIModelCard
              key={model.id}
              model={model}
              benchmark={benchmark}
              isActive={!!activeModels[model.id]}
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

  const renderBenchmarksTab = () => (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.section}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={commonStyles.sectionTitle}>Model Benchmarks</Text>
          <TouchableOpacity 
            style={buttonStyles.secondary}
            onPress={benchmarkModels}
          >
            <Icon name="activity" size={16} color={colors.primary} />
            <Text style={buttonStyles.secondaryText}>Run All</Text>
          </TouchableOpacity>
        </View>

        {benchmarks.length === 0 ? (
          <View style={commonStyles.card}>
            <Text style={commonStyles.textSecondary}>No benchmarks available. Run benchmarks to see performance data.</Text>
          </View>
        ) : (
          benchmarks.map((benchmark, index) => {
            const model = availableModels.find(m => m.id === benchmark.modelId);
            return (
              <View key={index} style={commonStyles.card}>
                <Text style={commonStyles.cardTitle}>{model?.name || benchmark.modelId}</Text>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={commonStyles.textSecondary}>Accuracy</Text>
                  <Text style={commonStyles.text}>{(benchmark.accuracy * 100).toFixed(1)}%</Text>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={commonStyles.textSecondary}>Latency</Text>
                  <Text style={commonStyles.text}>{benchmark.latency.toFixed(1)}ms</Text>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={commonStyles.textSecondary}>Throughput</Text>
                  <Text style={commonStyles.text}>{benchmark.throughput.toFixed(1)} ops/sec</Text>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={commonStyles.textSecondary}>Memory Usage</Text>
                  <Text style={commonStyles.text}>{benchmark.memoryUsage.toFixed(0)} MB</Text>
                </View>
                
                <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                  {benchmark.timestamp.toLocaleString()}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );

  const renderStatsTab = () => {
    const stats = getSystemStats();
    
    return (
      <ScrollView style={commonStyles.container}>
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>System Statistics</Text>
          
          <View style={commonStyles.card}>
            <Text style={commonStyles.cardTitle}>Overview</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={commonStyles.textSecondary}>Total Models</Text>
              <Text style={commonStyles.text}>{stats.totalModels}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={commonStyles.textSecondary}>Active Models</Text>
              <Text style={commonStyles.text}>{stats.activeCount}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={commonStyles.textSecondary}>Platform</Text>
              <Text style={commonStyles.text}>{stats.platform}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={commonStyles.textSecondary}>Avg Accuracy</Text>
              <Text style={commonStyles.text}>{stats.avgAccuracy}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={commonStyles.textSecondary}>Avg Latency</Text>
              <Text style={commonStyles.text}>{stats.avgLatency}</Text>
            </View>
          </View>

          <View style={commonStyles.card}>
            <Text style={commonStyles.cardTitle}>Models by Category</Text>
            {Object.entries(stats.categoryCounts).map(([category, count]) => (
              <View key={category} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={commonStyles.textSecondary}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
                <Text style={commonStyles.text}>{count}</Text>
              </View>
            ))}
          </View>

          <View style={commonStyles.card}>
            <Text style={commonStyles.cardTitle}>Performance Data</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={commonStyles.textSecondary}>Benchmarks</Text>
              <Text style={commonStyles.text}>{stats.benchmarkCount}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={commonStyles.textSecondary}>Updates Available</Text>
              <Text style={commonStyles.text}>{stats.updateCount}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={commonStyles.textSecondary}>Cache Size</Text>
              <Text style={commonStyles.text}>{stats.cacheSize}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      {/* Header */}
      <View style={commonStyles.header}>
        <Text style={commonStyles.headerTitle}>AI Laboratory</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => setShowSystemStats(true)}>
            <Icon name="bar-chart-2" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowModelManager(true)}>
            <Icon name="settings" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={{ flexDirection: 'row', backgroundColor: colors.surface, paddingHorizontal: 16 }}>
        {[
          { key: 'analysis', label: 'Analysis', icon: 'zap' },
          { key: 'models', label: 'Models', icon: 'cpu' },
          { key: 'benchmarks', label: 'Benchmarks', icon: 'activity' },
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
      {activeTab === 'benchmarks' && renderBenchmarksTab()}
      {activeTab === 'stats' && renderStatsTab()}

      {/* Model Manager Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={showModelManager}
        onClose={() => setShowModelManager(false)}
      >
        <View style={{ padding: 20 }}>
          <Text style={commonStyles.cardTitle}>AI Model Manager</Text>
          <Text style={commonStyles.textSecondary}>
            Manage your AI models, check for updates, and optimize performance.
          </Text>
          
          <TouchableOpacity 
            style={[buttonStyles.primary, { marginTop: 16 }]}
            onPress={() => {
              setShowModelManager(false);
              setActiveTab('models');
            }}
          >
            <Icon name="cpu" size={20} color="white" />
            <Text style={buttonStyles.primaryText}>View Models</Text>
          </TouchableOpacity>
        </View>
      </SimpleBottomSheet>

      {/* System Stats Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={showSystemStats}
        onClose={() => setShowSystemStats(false)}
      >
        <View style={{ padding: 20 }}>
          <Text style={commonStyles.cardTitle}>System Statistics</Text>
          <Text style={commonStyles.textSecondary}>
            View detailed performance metrics and system information.
          </Text>
          
          <TouchableOpacity 
            style={[buttonStyles.primary, { marginTop: 16 }]}
            onPress={() => {
              setShowSystemStats(false);
              setActiveTab('stats');
            }}
          >
            <Icon name="bar-chart-2" size={20} color="white" />
            <Text style={buttonStyles.primaryText}>View Stats</Text>
          </TouchableOpacity>
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
};

export default AIScreen;
