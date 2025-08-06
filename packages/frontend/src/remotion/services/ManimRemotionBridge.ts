import type { 
  ManimSegment, 
  VideoSegment, 
  TimelineSegment,
  RemotionComposition,
  RemotionComponent,
  SynchronizationPoint,
  LayerComposition,
  ManimMetadata,
  IntegrationPoint
} from 'shared-types';

export interface ManimRemotionBridgeConfig {
  manimServiceUrl: string;
  videoStoragePath: string;
  enableCaching: boolean;
  maxRetries: number;
  timeoutMs: number;
}

export interface ImportResult {
  success: boolean;
  segments: ManimSegment[];
  errors: string[];
  warnings: string[];
}

export interface SynchronizationResult {
  synchronized: boolean;
  adjustedSegments: ManimSegment[];
  conflicts: TimingConflict[];
  syncPoints: SynchronizationPoint[];
}

export interface TimingConflict {
  id: string;
  type: 'overlap' | 'gap' | 'duration_mismatch';
  segmentIds: string[];
  severity: 'low' | 'medium' | 'high';
  resolution: string;
}

export interface CompositionIntegrationResult {
  composition: RemotionComposition;
  components: RemotionComponent[];
  layerCompositions: LayerComposition[];
  metadata: IntegrationMetadata;
}

export interface IntegrationMetadata {
  totalSegments: number;
  totalDuration: number;
  technologies: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  renderingHints: RenderingHint[];
}

export interface RenderingHint {
  type: 'performance' | 'quality' | 'compatibility';
  message: string;
  impact: 'low' | 'medium' | 'high';
}

/**
 * Bridge service for integrating Manim-generated content with Remotion compositions
 */
export class ManimRemotionBridge {
  private config: ManimRemotionBridgeConfig;
  private cache: Map<string, ManimSegment> = new Map();

  constructor(config: Partial<ManimRemotionBridgeConfig> = {}) {
    this.config = {
      manimServiceUrl: 'http://localhost:5001',
      videoStoragePath: './output',
      enableCaching: true,
      maxRetries: 3,
      timeoutMs: 30000,
      ...config
    };
  }

