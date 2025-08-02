import React from 'react';
import { 
  AbsoluteFill, 
  useCurrentFrame, 
  useVideoConfig,
  interpolate,
  Sequence
} from 'remotion';
import { AspectRatio } from '../config/videoConfig';
import { IntroScene } from '../scenes/IntroScene';
import { ContentScene } from '../scenes/ContentScene';
import { OutroScene } from '../scenes/OutroScene';
import { SceneTransition } from '../components/transitions/SceneTransition';

export interface EducationalVideoProps {
  aspectRatio: AspectRatio;
  topic: string;
  concepts: string[];
  animationType: 'remotion' | 'threejs' | 'manim' | 'hybrid';
}

export const EducationalVideoComposition: React.FC<EducationalVideoProps> = ({
  aspectRatio,
  topic,
  concepts,
  animationType
}) => {
  const { durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  
  // Calculate scene durations based on total duration
  const introDuration = Math.floor(durationInFrames * 0.15); // 15% for intro
  const contentDuration = Math.floor(durationInFrames * 0.75); // 75% for content
  const outroDuration = durationInFrames - introDuration - contentDuration; // Remaining for outro
  
  // Transition durations
  const transitionDuration = 15; // 0.5 seconds at 30fps
  
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#f8fafc',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Intro Scene */}
      <Sequence from={0} durationInFrames={introDuration}>
        <IntroScene
          topic={topic}
          aspectRatio={aspectRatio}
          animationType={animationType}
        />
      </Sequence>
      
      {/* Transition from Intro to Content */}
      <Sequence 
        from={introDuration - transitionDuration} 
        durationInFrames={transitionDuration}
      >
        <SceneTransition type="fadeSlide" direction="up" />
      </Sequence>
      
      {/* Main Content Scene */}
      <Sequence 
        from={introDuration} 
        durationInFrames={contentDuration}
      >
        <ContentScene
          topic={topic}
          concepts={concepts}
          aspectRatio={aspectRatio}
          animationType={animationType}
        />
      </Sequence>
      
      {/* Transition from Content to Outro */}
      <Sequence 
        from={introDuration + contentDuration - transitionDuration} 
        durationInFrames={transitionDuration}
      >
        <SceneTransition type="fadeSlide" direction="down" />
      </Sequence>
      
      {/* Outro Scene */}
      <Sequence 
        from={introDuration + contentDuration} 
        durationInFrames={outroDuration}
      >
        <OutroScene
          topic={topic}
          aspectRatio={aspectRatio}
        />
      </Sequence>
    </AbsoluteFill>
  );
};