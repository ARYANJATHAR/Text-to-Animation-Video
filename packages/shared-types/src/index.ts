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

// Service interfaces
export interface RemotionService {
  createComposition(plan: AnimationPlan): Promise<RemotionComposition>;
  renderVideo(composition: RemotionComposition): Promise<VideoOutput>;
  integrateThreeJSScene(scene: ThreeJSScene): Promise<RemotionComponent>;
  integrateManimSegment(segment: ManimSegment): Promise<RemotionComponent>;
  renderWithLambda(composition: RemotionComposition): Promise<VideoOutput>;
}

export interface ThreeJSService {
  generateScene(concepts: Concept[]): Promise<ThreeJSScene>;
  animateNetworkTopology(topology: NetworkTopology): Promise<Animation>;
  createClientServerVisualization(model: ClientServerModel): Promise<Scene>;
  exportToRemotionComponent(): Promise<RemotionComponent>;
  validateWebGLSupport(): boolean;
}

export interface ManimService {
  generateDiagram(flowData: FlowData): Promise<ManimAnimation>;
  createProcessFlow(steps: ProcessStep[]): Promise<ManimAnimation>;
  renderToVideo(animation: ManimAnimation): Promise<VideoSegment>;
  exportForRemotionIntegration(): Promise<VideoSegment>;
  validatePythonEnvironment(): Promise<boolean>;
}

export interface ContentAnalysisService {
  analyzeTopic(input: string): Promise<TopicAnalysis>;
  classifyAnimationType(analysis: TopicAnalysis): AnimationType[];
  generateAnimationPlan(classification: AnimationType[]): Promise<AnimationPlan>;
  extractConcepts(text: string): Promise<Concept[]>;
}

export interface VideoOrchestrator {
  processGenerationRequest(request: GenerationRequest): Promise<VideoOutput>;
  coordinateServices(plan: AnimationPlan): Promise<ServiceOutputs>;
  composeVideo(outputs: ServiceOutputs): Promise<VideoOutput>;
  handleHybridGeneration(plan: HybridAnimationPlan): Promise<VideoOutput>;
}

export interface ErrorRecoverySystem {
  detectError(error: SystemError): ErrorClassification;
  attemptRecovery(classification: ErrorClassification): Promise<RecoveryResult>;
  provideFallback(originalRequest: GenerationRequest): Promise<FallbackOutput>;
  notifyUser(error: SystemError, recovery: RecoveryResult): void;
}

// Supporting types for service interfaces
export interface RemotionComposition {
  id: string;
  name: string;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  components: RemotionComponent[];
  props: Record<string, any>;
}

export interface RemotionComponent {
  id: string;
  type: 'sequence' | 'video' | 'audio' | 'image' | 'text' | 'threejs' | 'manim';
  from: number;
  durationInFrames: number;
  props: Record<string, any>;
  style?: Record<string, any>;
}

export interface ThreeJSScene {
  id: string;
  name: string;
  objects: ThreeJSObject[];
  camera: CameraConfiguration;
  lighting: LightingConfiguration;
  animations: ThreeJSAnimation[];
  duration: number;
}

