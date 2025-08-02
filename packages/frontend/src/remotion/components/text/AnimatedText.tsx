import React from 'react';
import { 
  useCurrentFrame, 
  interpolate,
  useVideoConfig
} from 'remotion';

interface AnimatedTextProps {
  text: string;
  className?: string;
  animationType: 'fadeIn' | 'slideUp' | 'slideDown' | 'typewriter' | 'scale';
  delay?: number;
  duration?: number;
  style?: React.CSSProperties;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  className = '',
  animationType,
  delay = 0,
  duration,
  style = {}
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  const animationDuration = duration || Math.min(60, durationInFrames - delay); // Default 2 seconds or remaining time
  const adjustedFrame = Math.max(0, frame - delay);
  const progress = Math.min(1, adjustedFrame / animationDuration);
  
  const getAnimationStyle = (): React.CSSProperties => {
    switch (animationType) {
      case 'fadeIn':
        return {
          opacity: interpolate(progress, [0, 1], [0, 1]),
        };
        
      case 'slideUp':
        return {
          opacity: interpolate(progress, [0, 0.3, 1], [0, 1, 1]),
          transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
        };
        
      case 'slideDown':
        return {
          opacity: interpolate(progress, [0, 0.3, 1], [0, 1, 1]),
          transform: `translateY(${interpolate(progress, [0, 1], [-30, 0])}px)`,
        };
        
      case 'scale':
        return {
          opacity: interpolate(progress, [0, 0.3, 1], [0, 1, 1]),
          transform: `scale(${interpolate(progress, [0, 1], [0.8, 1])})`,
        };
        
      case 'typewriter':
        const visibleChars = Math.floor(interpolate(progress, [0, 1], [0, text.length]));
        return {
          opacity: 1,
        };
        
      default:
        return {};
    }
  };
  
  const getDisplayText = () => {
    if (animationType === 'typewriter') {
      const visibleChars = Math.floor(interpolate(progress, [0, 1], [0, text.length]));
      return text.slice(0, visibleChars);
    }
    return text;
  };
  
  // Don't render if animation hasn't started
  if (frame < delay) {
    return null;
  }
  
  return (
    <div
      className={className}
      style={{
        ...style,
        ...getAnimationStyle(),
      }}
    >
      {getDisplayText()}
      {animationType === 'typewriter' && progress < 1 && (
        <span 
          style={{
            opacity: Math.sin(frame * 0.5) > 0 ? 1 : 0,
            marginLeft: '2px',
          }}
        >
          |
        </span>
      )}
    </div>
  );
};