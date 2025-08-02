// Core data models
export interface Topic {
  id: string;
  title: string;
  description: string;
  concepts: Concept[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
}

export interface Concept {
  id: string;
  name: string;
  type: 'spatial' | 'logical' | 'temporal' | 'hierarchical';
  visualizationType: 'remotion' | 'threejs' | 'manim';
  relationships: ConceptRelationship[];
  metadata: ConceptMetadata;
}

export interface ConceptRelationship {
  sourceId: string;
  targetId: string;
  type: 'depends_on' | 'part_of' | 'leads_to' | 'interacts_with';
  strength: number;
}

export interface ConceptMetadata {
  complexity: 'simple' | 'moderate' | 'complex';
  visualElements: string[];
  keywords: string[];
}

// Animation configuration models
export interface AnimationConfiguration {
  id: string;
  topicId: string;
  technologies: AnimationTechnology[];
  timeline: TimelineConfiguration;
  styling: StyleConfiguration;
  output: OutputConfiguration;
}

export interface AnimationTechnology {
  type: 'remotion' | 'threejs' | 'manim';
  version: string;
  config: Record<string, any>;
}

export interface TimelineConfiguration {
  totalDuration: number;
  segments: TimelineSegment[];
  transitions: TransitionConfiguration[];
}

export interface TimelineSegment {
  id: string;
  startTime: number;
  duration: number;
  technology: 'remotion' | 'threejs' | 'manim';
  content: SegmentContent;
  animations: AnimationDefinition[];
}

export interface SegmentContent {
  type: 'text' | '3d_scene' | 'diagram' | 'hybrid';
  data: Record<string, any>;
}

export interface AnimationDefinition {
  id: string;
  type: string;
  properties: Record<string, any>;
  timing: {
    delay: number;
    duration: number;
    easing: string;
  };
}

export interface TransitionConfiguration {
  id: string;
  fromSegmentId: string;
  toSegmentId: string;
  type: 'fade' | 'slide' | 'zoom' | 'custom';
  duration: number;
  properties: Record<string, any>;
}

export interface StyleConfiguration {
  theme: 'light' | 'dark' | 'custom';
  colors: ColorPalette;
  typography: TypographySettings;
  spacing: SpacingSettings;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  error: string;
  warning: string;
  success: string;
}

export interface TypographySettings {
  fontFamily: string;
  fontSize: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  fontWeight: {
    normal: number;
    bold: number;
  };
}

export interface SpacingSettings {
  small: number;
  medium: number;
  large: number;
  xlarge: number;
}

export interface OutputConfiguration {
  format: 'mp4' | 'webm';
  resolution: Resolution;
  aspectRatio: AspectRatio;
  quality: 'draft' | 'standard' | 'high';
  fps: number;
}

export interface Resolution {
  width: number;
  height: number;
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';

// Video output models
export interface VideoOutput {
  id: string;
  sessionId: string;
  format: 'mp4' | 'webm';
  resolution: Resolution;
  aspectRatio: AspectRatio;
  duration: number;
  fileSize: number;
  url: string;
  thumbnailUrl: string;
  metadata: VideoMetadata;
}

export interface VideoMetadata {
  generatedAt: Date;
  technologies: string[];
  topic: string;
  concepts: string[];
  renderTime: number;
  quality: 'draft' | 'standard' | 'high';
}

// API request/response types
export interface GenerationRequest {
  topicInput: string;
  configuration: Partial<AnimationConfiguration>;
  userId?: string;
}

export interface GenerationResponse {
  sessionId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  videoOutput?: VideoOutput;
  error?: string;
}

// Content analysis types
export interface TopicAnalysis {
  concepts: Concept[];
  entities: Entity[];
  relationships: Relationship[];
  complexity: 'simple' | 'moderate' | 'complex';
  visualElements: VisualElement[];
}

export interface Entity {
  id: string;
  name: string;
  type: string;
  confidence: number;
}

export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  confidence: number;
}

export interface VisualElement {
  id: string;
  type: '3d_model' | 'diagram' | 'animation' | 'text';
  description: string;
  technology: 'remotion' | 'threejs' | 'manim';
}

export type AnimationType = 'remotion' | 'threejs' | 'manim' | 'hybrid';

export interface AnimationPlan {
  primaryTechnology: 'remotion' | 'threejs' | 'manim';
  secondaryTechnologies: string[];
  timeline: TimelineSegment[];
  compositionStrategy: CompositionStrategy;
}

export interface CompositionStrategy {
  type: 'sequential' | 'parallel' | 'layered';
  blendMode: 'normal' | 'multiply' | 'overlay';
  transitions: string[];
}

// TTS Configuration
export interface TTSConfiguration {
  enabled: boolean;
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
}

// Error handling types
export interface SystemError {
  id: string;
  type: 'input' | 'processing' | 'rendering' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: Record<string, any>;
  timestamp: Date;
}

export interface ErrorClassification {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'input' | 'processing' | 'rendering' | 'system';
  recoverable: boolean;
  suggestedActions: string[];
}

export interface RecoveryResult {
  success: boolean;
  action: string;
  fallbackUsed: boolean;
  message: string;
}