export interface ThreeJSObject {
  id: string;
  type: 'mesh' | 'group' | 'light' | 'camera';
  geometry?: GeometryConfiguration;
  material?: MaterialConfiguration;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  children?: ThreeJSObject[];
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface GeometryConfiguration {
  type: 'box' | 'sphere' | 'cylinder' | 'plane' | 'custom';
  parameters: Record<string, any>;
}

export interface MaterialConfiguration {
  type: 'basic' | 'standard' | 'physical' | 'custom';
  properties: Record<string, any>;
}

export interface CameraConfiguration {
  type: 'perspective' | 'orthographic';
  position: Vector3;
  target: Vector3;
  fov?: number;
  near: number;
  far: number;
}

export interface LightingConfiguration {
  ambient: {
    color: string;
    intensity: number;
  };
  directional: Array<{
    color: string;
    intensity: number;
    position: Vector3;
    target: Vector3;
  }>;
}

export interface ThreeJSAnimation {
  id: string;
  targetId: string;
  property: string;
  keyframes: Keyframe[];
  duration: number;
  easing: string;
}

export interface Keyframe {
  time: number;
  value: any;
}

export interface Scene {
  id: string;
  name: string;
  duration: number;
  objects: ThreeJSObject[];
  animations: ThreeJSAnimation[];
}

export interface Animation {
  id: string;
  name: string;
  duration: number;
  keyframes: Keyframe[];
  targets: string[];
}

export interface NetworkTopology {
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  layout: 'hierarchical' | 'circular' | 'force' | 'grid';
}

export interface NetworkNode {
  id: string;
  label: string;
  type: 'client' | 'server' | 'database' | 'cdn' | 'router';
  position?: Vector3;
  properties: Record<string, any>;
}

export interface NetworkConnection {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'http' | 'tcp' | 'udp' | 'websocket';
  bidirectional: boolean;
  properties: Record<string, any>;
}

export interface ClientServerModel {
  clients: ClientNode[];
  servers: ServerNode[];
  connections: ConnectionFlow[];
  dataFlow: DataFlowStep[];
}

export interface ClientNode {
  id: string;
  type: 'browser' | 'mobile' | 'desktop';
  position: Vector3;
  properties: Record<string, any>;
}

export interface ServerNode {
  id: string;
  type: 'web' | 'api' | 'database' | 'cache';
  position: Vector3;
  properties: Record<string, any>;
}

export interface ConnectionFlow {
  id: string;
  fromId: string;
  toId: string;
  protocol: string;
  animated: boolean;
}

export interface DataFlowStep {
  id: string;
  sequence: number;
  description: string;
  fromId: string;
  toId: string;
  duration: number;
}

export interface ManimAnimation {
  id: string;
  name: string;
  scenes: ManimScene[];
  duration: number;
  resolution: Resolution;
  fps: number;
}

export interface ManimScene {
  id: string;
  name: string;
  objects: ManimObject[];
  animations: ManimAnimationStep[];
  duration: number;
}

export interface ManimObject {
  id: string;
  type: 'text' | 'shape' | 'graph' | 'diagram' | 'equation';
  properties: Record<string, any>;
  position: Vector2;
  style: ManimStyle;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface ManimStyle {
  color: string;
  strokeWidth: number;
  fillOpacity: number;
  strokeOpacity: number;
  fontSize?: number;
  fontFamily?: string;
}

export interface ManimAnimationStep {
  id: string;
  type: 'create' | 'transform' | 'move' | 'fade' | 'write';
  targetId: string;
  duration: number;
  properties: Record<string, any>;
}

export interface VideoSegment {
  id: string;
  filePath: string;
  duration: number;
  resolution: Resolution;
  format: 'mp4' | 'webm' | 'mov';
  startTime: number;
  endTime: number;
}

export interface FlowData {
  steps: FlowStep[];
  connections: FlowConnection[];
  title: string;
  description: string;
}

export interface FlowStep {
  id: string;
  label: string;
  type: 'process' | 'decision' | 'start' | 'end' | 'data';
  position: Vector2;
  properties: Record<string, any>;
}

export interface FlowConnection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  type: 'normal' | 'conditional' | 'loop';
}

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  sequence: number;
  duration: number;
  type: 'action' | 'decision' | 'wait' | 'parallel';
}

export interface ServiceOutputs {
  remotionComposition?: RemotionComposition;
  threeJSScenes?: ThreeJSScene[];
  manimSegments?: ManimSegment[];
  audioTrack?: AudioTrack;
}

export interface ManimSegment {
  id: string;
  videoSegment: VideoSegment;
  metadata: ManimMetadata;
  integrationPoints: IntegrationPoint[];
}

export interface ManimMetadata {
  sceneCount: number;
  objectCount: number;
  animationCount: number;
  complexity: 'simple' | 'moderate' | 'complex';
  renderTime: number;
}

export interface IntegrationPoint {
  id: string;
  timestamp: number;
  type: 'sync' | 'transition' | 'overlay';
  properties: Record<string, any>;
}

export interface AudioTrack {
  id: string;
  filePath: string;
  duration: number;
  format: 'mp3' | 'wav' | 'aac';
  sampleRate: number;
  channels: number;
  volume: number;
}

export interface HybridAnimationPlan extends AnimationPlan {
  integrationStrategy: IntegrationStrategy;
  synchronizationPoints: SynchronizationPoint[];
  layerComposition: LayerComposition[];
}

export interface IntegrationStrategy {
  type: 'sequential' | 'parallel' | 'layered' | 'mixed';
  transitionStyle: 'smooth' | 'cut' | 'fade' | 'custom';
  timingMode: 'synchronized' | 'independent' | 'cascaded';
}

export interface SynchronizationPoint {
  id: string;
  timestamp: number;
  services: string[];
  event: string;
  properties: Record<string, any>;
}

export interface LayerComposition {
  id: string;
  layerIndex: number;
  service: 'remotion' | 'threejs' | 'manim';
  blendMode: 'normal' | 'multiply' | 'overlay' | 'screen';
  opacity: number;
  startTime: number;
  duration: number;
}

export interface FallbackOutput {
  type: 'simplified' | 'template' | 'static' | 'error_message';
  content: VideoOutput | string;
  reason: string;
  originalRequest: GenerationRequest;
}

// Enhanced error handling types
export interface ErrorContext {
  service: string;
  operation: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  environment: 'development' | 'staging' | 'production';
}

export interface ErrorRecoveryStrategy {
  id: string;
  errorType: string;
  priority: number;
  maxRetries: number;
  retryDelay: number;
  fallbackAction: string;
  conditions: ErrorCondition[];
}

export interface ErrorCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface SystemHealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  responseTime: number;
  errorRate: number;
  details: Record<string, any>;
}