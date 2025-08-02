import React from 'react';
import { 
  AbsoluteFill, 
  useCurrentFrame, 
  interpolate,
  useVideoConfig
} from 'remotion';

interface SceneTransitionProps {
  type: 'fade' | 'slide' | 'fadeSlide' | 'zoom';
  direction?: 'up' | 'down' | 'left' | 'right';
  color?: string;
}

export const SceneTransition: React.FC<SceneTransitionProps> = ({
  type,
  direction = 'up',
  color = '#000000'
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  const progress = frame / durationInFrames;
  
  const getTransitionStyle = () => {
    switch (type) {
      case 'fade':
        return {
          opacity: interpolate(progress, [0, 1], [0, 1]),
        };
        
      case 'slide':
        const slideDistance = direction === 'up' || direction === 'down' ? '100vh' : '100vw';
        const slideDirection = direction === 'up' || direction === 'left' ? '-' : '';
        const axis = direction === 'up' || direction === 'down' ? 'Y' : 'X';
        
        return {
          transform: `translate${axis}(${interpolate(
            progress,
            [0, 1],
            [`${slideDirection}${slideDistance}`, '0px']
          )})`,
        };
        
      case 'fadeSlide':
        const fadeSlideDistance = direction === 'up' || direction === 'down' ? '50px' : '50px';
        const fadeSlideDirection = direction === 'up' || direction === 'left' ? '-' : '';
        const fadeSlideAxis = direction === 'up' || direction === 'down' ? 'Y' : 'X';
        
        return {
          opacity: interpolate(progress, [0, 1], [0, 1]),
          transform: `translate${fadeSlideAxis}(${interpolate(
            progress,
            [0, 1],
            [`${fadeSlideDirection}${fadeSlideDistance}`, '0px']
          )})`,
        };
        
      case 'zoom':
        return {
          opacity: interpolate(progress, [0, 0.3, 1], [0, 1, 1]),
          transform: `scale(${interpolate(progress, [0, 1], [0.8, 1])})`,
        };
        
      default:
        return {};
    }
  };
  
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        ...getTransitionStyle(),
        pointerEvents: 'none',
      }}
    />
  );
};