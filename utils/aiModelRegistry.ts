
// This file should not exist - AI functionality has been completely removed
// This is a placeholder to prevent import errors during cleanup

console.log('WARNING: aiModelRegistry.ts should not exist - AI functionality removed');

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

export const AI_MODEL_REGISTRY: AIModelInfo[] = [];

export const getModelsByCategory = (category: string) => {
  throw new Error('AI functionality has been completely removed from this application');
};

export const getModelById = (id: string) => {
  throw new Error('AI functionality has been completely removed from this application');
};

export const getCompatibleModels = (platform: string, maxSize?: number, requiresGPU?: boolean) => {
  throw new Error('AI functionality has been completely removed from this application');
};

export const getModelCapabilities = () => {
  throw new Error('AI functionality has been completely removed from this application');
};

export const getModelLicenses = () => {
  throw new Error('AI functionality has been completely removed from this application');
};

export const searchModels = (query: string) => {
  throw new Error('AI functionality has been completely removed from this application');
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
