import type { 
  ManimSegment, 
  TimelineSegment, 
  SynchronizationPoint,
  LayerComposition,
  VideoSegment,
  ManimMetadata,
  IntegrationPoint
} from 'shared-types';

export interface ManimIntegrationConfig {
  enableAutoSync: boolean;
  defaultTransitionDuration: number;
  maxConcurrentSegments: number;
  qualitySettings: {
    resolution: 'auto' | 'match_composition' | 'original';
    scaling: 'fit' | 'fill' | 'stretch';
    interpolation: 'linear' | 'cubic' | 'lanczos';
  };
}

export interface TimingSynchronizationResult {
  adjustedSegments: ManimSegment[];
  synchronizationPoints: SynchronizationPoint[];
  conflicts: TimingConflict[];
}

export interface TimingConflict {
  id: string;
  type: 'overlap' | 'gap' | 'duration_mismatch';
  segmentIds: string[];
  severity: 'low' | 'medium' | 'high';
  suggestedResolution: string;
}

export class ManimIntegrationService {
  private config: ManimIntegrationConfig;
  
  constructor(config: Partial<ManimIntegrationConfig> = {}) {
    this.config = {
      enableAutoSync: true,
      defaultTransitionDuration: 0.5,
      maxConcurrentSegments: 3,
      qualitySettings: {
        resolution: 'match_composition',
        scaling: 'fit',
        interpolation: 'cubic'
      },
      ...config
    };
  }
  
  /**
   * Import Manim video segments and prepare them for Remotion integration
   */
  async importManimSegments(
    videoSegments: VideoSegment[],
    metadata: ManimMetadata[]
  ): Promise<ManimSegment[]> {
    const segments: ManimSegment[] = [];
    
    for (let i = 0; i < videoSegments.length; i++) {
      const videoSegment = videoSegments[i];
      const segmentMetadata = metadata[i] || this.createDefaultMetadata();
      
      // Validate video segment
      await this.validateVideoSegment(videoSegment);
      
      // Create integration points
      const integrationPoints = this.generateIntegrationPoints(
        videoSegment, 
        segmentMetadata
      );
      
      const manimSegment: ManimSegment = {
        id: `manim_segment_${Date.now()}_${i}`,
        videoSegment,
        metadata: segmentMetadata,
        integrationPoints
      };
      
      segments.push(manimSegment);
    }
    
    return segments;
  }
  
  /**
   * Synchronize timing between Manim segments and Remotion timeline
   */
  synchronizeWithTimeline(
    segments: ManimSegment[],
    timeline: TimelineSegment[]
  ): TimingSynchronizationResult {
    const adjustedSegments: ManimSegment[] = [];
    const synchronizationPoints: SynchronizationPoint[] = [];
    const conflicts: TimingConflict[] = [];
    
    // Find Manim segments in timeline
    const manimTimelineSegments = timeline.filter(ts => ts.technology === 'manim');
    
    for (const timelineSegment of manimTimelineSegments) {
      const matchingSegment = segments.find(s => s.id === timelineSegment.id);
      
      if (matchingSegment) {
        // Check for timing conflicts
        const conflict = this.detectTimingConflicts(
          matchingSegment,
          timelineSegment,
          adjustedSegments
        );
        
        if (conflict) {
          conflicts.push(conflict);
          
          // Apply automatic resolution if enabled
          if (this.config.enableAutoSync) {
            const resolvedSegment = this.resolveTimingConflict(
              matchingSegment,
              timelineSegment,
              conflict
            );
            adjustedSegments.push(resolvedSegment);
          } else {
            adjustedSegments.push(matchingSegment);
          }
        } else {
          // No conflicts, add segment as-is
          adjustedSegments.push(matchingSegment);
        }
        
        // Create synchronization points
        const syncPoints = this.createSynchronizationPoints(
          matchingSegment,
          timelineSegment
        );
        synchronizationPoints.push(...syncPoints);
      }
    }
    
    return {
      adjustedSegments,
      synchronizationPoints,
      conflicts
    };
  }
  
  /**
   * Combine multiple Manim diagrams into layer compositions
   */
  createLayerCompositions(
    segments: ManimSegment[],
    timeline: TimelineSegment[]
  ): LayerComposition[] {
    const compositions: LayerComposition[] = [];
    let layerIndex = 0;
    
    // Group segments by timing and content type
    const segmentGroups = this.groupSegmentsByContent(segments, timeline);
    
    for (const group of segmentGroups) {
      // Determine if segments can be layered or need sequential playback
      const canLayer = this.canLayerSegments(group.segments);
      
      if (canLayer && group.segments.length <= this.config.maxConcurrentSegments) {
        // Create layered composition
        for (const segment of group.segments) {
          const timelineSegment = timeline.find(ts => ts.id === segment.id);
          if (timelineSegment) {
            compositions.push({
              id: `layer_${layerIndex}_${segment.id}`,
              layerIndex,
              service: 'manim',
              blendMode: this.determineBlendMode(segment),
              opacity: this.calculateOptimalOpacity(segment, group.segments),
              startTime: timelineSegment.startTime,
              duration: timelineSegment.duration
            });
          }
        }
        layerIndex++;
      } else {
        // Create sequential compositions
        for (const segment of group.segments) {
          const timelineSegment = timeline.find(ts => ts.id === segment.id);
          if (timelineSegment) {
            compositions.push({
              id: `layer_${layerIndex}_${segment.id}`,
              layerIndex: layerIndex++,
              service: 'manim',
              blendMode: 'normal',
              opacity: 1.0,
              startTime: timelineSegment.startTime,
              duration: timelineSegment.duration
            });
          }
        }
      }
    }
    
    return compositions;
  }
  
