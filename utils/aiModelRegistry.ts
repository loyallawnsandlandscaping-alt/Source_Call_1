
// AI Model Registry - Comprehensive list of open-source AI models
// Licensed under Apache 2.0, MIT, or other permissive licenses

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
}

export const AI_MODEL_REGISTRY: AIModelInfo[] = [
  // Computer Vision Models
  {
    id: 'mediapipe-face-detection',
    name: 'MediaPipe Face Detection',
    description: 'Real-time face detection optimized for mobile devices',
    category: 'vision',
    license: 'Apache 2.0',
    source: 'Google MediaPipe',
    url: 'https://github.com/google/mediapipe',
    size: 1.2,
    accuracy: 0.95,
    latency: 25,
    platforms: ['ios', 'android', 'web'],
    requirements: {
      minRAM: 256,
      minStorage: 5,
      gpu: false,
      networkRequired: false
    },
    capabilities: ['face_detection', 'face_landmarks', 'face_mesh'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'mediapipe-hands',
    name: 'MediaPipe Hands',
    description: 'Real-time hand tracking and gesture recognition',
    category: 'vision',
    license: 'Apache 2.0',
    source: 'Google MediaPipe',
    url: 'https://github.com/google/mediapipe',
    size: 2.8,
    accuracy: 0.92,
    latency: 35,
    platforms: ['ios', 'android', 'web'],
    requirements: {
      minRAM: 512,
      minStorage: 10,
      gpu: false,
      networkRequired: false
    },
    capabilities: ['hand_tracking', 'gesture_recognition', 'hand_landmarks'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'mediapipe-pose',
    name: 'MediaPipe Pose',
    description: 'Full-body pose estimation and tracking',
    category: 'vision',
    license: 'Apache 2.0',
    source: 'Google MediaPipe',
    url: 'https://github.com/google/mediapipe',
    size: 5.4,
    accuracy: 0.91,
    latency: 45,
    platforms: ['ios', 'android', 'web'],
    requirements: {
      minRAM: 1024,
      minStorage: 15,
      gpu: true,
      networkRequired: false
    },
    capabilities: ['pose_estimation', 'pose_landmarks', 'activity_recognition'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'yolov8-nano',
    name: 'YOLOv8 Nano',
    description: 'Ultra-lightweight object detection model',
    category: 'vision',
    license: 'AGPL-3.0 (Commercial available)',
    source: 'Ultralytics',
    url: 'https://github.com/ultralytics/ultralytics',
    size: 6.2,
    accuracy: 0.87,
    latency: 80,
    platforms: ['ios', 'android'],
    requirements: {
      minRAM: 1024,
      minStorage: 20,
      gpu: true,
      networkRequired: false
    },
    capabilities: ['object_detection', 'instance_segmentation', 'classification'],
    lastUpdated: '2024-01-10'
  },
  {
    id: 'efficientdet-d0',
    name: 'EfficientDet D0',
    description: 'Efficient object detection with high accuracy',
    category: 'vision',
    license: 'Apache 2.0',
    source: 'Google Research',
    url: 'https://github.com/google/automl/tree/master/efficientdet',
    size: 6.5,
    accuracy: 0.85,
    latency: 120,
    platforms: ['ios', 'android', 'web'],
    requirements: {
      minRAM: 1536,
      minStorage: 25,
      gpu: true,
      networkRequired: false
    },
    capabilities: ['object_detection', 'bounding_boxes', 'classification'],
    lastUpdated: '2023-12-20'
  },
  {
    id: 'mobilenet-v3-large',
    name: 'MobileNetV3 Large',
    description: 'Mobile-optimized image classification',
    category: 'vision',
    license: 'Apache 2.0',
    source: 'Google Research',
    url: 'https://github.com/tensorflow/models/tree/master/research/slim/nets/mobilenet',
    size: 5.4,
    accuracy: 0.89,
    latency: 60,
    platforms: ['ios', 'android', 'web'],
    requirements: {
      minRAM: 512,
      minStorage: 15,
      gpu: false,
      networkRequired: false
    },
    capabilities: ['image_classification', 'feature_extraction', 'transfer_learning'],
    lastUpdated: '2023-11-15'
  },

  // Natural Language Processing Models
  {
    id: 'distilbert-base-uncased',
    name: 'DistilBERT Base Uncased',
    description: 'Distilled BERT model for efficient NLP tasks',
    category: 'nlp',
    license: 'Apache 2.0',
    source: 'Hugging Face',
    url: 'https://huggingface.co/distilbert-base-uncased',
    size: 66.0,
    accuracy: 0.92,
    latency: 200,
    platforms: ['ios', 'android', 'web'],
    requirements: {
      minRAM: 2048,
      minStorage: 100,
      gpu: false,
      networkRequired: false
    },
    capabilities: ['text_classification', 'sentiment_analysis', 'question_answering'],
    lastUpdated: '2024-01-05'
  },
  {
    id: 'universal-sentence-encoder',
    name: 'Universal Sentence Encoder',
    description: 'Sentence embeddings for semantic similarity',
    category: 'nlp',
    license: 'Apache 2.0',
    source: 'Google Research',
    url: 'https://tfhub.dev/google/universal-sentence-encoder/4',
    size: 26.7,
    accuracy: 0.88,
    latency: 150,
    platforms: ['ios', 'android', 'web'],
    requirements: {
      minRAM: 1024,
      minStorage: 50,
      gpu: false,
      networkRequired: false
    },
    capabilities: ['sentence_embeddings', 'semantic_similarity', 'text_clustering'],
    lastUpdated: '2023-10-30'
  },
  {
    id: 'bert-base-multilingual',
    name: 'BERT Base Multilingual',
    description: 'Multilingual BERT for cross-language tasks',
    category: 'nlp',
    license: 'Apache 2.0',
    source: 'Google Research',
    url: 'https://github.com/google-research/bert',
    size: 110.0,
    accuracy: 0.94,
    latency: 300,
    platforms: ['ios', 'android', 'web'],
    requirements: {
      minRAM: 3072,
      minStorage: 150,
      gpu: false,
      networkRequired: false
    },
    capabilities: ['multilingual_nlp', 'translation', 'cross_lingual_understanding'],
    lastUpdated: '2023-12-01'
  },
  {
    id: 't5-small',
    name: 'T5 Small',
    description: 'Text-to-Text Transfer Transformer for generation tasks',
    category: 'nlp',
    license: 'Apache 2.0',
    source: 'Google Research',
    url: 'https://github.com/google-research/text-to-text-transfer-transformer',
    size: 60.5,
    accuracy: 0.86,
    latency: 400,
    platforms: ['ios', 'android', 'web'],
    requirements: {
      minRAM: 2048,
      minStorage: 80,
      gpu: false,
      networkRequired: false
    },
    capabilities: ['text_generation', 'summarization', 'translation', 'question_answering'],
    lastUpdated: '2023-11-20'
  },

  // Audio Processing Models
  {
    id: 'wav2vec2-base-960h',
    name: 'Wav2Vec2 Base 960h',
    description: 'Self-supervised speech recognition model',
    category: 'audio',
    license: 'MIT',
    source: 'Facebook Research',
    url: 'https://github.com/pytorch/fairseq/tree/master/examples/wav2vec',
    size: 95.0,
    accuracy: 0.93,
    latency: 500,
    platforms: ['ios', 'android', 'web'],
    requirements: {
      minRAM: 2560,
      minStorage: 120,
      gpu: false,
      networkRequired: false
    },
    capabilities: ['speech_recognition', 'audio_transcription', 'voice_activity_detection'],
    lastUpdated: '2023-12-10'
  },
  {
    id: 'yamnet',
    name: 'YAMNet',
    description: 'Audio event classification and sound recognition',
    category: 'audio',
    license: 'Apache 2.0',
    source: 'Google Research',
    url: 'https://github.com/tensorflow/models/tree/master/research/audioset/yamnet',
    size: 5.2,
    accuracy: 0.87,
    latency: 100,
    platforms: ['ios', 'android', 'web'],
    requirements: {
      minRAM: 512,
      minStorage: 15,
      gpu: false,
      networkRequired: false
    },
    capabilities: ['audio_classification', 'sound_detection', 'environmental_audio'],
    lastUpdated: '2023-11-25'
  },
  {
    id: 'tacotron2',
    name: 'Tacotron2',
    description: 'Neural text-to-speech synthesis',
    category: 'audio',
    license: 'BSD-3-Clause',
    source: 'NVIDIA',
    url: 'https://github.com/NVIDIA/tacotron2',
    size: 32.1,
    accuracy: 0.96,
    latency: 800,
    platforms: ['ios', 'android'],
    requirements: {
      minRAM: 1536,
      minStorage: 50,
      gpu: true,
      networkRequired: false
    },
    capabilities: ['text_to_speech', 'voice_synthesis', 'speech_generation'],
    lastUpdated: '2023-10-15'
  },

  // Multimodal Models
  {
    id: 'clip-vit-base-patch32',
    name: 'CLIP ViT-B/32',
    description: 'Vision-language understanding model',
    category: 'multimodal',
    license: 'MIT',
    source: 'OpenAI',
    url: 'https://github.com/openai/CLIP',
    size: 151.0,
    accuracy: 0.89,
    latency: 250,
    platforms: ['ios', 'android', 'web'],
    requirements: {
      minRAM: 3584,
      minStorage: 200,
      gpu: true,
      networkRequired: false
    },
    capabilities: ['image_text_matching', 'zero_shot_classification', 'visual_search'],
    lastUpdated: '2023-12-05'
  },

  // Generative Models
  {
    id: 'gpt2-small',
    name: 'GPT-2 Small',
    description: 'Generative language model for text completion',
    category: 'generative',
    license: 'MIT',
    source: 'OpenAI',
    url: 'https://github.com/openai/gpt-2',
    size: 124.0,
    accuracy: 0.85,
    latency: 600,
    platforms: ['ios', 'android', 'web'],
    requirements: {
      minRAM: 2048,
      minStorage: 150,
      gpu: false,
      networkRequired: false
    },
    capabilities: ['text_generation', 'text_completion', 'creative_writing'],
    lastUpdated: '2023-11-10'
  },

  // Specialized Models
  {
    id: 'detr-resnet50',
    name: 'DETR ResNet-50',
    description: 'End-to-end object detection with transformers',
    category: 'vision',
    license: 'Apache 2.0',
    source: 'Facebook Research',
    url: 'https://github.com/facebookresearch/detr',
    size: 41.3,
    accuracy: 0.84,
    latency: 180,
    platforms: ['ios', 'android'],
    requirements: {
      minRAM: 2048,
      minStorage: 60,
      gpu: true,
      networkRequired: false
    },
    capabilities: ['object_detection', 'panoptic_segmentation', 'transformer_based'],
    lastUpdated: '2023-12-15'
  },
  {
    id: 'dino-vitb16',
    name: 'DINO ViT-B/16',
    description: 'Self-supervised vision transformer',
    category: 'vision',
    license: 'Apache 2.0',
    source: 'Facebook Research',
    url: 'https://github.com/facebookresearch/dino',
    size: 85.8,
    accuracy: 0.91,
    latency: 200,
    platforms: ['ios', 'android'],
    requirements: {
      minRAM: 2560,
      minStorage: 100,
      gpu: true,
      networkRequired: false
    },
    capabilities: ['self_supervised_learning', 'feature_extraction', 'image_understanding'],
    lastUpdated: '2023-11-30'
  }
];

export const getModelsByCategory = (category: string) => {
  return AI_MODEL_REGISTRY.filter(model => model.category === category);
};

export const getModelById = (id: string) => {
  return AI_MODEL_REGISTRY.find(model => model.id === id);
};

export const getCompatibleModels = (platform: string, maxSize?: number, requiresGPU?: boolean) => {
  return AI_MODEL_REGISTRY.filter(model => {
    if (!model.platforms.includes(platform)) return false;
    if (maxSize && model.size > maxSize) return false;
    if (requiresGPU !== undefined && model.requirements.gpu !== requiresGPU) return false;
    return true;
  });
};

export const getModelCapabilities = () => {
  const capabilities = new Set<string>();
  AI_MODEL_REGISTRY.forEach(model => {
    model.capabilities.forEach(cap => capabilities.add(cap));
  });
  return Array.from(capabilities).sort();
};

export const getModelLicenses = () => {
  const licenses = new Set<string>();
  AI_MODEL_REGISTRY.forEach(model => {
    licenses.add(model.license);
  });
  return Array.from(licenses).sort();
};

export const searchModels = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return AI_MODEL_REGISTRY.filter(model => 
    model.name.toLowerCase().includes(lowercaseQuery) ||
    model.description.toLowerCase().includes(lowercaseQuery) ||
    model.capabilities.some(cap => cap.toLowerCase().includes(lowercaseQuery))
  );
};
