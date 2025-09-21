
// AI Model Registry - STUBBED VERSION
// All AI functionality has been removed and replaced with stub implementations

export interface AIModelInfo {
  id: string;
  name: string;
  description: string;
  category: 'vision' | 'nlp' | 'audio' | 'multimodal' | 'generative';
  license: string;
  source: string;
  url: string;
  size: number; // MB
  accuracy: number;
  latency: number; // ms
  platforms: string[];
  requirements: {
    minRAM: number;
    minStorage: number;
    gpu: boolean;
    networkRequired: boolean;
  };
  capabilities: string[];
  lastUpdated: string;
  disabled: boolean; // New field to indicate stub status
}

// Stub model registry - no actual AI models
export const AI_MODEL_REGISTRY: AIModelInfo[] = [
  {
    id: 'stub-vision-model',
    name: 'Vision Model (Disabled)',
    description: 'Computer vision functionality has been disabled',
    category: 'vision',
    license: 'N/A',
    source: 'Stub Implementation',
    url: 'https://example.com/disabled',
    size: 0,
    accuracy: 0.5,
    latency: 100,
    platforms: ['ios', 'android', 'web'],
    requirements: {
      minRAM: 0,
      minStorage: 0,
      gpu: false,
      networkRequired: false
    },
    capabilities: ['stub_response'],
    lastUpdated: '2024-01-01',
    disabled: true
  },
  {
    id: 'stub-nlp-model',
    name: 'NLP Model (Disabled)',
    description: 'Natural language processing functionality has been disabled',
    category: 'nlp',
    license: 'N/A',
    source: 'Stub Implementation',
    url: 'https://example.com/disabled',
    size: 0,
    accuracy: 0.5,
    latency: 100,
    platforms: ['ios', 'android', 'web'],
    requirements: {
      minRAM: 0,
      minStorage: 0,
      gpu: false,
      networkRequired: false
    },
    capabilities: ['stub_response'],
    lastUpdated: '2024-01-01',
    disabled: true
  },
  {
    id: 'stub-audio-model',
    name: 'Audio Model (Disabled)',
    description: 'Audio processing functionality has been disabled',
    category: 'audio',
    license: 'N/A',
    source: 'Stub Implementation',
    url: 'https://example.com/disabled',
    size: 0,
    accuracy: 0.5,
    latency: 100,
    platforms: ['ios', 'android', 'web'],
    requirements: {
      minRAM: 0,
      minStorage: 0,
      gpu: false,
      networkRequired: false
    },
    capabilities: ['stub_response'],
    lastUpdated: '2024-01-01',
    disabled: true
  }
];

export const getModelsByCategory = (category: string) => {
  console.log(`Getting models by category (stubbed): ${category}`);
  return AI_MODEL_REGISTRY.filter(model => model.category === category);
};

export const getModelById = (id: string) => {
  console.log(`Getting model by ID (stubbed): ${id}`);
  return AI_MODEL_REGISTRY.find(model => model.id === id);
};

export const getCompatibleModels = (platform: string, maxSize?: number, requiresGPU?: boolean) => {
  console.log(`Getting compatible models (stubbed) for platform: ${platform}`);
  return AI_MODEL_REGISTRY.filter(model => {
    return model.platforms.includes(platform) && model.disabled;
  });
};

export const getModelCapabilities = () => {
  console.log('Getting model capabilities (stubbed)');
  return ['stub_response', 'disabled_functionality'];
};

export const getModelLicenses = () => {
  console.log('Getting model licenses (stubbed)');
  return ['N/A'];
};

export const searchModels = (query: string) => {
  console.log(`Searching models (stubbed) for query: ${query}`);
  return AI_MODEL_REGISTRY.filter(model => 
    model.name.toLowerCase().includes('disabled') ||
    model.description.toLowerCase().includes('disabled')
  );
};

// Additional stub functions
export const isAIEnabled = () => {
  return false; // AI is always disabled
};

export const getDisabledReason = () => {
  return 'AI functionality has been disabled to improve app performance, reduce bundle size, and enhance user privacy.';
};

export const getAlternatives = () => {
  return [
    'Use the camera for standard photo and video capture',
    'Manual text input instead of AI text generation',
    'Standard image gallery instead of AI-powered search',
    'Basic user preferences instead of AI recommendations'
  ];
};
