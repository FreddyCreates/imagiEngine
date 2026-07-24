export interface ImageEditHistoryItem {
  action: string;
  instruction?: string;
  timestamp: number;
}

export interface MarketingOverlayConfig {
  headline?: string;
  ctaText?: string;
  badgeText?: string;
  themeColor?: string;
  position?: 'bottom' | 'top' | 'center' | 'bottom-right';
}

export interface DetailedImageMetadata {
  modelUsed?: string;
  lighting?: string;
  cameraLens?: string;
  cameraParams?: string;
  composition?: string;
  colorPalette?: string;
  revisedPrompt?: string;
  seed?: number;
  timestampFormatted?: string;
  isUpscaled?: boolean;
  upscaleFactor?: string;
  upscaleResolution?: string;
  upscaleDpi?: string;
  upscaleMode?: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  caption?: string;
  style: string;
  aspectRatio: string;
  createdAt: number;
  tags?: string[];
  isFallback?: boolean;
  isRandom?: boolean;
  learnedInsight?: string;
  metadata?: DetailedImageMetadata;
  // Marketer platform features
  parentId?: string;
  rootId?: string;
  version?: number;
  campaignFolder?: string;
  editHistory?: ImageEditHistoryItem[];
  marketingOverlay?: MarketingOverlayConfig;
  // Persistent user library
  savedToLibrary?: boolean;
  savedAt?: number;
  userId?: string;
  notes?: string;
}

export interface UserLibraryItem {
  id: string;
  imageId: string;
  userId: string;
  url: string;
  prompt: string;
  caption?: string;
  style: string;
  aspectRatio: string;
  savedAt: number;
  createdAt: number;
  tags?: string[];
  notes?: string;
  version?: number;
  metadata?: DetailedImageMetadata;
  marketingOverlay?: MarketingOverlayConfig;
}

export interface PlatformLearnedMemory {
  totalLearned: number;
  topKeywords: string[];
  learnedAesthetic: string;
  confidenceScore: number;
  insights: string[];
}

export interface VideoReel {
  id: string;
  title: string;
  prompt: string;
  aspectRatio: string;
  durationSeconds: number;
  frames: string[];
  thumbnailUrl: string;
  createdAt: number;
}

export interface RenderSnapshot {
  id: string;
  dataUrl: string;
  timestamp: number;
  notes?: string;
}

export interface PortfolioCollection {
  id: string;
  name: string;
  description: string;
  items: GeneratedImage[];
  createdAt: number;
}

export interface GeneratedDocument {
  id: string;
  title: string;
  docType: string;
  topic: string;
  targetAudience?: string;
  content: string;
  createdAt: number;
}

export interface AIToolResult {
  id: string;
  toolType: string;
  inputData: string;
  result: string;
  createdAt: number;
}

