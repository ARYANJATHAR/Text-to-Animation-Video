import React from 'react';
import { 
  AbsoluteFill, 
  useCurrentFrame, 
  useVideoConfig,
  Sequence
} from 'remotion';
import { AspectRatio } from '../config/videoConfig';
import { ConceptCard } from '../components/content/ConceptCard';
import { ProgressIndicator } from '../components/ui/ProgressIndicator';

interface ContentSceneProps {
  topic: string;
  concepts: string[];
  aspectRatio: AspectRatio;
  animationType: 'remotion' | 'threejs' | 'manim' | 'hybrid';
}

export const ContentScene: React.FC<ContentSceneProps> = ({
  topic,
  concepts,
  aspectRatio,
  animationType
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  // Calculate timing for each concept
  const conceptDuration = Math.floor(durationInFrames / concepts.length);
  const overlapDuration = 10; // Frames of overlap between concepts
  
  // Layout configuration based on aspect ratio
  const getLayoutConfig = () => {
    switch (aspectRatio) {
      case '9:16':
        return {
          padding: '20px',
          conceptsPerRow: 1,
          spacing: '20px',
          titleSize: 'text-2xl',
        };
      case '1:1':
        return {
          padding: '30px',
          conceptsPerRow: 2,
          spacing: '15px',
          titleSize: 'text-2xl',
        };
      default:
        return {
          padding: '40px',
          conceptsPerRow: 2,
          spacing: '20px',
          titleSize: 'text-3xl',
        };
    }
  };
  
  const layout = getLayoutConfig();
  
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: layout.padding,
      }}
    >
      {/* Scene Title */}
      <div
        style={{
          position: 'absolute',
          top: layout.padding,
          left: layout.padding,
          right: layout.padding,
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <h2 className={`font-bold text-white ${layout.titleSize} mb-4`}>
          Key Concepts
        </h2>
      </div>
      
      {/* Progress Indicator */}
      <ProgressIndicator
        total={concepts.length}
        current={Math.floor(frame / conceptDuration)}
        aspectRatio={aspectRatio}
      />
      
      {/* Concepts Grid */}
      <div
        style={{
          position: 'absolute',
          top: aspectRatio === '9:16' ? '100px' : '120px',
          left: layout.padding,
          right: layout.padding,
          bottom: '80px',
          display: 'grid',
          gridTemplateColumns: `repeat(${layout.conceptsPerRow}, 1fr)`,
          gap: layout.spacing,
          alignContent: 'center',
        }}
      >
        {concepts.map((concept, index) => {
          const startFrame = index * (conceptDuration - overlapDuration);
          const endFrame = startFrame + conceptDuration;
          
          return (
            <Sequence
              key={concept}
              from={startFrame}
              durationInFrames={conceptDuration}
            >
              <ConceptCard
                concept={concept}
                index={index}
                aspectRatio={aspectRatio}
                animationType={animationType}
                isActive={frame >= startFrame && frame < endFrame}
              />
            </Sequence>
          );
        })}
      </div>
      
      {/* Bottom Navigation Hint */}
      {aspectRatio !== '9:16' && (
        <div
          style={{
            position: 'absolute',
            bottom: layout.padding,
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white',
            fontSize: '14px',
            opacity: 0.7,
          }}
        >
          Understanding {topic}
        </div>
      )}
    </AbsoluteFill>
  );
};