  /**
   * Import Manim video segments and prepare them for Remotion integration
   */
  async importManimSegments(animationIds: string[]): Promise<ImportResult> {
    const segments: ManimSegment[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const animationId of animationIds) {
      try {
        // Check cache first
        if (this.config.enableCaching && this.cache.has(animationId)) {
          segments.push(this.cache.get(animationId)!);
          continue;
        }

        // Fetch video segment from Manim service
        const segment = await this.fetchManimSegment(animationId);
        
        // Validate segment for Remotion compatibility
        const validation = await this.validateSegmentCompatibility(segment);
        if (!validation.isValid) {
          warnings.push(`Segment ${animationId}: ${validation.issues.join(', ')}`);
          
          // Apply automatic fixes if possible
          const fixedSegment = await this.applyCompatibilityFixes(segment, validation.issues);
          segments.push(fixedSegment);
        } else {
          segments.push(segment);
        }

        // Cache the segment
        if (this.config.enableCaching) {
          this.cache.set(animationId, segment);
        }

      } catch (error) {
        errors.push(`Failed to import segment ${animationId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: errors.length === 0,
      segments,
      errors,
      warnings
    };
  }  /**
   *
 Synchronize Manim segments with Remotion timeline
   */
  async synchronizeWithRemotionTimeline(
    segments: ManimSegment[],
    timeline: TimelineSegment[]
  ): Promise<SynchronizationResult> {
    const adjustedSegments: ManimSegment[] = [];
    const conflicts: TimingConflict[] = [];
    const syncPoints: SynchronizationPoint[] = [];

    // Find Manim segments in timeline
    const manimTimelineSegments = timeline.filter(ts => ts.technology === 'manim');

    for (const timelineSegment of manimTimelineSegments) {
      const matchingSegment = segments.find(s => s.id === timelineSegment.id);
      
      if (!matchingSegment) {
        conflicts.push({
          id: `missing_${timelineSegment.id}`,
          type: 'gap',
          segmentIds: [timelineSegment.id],
          severity: 'high',
          resolution: 'Generate missing Manim segment or remove from timeline'
        });
        continue;
      }

      // Check for timing conflicts
      const conflict = this.detectTimingConflicts(matchingSegment, timelineSegment, adjustedSegments);
      if (conflict) {
        conflicts.push(conflict);
      }

      // Synchronize timing
      const synchronizedSegment = await this.synchronizeSegmentTiming(
        matchingSegment,
        timelineSegment
      );
      
      adjustedSegments.push(synchronizedSegment);

      // Create synchronization points
      const segmentSyncPoints = this.createSynchronizationPoints(
        synchronizedSegment,
        timelineSegment
      );
      syncPoints.push(...segmentSyncPoints);
    }

    return {
      synchronized: conflicts.length === 0,
      adjustedSegments,
      conflicts,
      syncPoints
    };
  }

  /**
   * Integrate multiple Manim segments into a single Remotion composition
   */
  async integrateIntoComposition(
    segments: ManimSegment[],
    timeline: TimelineSegment[],
    compositionConfig: {
      width: number;
      height: number;
      fps: number;
      durationInFrames: number;
    }
  ): Promise<CompositionIntegrationResult> {
    // Create base composition
    const composition: RemotionComposition = {
      id: `manim_integrated_${Date.now()}`,
      name: 'Manim Integrated Composition',
      durationInFrames: compositionConfig.durationInFrames,
      fps: compositionConfig.fps,
      width: compositionConfig.width,
      height: compositionConfig.height,
      components: [],
      props: {}
    };

    const components: RemotionComponent[] = [];
    const layerCompositions: LayerComposition[] = [];

    // Process each segment
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const timelineSegment = timeline.find(ts => ts.id === segment.id);
      
      if (!timelineSegment) continue;

      // Create Remotion component for this segment
      const component = await this.createRemotionComponent(
        segment,
        timelineSegment,
        compositionConfig.fps
      );
      components.push(component);

      // Create layer composition
      const layerComposition = this.createLayerComposition(
        segment,
        timelineSegment,
        i
      );
      layerCompositions.push(layerComposition);
    }

    // Add components to composition
    composition.components = components;

    // Generate integration metadata
    const metadata = this.generateIntegrationMetadata(segments, timeline);

    return {
      composition,
      components,
      layerCompositions,
      metadata
    };
  }  
/**
   * Create seamless transitions between Manim segments
   */
  async createSeamlessTransitions(
    segments: ManimSegment[],
    timeline: TimelineSegment[]
  ): Promise<RemotionComponent[]> {
    const transitionComponents: RemotionComponent[] = [];

    for (let i = 0; i < segments.length - 1; i++) {
      const currentSegment = segments[i];
      const nextSegment = segments[i + 1];
      
      const currentTimeline = timeline.find(ts => ts.id === currentSegment.id);
      const nextTimeline = timeline.find(ts => ts.id === nextSegment.id);

      if (!currentTimeline || !nextTimeline) continue;

      // Calculate transition timing
      const transitionStart = currentTimeline.startTime + currentTimeline.duration;
      const transitionEnd = nextTimeline.startTime;
      const transitionDuration = transitionEnd - transitionStart;

      if (transitionDuration > 0) {
        // Create transition component
        const transitionComponent = this.createTransitionComponent(
          currentSegment,
          nextSegment,
          transitionStart,
          transitionDuration
        );
        
        transitionComponents.push(transitionComponent);
      }
    }

    return transitionComponents;
  }

  // Private helper methods

  private async fetchManimSegment(animationId: string): Promise<ManimSegment> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      // Get animation status
      const statusResponse = await fetch(
        `${this.config.manimServiceUrl}/status/${animationId}`,
        { signal: controller.signal }
      );

      if (!statusResponse.ok) {
        throw new Error(`Failed to get animation status: ${statusResponse.statusText}`);
      }

      const status = await statusResponse.json();

      if (status.status !== 'completed') {
        throw new Error(`Animation not ready: ${status.status}`);
      }

      // Create video segment
      const videoSegment: VideoSegment = {
        id: animationId,
        filePath: status.file_path,
        duration: status.duration || 10,
        resolution: {
          width: status.resolution?.[0] || 1920,
          height: status.resolution?.[1] || 1080
        },
        format: 'mp4',
        startTime: 0,
        endTime: status.duration || 10
      };

      // Create metadata
      const metadata: ManimMetadata = {
        sceneCount: 1,
        objectCount: 1,
        animationCount: 1,
        complexity: 'moderate',
        renderTime: 0
      };

      // Create integration points
      const integrationPoints: IntegrationPoint[] = [
        {
          id: `start_${animationId}`,
          timestamp: 0,
          type: 'sync',
          properties: { event: 'segment_start' }
        },
        {
          id: `end_${animationId}`,
          timestamp: videoSegment.duration,
          type: 'sync',
          properties: { event: 'segment_end' }
        }
      ];

      return {
        id: animationId,
        videoSegment,
        metadata,
        integrationPoints
      };

    } finally {
      clearTimeout(timeoutId);
    }
  }  pri
vate async validateSegmentCompatibility(segment: ManimSegment): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    // Check video format
    if (!['mp4', 'webm', 'mov'].includes(segment.videoSegment.format)) {
      issues.push(`Unsupported format: ${segment.videoSegment.format}`);
    }

    // Check resolution
    const { width, height } = segment.videoSegment.resolution;
    if (width <= 0 || height <= 0) {
      issues.push('Invalid resolution');
    }

    // Check duration
    if (segment.videoSegment.duration <= 0) {
      issues.push('Invalid duration');
    }

    // Check file existence (simplified check)
    if (!segment.videoSegment.filePath) {
      issues.push('Missing file path');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  private async applyCompatibilityFixes(
    segment: ManimSegment,
    issues: string[]
  ): Promise<ManimSegment> {
    const fixedSegment = { ...segment };

    for (const issue of issues) {
      if (issue.includes('Invalid duration')) {
        fixedSegment.videoSegment.duration = 10; // Default duration
      }
      
      if (issue.includes('Invalid resolution')) {
        fixedSegment.videoSegment.resolution = { width: 1920, height: 1080 };
      }
    }

    return fixedSegment;
  }

  private detectTimingConflicts(
    segment: ManimSegment,
    timelineSegment: TimelineSegment,
    existingSegments: ManimSegment[]
  ): TimingConflict | null {
    // Check for overlaps
    for (const existing of existingSegments) {
      const existingTimeline = timelineSegment; // Simplified
      
      const overlapStart = Math.max(timelineSegment.startTime, existingTimeline.startTime);
      const overlapEnd = Math.min(
        timelineSegment.startTime + timelineSegment.duration,
        existingTimeline.startTime + existingTimeline.duration
      );

      if (overlapStart < overlapEnd) {
        return {
          id: `overlap_${segment.id}_${existing.id}`,
          type: 'overlap',
          segmentIds: [segment.id, existing.id],
          severity: 'medium',
          resolution: 'Adjust timing or use layering'
        };
      }
    }

    return null;
  }

  private async synchronizeSegmentTiming(
    segment: ManimSegment,
    timelineSegment: TimelineSegment
  ): Promise<ManimSegment> {
    const synchronizedSegment = { ...segment };
    
    // Adjust video segment timing to match timeline
    synchronizedSegment.videoSegment = {
      ...segment.videoSegment,
      startTime: timelineSegment.startTime,
      endTime: timelineSegment.startTime + timelineSegment.duration,
      duration: timelineSegment.duration
    };

    return synchronizedSegment;
  }  pr
ivate createSynchronizationPoints(
    segment: ManimSegment,
    timelineSegment: TimelineSegment
  ): SynchronizationPoint[] {
    return [
      {
        id: `sync_${segment.id}_start`,
        timestamp: timelineSegment.startTime,
        services: ['manim', 'remotion'],
        event: 'segment_start',
        properties: { segmentId: segment.id }
      },
      {
        id: `sync_${segment.id}_end`,
        timestamp: timelineSegment.startTime + timelineSegment.duration,
        services: ['manim', 'remotion'],
        event: 'segment_end',
        properties: { segmentId: segment.id }
      }
    ];
  }

  private async createRemotionComponent(
    segment: ManimSegment,
    timelineSegment: TimelineSegment,
    fps: number
  ): Promise<RemotionComponent> {
    const startFrame = Math.floor(timelineSegment.startTime * fps);
    const durationInFrames = Math.floor(timelineSegment.duration * fps);

    return {
      id: `manim_component_${segment.id}`,
      type: 'manim',
      from: startFrame,
      durationInFrames,
      props: {
        src: segment.videoSegment.filePath,
        volume: 1,
        playbackRate: 1,
        muted: false,
        segment: segment
      },
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'contain'
      }
    };
  }

  private createLayerComposition(
    segment: ManimSegment,
    timelineSegment: TimelineSegment,
    layerIndex: number
  ): LayerComposition {
    return {
      id: `layer_${layerIndex}_${segment.id}`,
      layerIndex,
      service: 'manim',
      blendMode: this.determineBlendMode(segment),
      opacity: this.calculateOptimalOpacity(segment),
      startTime: timelineSegment.startTime,
      duration: timelineSegment.duration
    };
  }

  private createTransitionComponent(
    fromSegment: ManimSegment,
    toSegment: ManimSegment,
    startTime: number,
    duration: number
  ): RemotionComponent {
    return {
      id: `transition_${fromSegment.id}_${toSegment.id}`,
      type: 'video',
      from: Math.floor(startTime * 30), // Assuming 30fps
      durationInFrames: Math.floor(duration * 30),
      props: {
        transitionType: 'fade',
        fromSegment: fromSegment.id,
        toSegment: toSegment.id
      }
    };
  }

  private generateIntegrationMetadata(
    segments: ManimSegment[],
    timeline: TimelineSegment[]
  ): IntegrationMetadata {
    const totalDuration = Math.max(
      ...timeline.map(ts => ts.startTime + ts.duration)
    );

    const complexity = this.assessOverallComplexity(segments);
    const renderingHints = this.generateRenderingHints(segments, complexity);

    return {
      totalSegments: segments.length,
      totalDuration,
      technologies: ['manim', 'remotion'],
      complexity,
      renderingHints
    };
  }

  private determineBlendMode(segment: ManimSegment): 'normal' | 'multiply' | 'overlay' | 'screen' {
    switch (segment.metadata.complexity) {
      case 'simple':
        return 'normal';
      case 'complex':
        return 'overlay';
      default:
        return 'multiply';
    }
  }

  private calculateOptimalOpacity(segment: ManimSegment): number {
    switch (segment.metadata.complexity) {
      case 'simple':
        return 1.0;
      case 'complex':
        return 0.9;
      default:
        return 0.95;
    }
  }

  private assessOverallComplexity(segments: ManimSegment[]): 'simple' | 'moderate' | 'complex' {
    const complexityScores = segments.map(s => {
      switch (s.metadata.complexity) {
        case 'simple': return 1;
        case 'moderate': return 2;
        case 'complex': return 3;
        default: return 2;
      }
    });

    const averageScore = complexityScores.reduce((a, b) => a + b, 0) / complexityScores.length;

    if (averageScore <= 1.5) return 'simple';
    if (averageScore <= 2.5) return 'moderate';
    return 'complex';
  }

  private generateRenderingHints(
    segments: ManimSegment[],
    complexity: 'simple' | 'moderate' | 'complex'
  ): RenderingHint[] {
    const hints: RenderingHint[] = [];

    if (segments.length > 5) {
      hints.push({
        type: 'performance',
        message: 'Consider splitting into multiple compositions for better performance',
        impact: 'medium'
      });
    }

    if (complexity === 'complex') {
      hints.push({
        type: 'quality',
        message: 'Use higher quality settings for complex diagrams',
        impact: 'high'
      });
    }

    return hints;
  }
}