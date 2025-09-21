
// AI Model Registry functionality has been completely removed from this application
// This file exists only to prevent import errors and will be removed in future updates

export interface AIModelInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  license: string;
  source: string;
  url: string;
  size: number;
  accuracy: number;
  latency: number;
  platforms: string[];
  requirements: any;
  capabilities: string[];
  lastUpdated: string;
  disabled: boolean;
}

// Empty registry - no AI models available
export const AI_MODEL_REGISTRY: AIModelInfo[] = [];

export const getModelsByCategory = (category: string) => {
  console.log(`AI models disabled - category: ${category}`);
  return [];
};

export const getModelById = (id: string) => {
  console.log(`AI models disabled - ID: ${id}`);
  return null;
};

export const getCompatibleModels = (platform: string, maxSize?: number, requiresGPU?: boolean) => {
  console.log(`AI models disabled - platform: ${platform}`);
  return [];
};

export const getModelCapabilities = () => {
  console.log('AI model capabilities disabled');
  return [];
};

export const getModelLicenses = () => {
  console.log('AI model licenses disabled');
  return [];
};

export const searchModels = (query: string) => {
  console.log(`AI model search disabled - query: ${query}`);
  return [];
};

export const isAIEnabled = () => {
  return false;
};

export const getDisabledReason = () => {
  return 'AI functionality has been completely removed to focus on core messaging, calling, and drum kit features.';
};

export const getAlternatives = () => {
  return [
    'Use the camera for standard photo and video capture',
    'Use messaging for text communication',
    'Use video calling for face-to-face conversations',
    'Use the drum kit for music creation'
  ];
};
