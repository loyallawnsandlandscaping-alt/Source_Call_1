
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  isVerified: boolean;
  createdAt: Date;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  language: string;
  aiPersonalization: AIPersonalizationData;
  privacySettings: PrivacySettings;
  accessibilitySettings: AccessibilitySettings;
}

export interface AIPersonalizationData {
  modelPreferences: Record<string, number>;
  usagePatterns: UsagePattern[];
  customModels: CustomModel[];
  learningEnabled: boolean;
}

export interface UsagePattern {
  feature: string;
  frequency: number;
  accuracy: number;
  timestamp: Date;
}

export interface CustomModel {
  id: string;
  name: string;
  type: AIModelType;
  version: string;
  accuracy: number;
  size: number;
  lastUpdated: Date;
}

export interface PrivacySettings {
  dataCollection: boolean;
  analytics: boolean;
  aiLogging: boolean;
  federatedLearning: boolean;
  explainabilityEnabled: boolean;
}

export interface AccessibilitySettings {
  voiceNavigation: boolean;
  gestureNavigation: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'annotation' | 'ai_generated';
  timestamp: Date;
  isRead: boolean;
  reactions: MessageReaction[];
  replyTo?: string;
  annotations?: Annotation[];
  mediaUrl?: string;
  mediaMetadata?: MediaMetadata;
  aiMetadata?: AIMessageMetadata;
  translation?: Translation;
  sentiment?: SentimentAnalysis;
}

export interface AIMessageMetadata {
  generatedBy: string;
  confidence: number;
  processingTime: number;
  modelVersion: string;
  explainability?: ExplainabilityData;
}

export interface Translation {
  originalLanguage: string;
  targetLanguage: string;
  translatedText: string;
  confidence: number;
  contextual: boolean;
}

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: EmotionData[];
  toxicity?: number;
}

export interface ExplainabilityData {
  reasoning: string;
  confidence: number;
  factors: ExplanationFactor[];
  alternatives?: string[];
}

export interface ExplanationFactor {
  factor: string;
  importance: number;
  description: string;
}

export interface MessageReaction {
  userId: string;
  emoji: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  participants: string[];
  name?: string;
  avatar?: string;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  isTyping: string[];
  aiAssistant?: AIAssistantConfig;
}

export interface AIAssistantConfig {
  enabled: boolean;
  personality: string;
  capabilities: string[];
  language: string;
  contextAware: boolean;
}

export interface Annotation {
  id: string;
  type: 'highlight' | 'note' | 'audio' | 'gesture' | 'ai_detection' | '3d_model' | 'ar_overlay';
  content: string;
  position: {
    x: number;
    y: number;
    z?: number;
    width?: number;
    height?: number;
    depth?: number;
  };
  layer: number;
  timestamp: Date;
  userId: string;
  aiData?: AIDetectionData;
  threeDData?: ThreeDModelData;
  arData?: AROverlayData;
}

export interface ThreeDModelData {
  modelUrl: string;
  scale: number;
  rotation: { x: number; y: number; z: number };
  materials: Material[];
  animations?: Animation[];
}

export interface Material {
  name: string;
  color: string;
  texture?: string;
  metallic: number;
  roughness: number;
}

export interface Animation {
  name: string;
  duration: number;
  loop: boolean;
  keyframes: Keyframe[];
}

