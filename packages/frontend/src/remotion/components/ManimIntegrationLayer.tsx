import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ManimVideoSegment } from './ManimVideoSegment';
import type { ManimSegment, TimelineSegment, SynchronizationPoint } from 'shared-types';

export interface ManimIntegrationLayerProps {
  segments: ManimSegment[];
  timeline: TimelineSegment[];
  synchronizationPoints?: SynchronizationPoint[];
  layerOpacity?: number;
  enableTransitions?: boolean;
}

export const ManimIntegrationLayer: React.FC<ManimIntegrationLayerProps> = ({
  segments,
  timeline,
  synchronizationPoints = [],
  layerOpacity = 1,
  enableTransitions = true
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Convert timeline segments to frame-based timing
  const frameBasedSegments = timeline
    .filter(segment => segment.technology === 'manim')
    .map(segment => {
      const startFrame = Math.floor(segment.startTime * fps);
      const endFrame = Math.floor((segment.startTime + segment.duration) * fps);
      
      // Find corresponding Manim segment
      const manimSegment = segments.find(ms => ms.id === segment.id);
      
      return {
        ...segment,
        startFrame,
        endFrame,
        manimSegment
      };
    })
    .filter(segment => segment.manimSegment);
  
  // Apply synchronization points
  const synchronizedSegments = frameBasedSegments.map(segment => {
    const syncPoint = synchronizationPoints.find(sp => 
      sp.services.includes('manim') && 
      Math.abs(sp.timestamp - segment.startTime) < 0.1
    );
    
    if (syncPoint) {
      const syncFrame = Math.floor(syncPoint.timestamp * fps);
      const adjustment = syncFrame - segment.startFrame;
      
      return {
        ...segment,
        startFrame: segment.startFrame + adjustment,
        endFrame: segment.endFrame + adjustment
      };
    }
    
    return segment;
  });
  
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: layerOpacity,
      }}
    >
      {synchronizedSegments.map((segment, index) => {
        if (!segment.manimSegment) return null;
        
        // Calculate position based on segment content and aspect ratio
        const position = calculateSegmentPosition(segment, index);
        
        // Calculate scale based on content type
        const scale = calculateSegmentScale(segment);
        
        // Determine blend mode based on content
        const blendMode = determineBlendMode(segment);
        
        return (
          <ManimVideoSegment
            key={segment.id}
            segment={segment.manimSegment}
            startFrame={segment.startFrame}
            endFrame={segment.endFrame}
            position={position}
            scale={scale}
            blendMode={blendMode}
            opacity={calculateSegmentOpacity(segment, frame, fps)}
          />
        );
      })}
    </div>
  );
};

// Helper functions
function calculateSegmentPosition(
  segment: any, 
  index: number
): { x: number; y: number } {
  // Position segments based on their content type and index
  const contentType = segment.content?.type || 'diagram';
  
  switch (contentType) {
    case 'diagram':
      return { x: 0, y: 0 }; // Center position
    case 'process_flow':
      return { x: 50, y: 100 }; // Slightly offset for flow diagrams
    case 'overlay':
      return { x: 100, y: 50 }; // Corner position for overlays
    default:
      return { x: index * 20, y: index * 20 }; // Staggered positioning
  }
}

function calculateSegmentScale(segment: any): number {
  const complexity = segment.manimSegment?.metadata?.complexity || 'moderate';
  
  switch (complexity) {
    case 'simple':
      return 0.8; // Smaller scale for simple diagrams
    case 'complex':
      return 1.2; // Larger scale for complex diagrams
    default:
      return 1.0; // Standard scale
  }
}

function determineBlendMode(segment: any): 'normal' | 'multiply' | 'overlay' | 'screen' {
  const diagramType = segment.manimSegment?.metadata?.diagramType || 'process_flow';
  
  switch (diagramType) {
    case 'http_flow':
      return 'normal';
    case 'dns_resolution':
      return 'overlay';
    case 'data_structure':
      return 'multiply';
    default:
      return 'normal';
  }
}

function calculateSegmentOpacity(
  segment: any, 
  currentFrame: number, 
  fps: number
): number {
  // Calculate opacity based on timing and transitions
  const segmentProgress = (currentFrame - segment.startFrame) / (segment.endFrame - segment.startFrame);
  
  // Apply fade effects for smooth transitions
  if (segmentProgress < 0.1) {
    return segmentProgress * 10; // Fade in
  } else if (segmentProgress > 0.9) {
    return (1 - segmentProgress) * 10; // Fade out
  }
  
  return 1.0; // Full opacity
}