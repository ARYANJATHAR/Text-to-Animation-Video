import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { ManimIntegrationLayer } from './ManimIntegrationLayer';
import type { 
  ManimSegment, 
  TimelineSegment, 
  SynchronizationPoint,
  LayerComposition 
} from 'shared-types';

export interface MultiManimCompositionProps {
  segments: ManimSegment[];
  timeline: TimelineSegment[];
  synchronizationPoints: SynchronizationPoint[];
  layerCompositions: LayerComposition[];
  backgroundColor?: string;
  enableTransitions?: boolean;
  transitionDuration?: number;
}

export const MultiManimComposition: React.FC<MultiManimCompositionProps> = ({
  segments,
  timeline,
  synchronizationPoints,
  layerCompositions,
  backgroundColor = '#000000',
  enableTransitions = true,
  transitionDuration = 1.0
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Group segments by layer
  const layerGroups = groupSegmentsByLayer(segments, timeline, layerCompositions);
  
  // Calculate global transitions between major sections
  const sectionTransitions = calculateSectionTransitions(
    timeline, 
    synchronizationPoints, 
    fps, 
    transitionDuration
  );
  
  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Render each layer in order */}
      {layerGroups.map((layerGroup, layerIndex) => {
        const layerConfig = layerCompositions.find(lc => lc.layerIndex === layerIndex);
        const layerOpacity = calculateLayerOpacity(
          layerConfig, 
          frame, 
          fps, 
          sectionTransitions
        );
        
        return (
          <div
            key={`layer-${layerIndex}`}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              opacity: layerOpacity,
              mixBlendMode: layerConfig?.blendMode || 'normal',
            }}
          >
            <ManimIntegrationLayer
              segments={layerGroup.segments}
              timeline={layerGroup.timeline}
              synchronizationPoints={synchronizationPoints}
              layerOpacity={1}
              enableTransitions={enableTransitions}
            />
          </div>
        );
      })}
      
      {/* Render transition overlays */}
      {enableTransitions && (
        <TransitionOverlay
          transitions={sectionTransitions}
          currentFrame={frame}
          fps={fps}
        />
      )}
    </AbsoluteFill>
  );
};

// Helper component for transition effects
const TransitionOverlay: React.FC<{
  transitions: SectionTransition[];
  currentFrame: number;
  fps: number;
}> = ({ transitions, currentFrame, fps }) => {
  const activeTransition = transitions.find(t => 
    currentFrame >= t.startFrame && currentFrame <= t.endFrame
  );
  
  if (!activeTransition) return null;
  
  const progress = (currentFrame - activeTransition.startFrame) / 
                  (activeTransition.endFrame - activeTransition.startFrame);
  
  const opacity = interpolate(
    progress,
    [0, 0.5, 1],
    [0, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  return (
    <AbsoluteFill
      style={{
        backgroundColor: activeTransition.color || '#ffffff',
        opacity: opacity * 0.3,
        pointerEvents: 'none',
      }}
    />
  );
};

// Helper types and functions
interface LayerGroup {
  layerIndex: number;
  segments: ManimSegment[];
  timeline: TimelineSegment[];
}

interface SectionTransition {
  id: string;
  startFrame: number;
  endFrame: number;
  type: 'fade' | 'slide' | 'zoom';
  color?: string;
}

function groupSegmentsByLayer(
  segments: ManimSegment[],
  timeline: TimelineSegment[],
  layerCompositions: LayerComposition[]
): LayerGroup[] {
  const groups: Map<number, LayerGroup> = new Map();
  
  // Initialize layer groups
  layerCompositions.forEach(lc => {
    if (!groups.has(lc.layerIndex)) {
      groups.set(lc.layerIndex, {
        layerIndex: lc.layerIndex,
        segments: [],
        timeline: []
      });
    }
  });
  
  // Assign segments to layers
  timeline.forEach(timelineSegment => {
    if (timelineSegment.technology === 'manim') {
      const layerConfig = layerCompositions.find(lc => 
        lc.service === 'manim' && 
        Math.abs(lc.startTime - timelineSegment.startTime) < 0.1
      );
      
      if (layerConfig) {
        const group = groups.get(layerConfig.layerIndex);
        if (group) {
          const manimSegment = segments.find(s => s.id === timelineSegment.id);
          if (manimSegment) {
            group.segments.push(manimSegment);
            group.timeline.push(timelineSegment);
          }
        }
      }
    }
  });
  
  return Array.from(groups.values()).sort((a, b) => a.layerIndex - b.layerIndex);
}

function calculateSectionTransitions(
  timeline: TimelineSegment[],
  synchronizationPoints: SynchronizationPoint[],
  fps: number,
  transitionDuration: number
): SectionTransition[] {
  const transitions: SectionTransition[] = [];
  
  // Create transitions at synchronization points
  synchronizationPoints.forEach((syncPoint, index) => {
    if (syncPoint.event === 'section_transition') {
      const startFrame = Math.floor((syncPoint.timestamp - transitionDuration / 2) * fps);
      const endFrame = Math.floor((syncPoint.timestamp + transitionDuration / 2) * fps);
      
      transitions.push({
        id: `transition-${index}`,
        startFrame,
        endFrame,
        type: 'fade',
        color: syncPoint.properties?.color as string
      });
    }
  });
  
  return transitions;
}

function calculateLayerOpacity(
  layerConfig: LayerComposition | undefined,
  currentFrame: number,
  fps: number,
  transitions: SectionTransition[]
): number {
  if (!layerConfig) return 1;
  
  const startFrame = Math.floor(layerConfig.startTime * fps);
  const endFrame = Math.floor((layerConfig.startTime + layerConfig.duration) * fps);
  
  // Check if layer should be visible
  if (currentFrame < startFrame || currentFrame > endFrame) {
    return 0;
  }
  
  // Apply base opacity
  let opacity = layerConfig.opacity;
  
  // Apply transition effects
  const activeTransition = transitions.find(t => 
    currentFrame >= t.startFrame && currentFrame <= t.endFrame
  );
  
  if (activeTransition) {
    const transitionProgress = (currentFrame - activeTransition.startFrame) / 
                              (activeTransition.endFrame - activeTransition.startFrame);
    
    // Modify opacity based on transition
    opacity *= interpolate(
      transitionProgress,
      [0, 0.5, 1],
      [1, 0.5, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
  }
  
  return opacity;
}