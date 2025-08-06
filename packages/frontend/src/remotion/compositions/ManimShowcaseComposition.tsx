import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { ManimRemotionIntegrator } from '../components/ManimRemotionIntegrator';
import type { TimelineSegment, AspectRatio } from 'shared-types';

export interface ManimShowcaseCompositionProps {
  topic: string;
  animationIds: string[];
  aspectRatio: AspectRatio;
  backgroundColor?: string;
  showTitle?: boolean;
  enableTransitions?: boolean;
}

export const ManimShowcaseComposition: React.FC<ManimShowcaseCompositionProps> = ({
  topic,
  animationIds,
  aspectRatio,
  backgroundColor = '#1a1a2e',
  showTitle = true,
  enableTransitions = true
}) => {
  const { fps } = useVideoConfig();

  // Create a sample timeline for demonstration
  const timeline: TimelineSegment[] = animationIds.map((animationId, index) => ({
    id: animationId,
    startTime: index * 12, // 12 seconds per segment with 2-second gaps
    duration: 10,
    technology: 'manim',
    content: {
      type: 'diagram',
      data: {
        diagramType: getDiagramType(animationId),
        complexity: getComplexity(index)
      }
    },
    animations: []
  }));

  const titleDuration = showTitle ? 3 * fps : 0; // 3 seconds for title
  const totalDuration = Math.max(
    ...timeline.map(segment => (segment.startTime + segment.duration) * fps),
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
            animationCount={animationIds.length}
          />
        </Sequence>
      )}

      {/* Main Manim Integration */}
      <Sequence from={titleDuration} durationInFrames={totalDuration - titleDuration}>
        <ManimRemotionIntegrator
          animationIds={animationIds}
          timeline={timeline}
          backgroundColor="transparent"
          enableTransitions={enableTransitions}
          onIntegrationComplete={(result) => {
            console.log('Integration completed:', result);
          }}
          onError={(error) => {
            console.error('Integration error:', error);
          }}
        />
      </Sequence>

      {/* Outro Sequence */}
      <Sequence from={totalDuration - 2 * fps} durationInFrames={2 * fps}>
        <OutroSequence aspectRatio={aspectRatio} />
      </Sequence>
    </AbsoluteFill>
  );
};

// Title sequence component
const TitleSequence: React.FC<{
  topic: string;
  aspectRatio: AspectRatio;
  animationCount: number;
}> = ({ topic, aspectRatio, animationCount }) => {
  const { width, height } = useVideoConfig();
  
  // Responsive font sizes based on aspect ratio
  const titleFontSize = aspectRatio === '9:16' ? 52 : aspectRatio === '1:1' ? 48 : 64;
  const subtitleFontSize = titleFontSize * 0.4;

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
      }}
    >
      {/* Main Title */}
      <div
        style={{
          fontSize: titleFontSize,
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
          maxWidth: width * 0.9,
          lineHeight: 1.2,
          textShadow: '0 4px 8px rgba(0,0,0,0.3)',
          marginBottom: 30,
        }}
      >
        {topic}
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: subtitleFontSize,
          color: 'rgba(255,255,255,0.9)',
          textAlign: 'center',
          marginBottom: 40,
        }}
      >
        Interactive Mathematical Visualization
      </div>

      {/* Animation Count Badge */}
      <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          padding: '12px 24px',
          borderRadius: 25,
          border: '1px solid rgba(255,255,255,0.3)',
          color: 'white',
          fontSize: subtitleFontSize * 0.8,
          fontWeight: '500',
        }}
      >
        {animationCount} Diagram{animationCount !== 1 ? 's' : ''}
      </div>

      {/* Decorative Elements */}
      <div
        style={{
          position: 'absolute',
          top: 50,
          right: 50,
          width: 100,
          height: 100,
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
      
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          left: 60,
          width: 60,
          height: 60,
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
    </AbsoluteFill>
  );
};

// Outro sequence component
const OutroSequence: React.FC<{
  aspectRatio: AspectRatio;
}> = ({ aspectRatio }) => {
  const { width, height } = useVideoConfig();
  
  const fontSize = aspectRatio === '9:16' ? 36 : aspectRatio === '1:1' ? 32 : 42;

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(45deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
      }}
    >
      <div
        style={{
          fontSize,
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
          marginBottom: 20,
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        Thank You
      </div>
      
      <div
        style={{
          fontSize: fontSize * 0.6,
          color: 'rgba(255,255,255,0.7)',
          textAlign: 'center',
        }}
      >
        Powered by Manim + Remotion
      </div>

      {/* Animated background elements */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(240, 147, 251, 0.05) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

// Helper functions for generating sample data
function getDiagramType(animationId: string): string {
  const types = ['http_flow', 'dns_resolution', 'data_structure', 'process_flow'];
  const hash = animationId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return types[Math.abs(hash) % types.length];
}

function getComplexity(index: number): 'simple' | 'moderate' | 'complex' {
  const complexities: ('simple' | 'moderate' | 'complex')[] = ['simple', 'moderate', 'complex'];
  return complexities[index % complexities.length];
}