  /**
   * Validate video segment for Remotion compatibility
   */
  private async validateVideoSegment(segment: VideoSegment): Promise<void> {
    // Check file format
    const supportedFormats = ['mp4', 'webm', 'mov'];
    if (!supportedFormats.includes(segment.format)) {
      throw new Error(`Unsupported video format: ${segment.format}`);
    }
    
    // Check resolution
    if (segment.resolution.width <= 0 || segment.resolution.height <= 0) {
      throw new Error('Invalid video resolution');
    }
    
    // Check duration
    if (segment.duration <= 0) {
      throw new Error('Invalid video duration');
    }
    
    // TODO: Add file existence check
    // TODO: Add codec compatibility check
  }
  
  private createDefaultMetadata(): ManimMetadata {
    return {
      sceneCount: 1,
      objectCount: 1,
      animationCount: 1,
      complexity: 'moderate',
      renderTime: 0
    };
  }
  
  private generateIntegrationPoints(
    videoSegment: VideoSegment,
    metadata: ManimMetadata
  ): IntegrationPoint[] {
    const points: IntegrationPoint[] = [];
    
    // Add start point
    points.push({
      id: `start_${videoSegment.id}`,
      timestamp: 0,
      type: 'sync',
      properties: { event: 'segment_start' }
    });
    
    // Add mid-points based on complexity
    if (metadata.complexity === 'complex') {
      const midPoint = videoSegment.duration / 2;
      points.push({
        id: `mid_${videoSegment.id}`,
        timestamp: midPoint,
        type: 'sync',
        properties: { event: 'segment_midpoint' }
      });
    }
    
    // Add end point
    points.push({
      id: `end_${videoSegment.id}`,
      timestamp: videoSegment.duration,
      type: 'sync',
      properties: { event: 'segment_end' }
    });
    
    return points;
  }
  
  private detectTimingConflicts(
    segment: ManimSegment,
    timelineSegment: TimelineSegment,
    existingSegments: ManimSegment[]
  ): TimingConflict | null {
    // Check for overlaps with existing segments
    for (const existing of existingSegments) {
      const existingTimeline = timelineSegment; // Simplified for this example
      
      const overlapStart = Math.max(timelineSegment.startTime, existingTimeline.startTime);
      const overlapEnd = Math.min(
        timelineSegment.startTime + timelineSegment.duration,
        existingTimeline.startTime + existingTimeline.duration
      );
      
      if (overlapStart < overlapEnd) {
        return {
          id: `conflict_${segment.id}_${existing.id}`,
          type: 'overlap',
          segmentIds: [segment.id, existing.id],
          severity: 'medium',
          suggestedResolution: 'Adjust timing or use layering'
        };
      }
    }
    
    // Check for duration mismatches
    if (Math.abs(segment.videoSegment.duration - timelineSegment.duration) > 0.5) {
      return {
        id: `duration_mismatch_${segment.id}`,
        type: 'duration_mismatch',
        segmentIds: [segment.id],
        severity: 'low',
        suggestedResolution: 'Adjust timeline duration or trim video'
      };
    }
    
    return null;
  }
  
  private resolveTimingConflict(
    segment: ManimSegment,
    timelineSegment: TimelineSegment,
    conflict: TimingConflict
  ): ManimSegment {
    // Simple resolution: adjust segment timing
    const adjustedSegment = { ...segment };
    
    switch (conflict.type) {
      case 'overlap':
        // Shift segment slightly
        adjustedSegment.videoSegment = {
          ...segment.videoSegment,
          startTime: segment.videoSegment.startTime + 0.1
        };
        break;
        
      case 'duration_mismatch':
        // Adjust duration to match timeline
        adjustedSegment.videoSegment = {
          ...segment.videoSegment,
          duration: timelineSegment.duration
        };
        break;
    }
    
    return adjustedSegment;
  }
  
  private createSynchronizationPoints(
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
  
  private groupSegmentsByContent(
    segments: ManimSegment[],
    timeline: TimelineSegment[]
  ): Array<{ segments: ManimSegment[]; timeline: TimelineSegment[] }> {
    const groups: Map<string, { segments: ManimSegment[]; timeline: TimelineSegment[] }> = new Map();
    
    for (const segment of segments) {
      const contentType = segment.metadata.complexity;
      const key = `${contentType}_${Math.floor(segment.videoSegment.startTime / 10)}`;
      
      if (!groups.has(key)) {
        groups.set(key, { segments: [], timeline: [] });
      }
      
      const group = groups.get(key)!;
      group.segments.push(segment);
      
      const timelineSegment = timeline.find(ts => ts.id === segment.id);
      if (timelineSegment) {
        group.timeline.push(timelineSegment);
      }
    }
    
    return Array.from(groups.values());
  }
  
  private canLayerSegments(segments: ManimSegment[]): boolean {
    // Simple heuristic: can layer if segments have different diagram types
    const diagramTypes = new Set(
      segments.map(s => s.metadata.sceneCount)
    );
    
    return diagramTypes.size === segments.length && segments.length <= 3;
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
  
  private calculateOptimalOpacity(
    segment: ManimSegment,
    allSegments: ManimSegment[]
  ): number {
    // Reduce opacity when multiple segments are layered
    const baseOpacity = 1.0;
    const layerCount = allSegments.length;
    
    if (layerCount === 1) return baseOpacity;
    if (layerCount === 2) return 0.8;
    if (layerCount === 3) return 0.6;
    
    return Math.max(0.4, baseOpacity / layerCount);
  }
}