export interface Keyframe {
  time: number;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export interface AROverlayData {
  type: 'text' | 'image' | '3d_model' | 'video';
  content: string;
  anchor: ARAnchor;
  tracking: ARTracking;
}

export interface ARAnchor {
  type: 'plane' | 'image' | 'face' | 'hand' | 'object';
  referenceId?: string;
  position: { x: number; y: number; z: number };
}

export interface ARTracking {
  enabled: boolean;
  type: 'world' | 'face' | 'image' | 'hand';
  confidence: number;
}

export interface AIDetectionData {
  modelUsed: string;
  confidence: number;
  processingTime: number;
  detectedObjects: DetectedObject[];
  faceData?: FaceData;
  handData?: HandData;
  gestureData?: GestureData;
  productData?: ProductData;
  poseData?: PoseData;
  sceneData?: SceneData;
  medicalData?: MedicalAnalysis;
  financialData?: FinancialAnalysis;
  anomalyData?: AnomalyDetection;
  textData?: TextAnalysis;
  audioData?: AudioAnalysis;
  videoData?: VideoAnalysis;
  explainability?: ExplainabilityData;
}

export interface DetectedObject {
  id: string;
  label: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  metadata?: any;
  category: string;
  attributes: ObjectAttribute[];
}

export interface ObjectAttribute {
  name: string;
  value: string;
  confidence: number;
}

export interface FaceData {
  landmarks: FaceLandmark[];
  emotions: EmotionData[];
  age?: number;
  gender?: string;
  ethnicity?: string;
  expressions: FacialExpression[];
  quality: ImageQuality;
  identity?: FaceIdentity;
}

export interface FaceIdentity {
  id: string;
  confidence: number;
  verified: boolean;
}

export interface FacialExpression {
  type: string;
  intensity: number;
  confidence: number;
}

export interface ImageQuality {
  sharpness: number;
  brightness: number;
  contrast: number;
  noise: number;
}

export interface FaceLandmark {
  type: string;
  x: number;
  y: number;
  z?: number;
  confidence: number;
}

export interface EmotionData {
  emotion: string;
  confidence: number;
  intensity: number;
}

export interface HandData {
  landmarks: HandLandmark[];
  gestures: GestureData[];
  isVisible: boolean;
  handedness: 'left' | 'right' | 'unknown';
  confidence: number;
  tracking: TrackingData;
}

export interface TrackingData {
  velocity: { x: number; y: number; z: number };
  acceleration: { x: number; y: number; z: number };
  smoothness: number;
}

export interface HandLandmark {
  type: string;
  x: number;
  y: number;
  z?: number;
  confidence: number;
}

export interface GestureData {
  type: 'pinch' | 'point' | 'swipe' | 'tap' | 'grab' | 'peace' | 'thumbs_up' | 'ok' | 'fist' | 'open_palm';
  confidence: number;
  timestamp: Date;
  duration?: number;
  trajectory?: TrajectoryPoint[];
}

export interface TrajectoryPoint {
  x: number;
  y: number;
  z?: number;
  timestamp: Date;
}

export interface PoseData {
  keypoints: PoseKeypoint[];
  confidence: number;
  activity: ActivityRecognition;
  posture: PostureAnalysis;
}

export interface PoseKeypoint {
  name: string;
  x: number;
  y: number;
  z?: number;
  confidence: number;
  visibility: number;
}

export interface ActivityRecognition {
  activity: string;
  confidence: number;
  duration: number;
}

export interface PostureAnalysis {
  posture: string;
  quality: number;
  recommendations: string[];
}

export interface SceneData {
  description: string;
  objects: DetectedObject[];
  lighting: LightingAnalysis;
  depth: DepthData;
  spatial: SpatialAnalysis;
}

export interface LightingAnalysis {
  brightness: number;
  contrast: number;
  colorTemperature: number;
  shadows: ShadowData[];
}

export interface ShadowData {
  intensity: number;
  direction: { x: number; y: number };
  softness: number;
}

export interface DepthData {
  map: number[][];
  minDepth: number;
  maxDepth: number;
  accuracy: number;
}

export interface SpatialAnalysis {
  roomDimensions?: { width: number; height: number; depth: number };
  surfaces: Surface[];
  occlusions: Occlusion[];
}

export interface Surface {
  type: 'floor' | 'wall' | 'ceiling' | 'table' | 'other';
  area: number;
  normal: { x: number; y: number; z: number };
  confidence: number;
}

export interface Occlusion {
  occluder: string;
  occluded: string;
  percentage: number;
}

export interface ProductData {
  name: string;
  price?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  category: string;
  confidence: number;
  brand?: string;
  barcode?: string;
  reviews?: ProductReview[];
  availability?: ProductAvailability;
}

export interface ProductReview {
  rating: number;
  count: number;
  source: string;
}

export interface ProductAvailability {
  inStock: boolean;
  stores: StoreLocation[];
  onlineAvailable: boolean;
}

export interface StoreLocation {
  name: string;
  distance: number;
  address: string;
  phone?: string;
}

export interface MedicalAnalysis {
  type: 'xray' | 'mri' | 'ct' | 'ultrasound' | 'dermatology' | 'ophthalmology';
  findings: MedicalFinding[];
  confidence: number;
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  disclaimer: string;
}

export interface MedicalFinding {
  finding: string;
  location: string;
  severity: number;
  confidence: number;
  description: string;
}

export interface FinancialAnalysis {
  type: 'trend' | 'forecast' | 'risk' | 'anomaly' | 'pattern';
  data: FinancialDataPoint[];
  insights: FinancialInsight[];
  predictions: FinancialPrediction[];
  riskScore: number;
}

export interface FinancialDataPoint {
  timestamp: Date;
  value: number;
  category: string;
  metadata?: any;
}

export interface FinancialInsight {
  type: string;
  description: string;
  impact: number;
  confidence: number;
}

export interface FinancialPrediction {
  timeframe: string;
  value: number;
  confidence: number;
  factors: string[];
}

export interface AnomalyDetection {
  isAnomaly: boolean;
  score: number;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface TextAnalysis {
  summary: string;
  keyPoints: string[];
  sentiment: SentimentAnalysis;
  entities: NamedEntity[];
  topics: Topic[];
  readability: ReadabilityScore;
  language: LanguageDetection;
}

export interface NamedEntity {
  text: string;
  type: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export interface Topic {
  topic: string;
  relevance: number;
  keywords: string[];
}

export interface ReadabilityScore {
  score: number;
  level: string;
  recommendations: string[];
}

export interface LanguageDetection {
  language: string;
  confidence: number;
  alternatives: LanguageAlternative[];
}

export interface LanguageAlternative {
  language: string;
  confidence: number;
}

export interface AudioAnalysis {
  transcription: string;
  speaker: SpeakerIdentification;
  emotions: EmotionData[];
  quality: AudioQuality;
  music: MusicAnalysis;
  noise: NoiseAnalysis;
}

export interface SpeakerIdentification {
  speakerId: string;
  confidence: number;
  gender: string;
  age: number;
  accent?: string;
}

export interface AudioQuality {
  clarity: number;
  volume: number;
  backgroundNoise: number;
  distortion: number;
}

export interface MusicAnalysis {
  genre: string;
  tempo: number;
  key: string;
  mood: string;
  instruments: string[];
  confidence: number;
}

export interface NoiseAnalysis {
  level: number;
  type: string;
  frequency: number;
  impact: number;
}

export interface VideoAnalysis {
  frames: FrameAnalysis[];
  motion: MotionAnalysis;
  scenes: SceneSegment[];
  quality: VideoQuality;
  content: ContentAnalysis;
}

export interface FrameAnalysis {
  frameNumber: number;
  timestamp: number;
  objects: DetectedObject[];
  faces: FaceData[];
  text: string[];
  quality: number;
}

export interface MotionAnalysis {
  type: string;
  intensity: number;
  direction: { x: number; y: number };
  stability: number;
}

export interface SceneSegment {
  startTime: number;
  endTime: number;
  description: string;
  keyframes: number[];
  confidence: number;
}

export interface VideoQuality {
  resolution: { width: number; height: number };
  frameRate: number;
  bitrate: number;
  compression: string;
  stability: number;
}

export interface ContentAnalysis {
  category: string;
  appropriateness: number;
  tags: string[];
  description: string;
}

export interface MediaMetadata {
  duration?: number;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  format: string;
  quality?: string;
  bitrate?: number;
  frameRate?: number;
  colorSpace?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  biometricEnabled: boolean;
  federatedIdentities: FederatedIdentity[];
}

export interface FederatedIdentity {
  provider: string;
  id: string;
  email: string;
  verified: boolean;
  connectedAt: Date;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  showPreview: boolean;
  aiNotifications: boolean;
  smartFiltering: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationSettings;
  privacy: {
    readReceipts: boolean;
    lastSeen: boolean;
    profilePhoto: 'everyone' | 'contacts' | 'nobody';
    dataCollection: boolean;
    analytics: boolean;
    aiLogging: boolean;
  };
  ai: {
    faceDetection: boolean;
    handDetection: boolean;
    gestureControl: boolean;
    productRecognition: boolean;
    autoAnnotation: boolean;
    voiceCloning: boolean;
    realTimeTranslation: boolean;
    smartSuggestions: boolean;
    personalizedModels: boolean;
    explainableAI: boolean;
  };
  accessibility: AccessibilitySettings;
  experimental: ExperimentalSettings;
}

export interface ExperimentalSettings {
  betaFeatures: boolean;
  abTesting: boolean;
  advancedAI: boolean;
  federatedLearning: boolean;
}

export interface AIModelType {
  id: string;
  name: string;
  category: 'vision' | 'nlp' | 'audio' | 'multimodal' | 'generative';
  version: string;
  size: number;
  accuracy: number;
  latency: number;
  supportedPlatforms: string[];
  requirements: ModelRequirements;
}

export interface ModelRequirements {
  minRAM: number;
  minStorage: number;
  gpu: boolean;
  networkRequired: boolean;
}

export interface AIOrchestrationConfig {
  primaryModel: string;
  fallbackModels: string[];
  routingStrategy: 'performance' | 'accuracy' | 'cost' | 'latency';
  loadBalancing: boolean;
  caching: boolean;
  monitoring: boolean;
}

export interface ModelBenchmark {
  modelId: string;
  testSuite: string;
  accuracy: number;
  latency: number;
  throughput: number;
  memoryUsage: number;
  energyConsumption: number;
  timestamp: Date;
}

export interface ABTestConfig {
  id: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  trafficSplit: number[];
  startDate: Date;
  endDate: Date;
  metrics: string[];
  status: 'draft' | 'running' | 'paused' | 'completed';
}

export interface ABTestVariant {
  id: string;
  name: string;
  config: any;
  weight: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  metadata: any;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  error?: string;
}

export interface DataVisualization {
  type: 'chart' | 'graph' | 'heatmap' | 'scatter' | 'histogram' | 'pie' | 'line' | 'bar';
  data: DataPoint[];
  config: VisualizationConfig;
  interactive: boolean;
  exportable: boolean;
}

export interface DataPoint {
  x: number | string | Date;
  y: number;
  label?: string;
  color?: string;
  metadata?: any;
}

export interface VisualizationConfig {
  title: string;
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  colors: string[];
  animations: boolean;
  responsive: boolean;
}

export interface AxisConfig {
  label: string;
  min?: number;
  max?: number;
  format?: string;
  scale: 'linear' | 'log' | 'time';
}

export interface RecommendationSystem {
  userId: string;
  recommendations: Recommendation[];
  algorithm: string;
  confidence: number;
  diversity: number;
  freshness: number;
}

export interface Recommendation {
  id: string;
  type: string;
  content: any;
  score: number;
  reasoning: string;
  category: string;
}

export interface OnboardingFlow {
  steps: OnboardingStep[];
  currentStep: number;
  completed: boolean;
  skippable: boolean;
  personalized: boolean;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  type: 'tutorial' | 'permission' | 'setup' | 'gesture' | 'ai_demo';
  required: boolean;
  interactive: boolean;
  content: OnboardingContent;
}

export interface OnboardingContent {
  text?: string;
  image?: string;
  video?: string;
  animation?: string;
  gesture?: GestureDemo;
  aiDemo?: AIDemoConfig;
}

export interface GestureDemo {
  gesture: string;
  description: string;
  animation: string;
  practice: boolean;
  feedback: boolean;
}

export interface AIDemoConfig {
  feature: string;
  sampleData: any;
  interactive: boolean;
  explanation: string;
}

export interface InternationalizationConfig {
  defaultLanguage: string;
  supportedLanguages: string[];
  rtlSupport: boolean;
  dateFormat: string;
  numberFormat: string;
  currencyFormat: string;
}

export interface AnalyticsEvent {
  id: string;
  userId?: string;
  sessionId: string;
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
  anonymous: boolean;
  consent: boolean;
}

export interface ModelUpdateInfo {
  modelId: string;
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  updateSize: number;
  changelog: string[];
  critical: boolean;
  autoUpdate: boolean;
}
