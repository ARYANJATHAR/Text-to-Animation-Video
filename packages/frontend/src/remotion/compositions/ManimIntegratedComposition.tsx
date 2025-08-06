import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Sequence } from 'remotion';
import { MultiManimComposition } from '../components/MultiManimComposition';
import type { 
  ManimSegment, 
  TimelineSegment, 
  SynchronizationPoint,
  LayerComposition,
  AspectRatio 
} from 'shared-types';

export interface ManimIntegratedCompositionProps {
  aspectRatio: AspectRatio;
  topic: string;
  segments: ManimSegment[];
  timeline: TimelineSegment[];
  synchronizationPoints: SynchronizationPoint[];
  layerCompositions: LayerComposition[];
  backgroundColor?: string;
  showTitle?: boolean;
  enableTransitions?: boolean;
}

export const ManimIntegratedComposition: React.FC<ManimIntegratedCompositionProps> = ({
  aspectRatio,
  topic,
  segments,
  timeline,
  synchronizationPoints,
  layerCompositions,
  backgroundColor = '#1a1a1a',
  showTitle = true,
  enableTransitions = true
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  // Calculate title sequence duration
  const titleDuration = showTitle ? 2 * fps : 0; // 2 seconds
  
  // Filter timeline for Manim segments only
  const manimTimeline = timeline.filter(segment => segment.technology === 'manim');
  
  // Calculate total composition duration
  const totalDuration = Math.max(
    ...manimTimeline.map(segment => (segment.startTime + segment.duration) * fps),
    titleDuration
  );
  
  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Title Sequence */}
      {showTitle && (
        <Sequence from={0} durationInFrames={titleDuration}>
          <TitleSequence
            topic={topic}
            aspectRatio={aspectRatio}
            width={width}
            height={height}
          />
        </Sequence>
      )}
      
      {/* Main Manim Content */}
      <Sequence from={titleDuration} durationInFrames={totalDuration - titleDuration}>
        <MultiManimComposition
          segments={segments}
          timeline={manimTimeline}
          synchronizationPoints={synchronizationPoints}
          layerCompositions={layerCompositions}
          backgroundColor="transparent"
          enableTransitions={enableTransitions}
          transitionDuration={0.8}
        />
      </Sequence>
      
      {/* Debug Information (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <DebugOverlay
          segments={segments}
          timeline={manimTimeline}
          synchronizationPoints={synchronizationPoints}
          currentFrame={frame}
          fps={fps}
        />
      )}
    </AbsoluteFill>
  );
};

// Title sequence component
const TitleSequence: React.FC<{
  topic: string;
  aspectRatio: AspectRatio;
  width: number;
  height: number;
}> = ({ topic, aspectRatio, width, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Calculate responsive font size based on aspect ratio
  const fontSize = aspectRatio === '9:16' ? 48 : aspectRatio === '1:1' ? 42 : 56;
  const titleOpacity = Math.min(1, frame / (0.5 * fps)); // Fade in over 0.5 seconds
  
  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div
        style={{
          fontSize,
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
          opacity: titleOpacity,
          transform: `translateY(${Math.max(0, 20 - frame)}px)`,
          maxWidth: width * 0.8,
          lineHeight: 1.2,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }}
      >
        {topic}
      </div>
      
      <div
        style={{
          fontSize: fontSize * 0.4,
          color: 'rgba(255,255,255,0.8)',
          marginTop: 20,
          opacity: Math.max(0, titleOpacity - 0.3),
          transform: `translateY(${Math.max(0, 30 - frame)}px)`,
        }}
      >
        Educational Animation
      </div>
    </AbsoluteFill>
  );
};

// Debug overlay for development
const DebugOverlay: React.FC<{
  segments: ManimSegment[];
  timeline: TimelineSegment[];
  synchronizationPoints: SynchronizationPoint[];
  currentFrame: number;
  fps: number;
}> = ({ segments, timeline, synchronizationPoints, currentFrame, fps }) => {
  const currentTime = currentFrame / fps;
  
  // Find active segments
  const activeSegments = timeline.filter(segment => 
    currentTime >= segment.startTime && 
    currentTime <= segment.startTime + segment.duration
  );
  
  // Find upcoming sync points
  const upcomingSyncPoints = synchronizationPoints.filter(sp => 
    sp.timestamp > currentTime && sp.timestamp <= currentTime + 2
  );
  
  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: 10,
        fontSize: 12,
        fontFamily: 'monospace',
        borderRadius: 4,
        maxWidth: 300,
      }}
    >
      <div>Frame: {currentFrame} | Time: {currentTime.toFixed(2)}s</div>
      <div>Total Segments: {segments.length}</div>
      <div>Active Segments: {activeSegments.length}</div>
      {activeSegments.length > 0 && (
        <div>
          Active: {activeSegments.map(s => s.id.slice(-8)).join(', ')}
        </div>
      )}
      {upcomingSyncPoints.length > 0 && (
        <div>
          Next Sync: {upcomingSyncPoints[0].timestamp.toFixed(2)}s
        </div>
      )}
    </div>
  );
};