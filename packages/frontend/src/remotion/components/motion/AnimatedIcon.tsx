import React from 'react';
import { 
  useCurrentFrame, 
  interpolate,
  spring,
  useVideoConfig
} from 'remotion';

interface AnimatedIconProps {
  type: 'arrow' | 'check' | 'cross' | 'loading' | 'play' | 'pause';
  size?: number;
  color?: string;
  animationType?: 'bounce' | 'rotate' | 'pulse' | 'draw';
  delay?: number;
  className?: string;
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  type,
  size = 24,
  color = '#3b82f6',
  animationType = 'bounce',
  delay = 0,
  className = ''
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const adjustedFrame = Math.max(0, frame - delay);
  
  // Animation calculations
  const bounceSpring = spring({
    frame: adjustedFrame,
    fps,
    config: {
      damping: 200,
      stiffness: 100,
      mass: 0.5,
    },
  });
  
  const rotateProgress = interpolate(adjustedFrame, [0, 60], [0, 360]);
  const pulseScale = interpolate(
    Math.sin(adjustedFrame * 0.2), 
    [-1, 1], 
    [0.8, 1.2]
  );
  
  const drawProgress = interpolate(adjustedFrame, [0, 60], [0, 1]);
  
  const getAnimationStyle = () => {
    switch (animationType) {
      case 'bounce':
        return {
          transform: `scale(${bounceSpring})`,
        };
      case 'rotate':
        return {
          transform: `rotate(${rotateProgress}deg)`,
        };
      case 'pulse':
        return {
          transform: `scale(${pulseScale})`,
        };
      case 'draw':
        return {
          strokeDasharray: '100',
          strokeDashoffset: `${100 - (drawProgress * 100)}`,
        };
      default:
        return {};
    }
  };
  
  const getIconPath = () => {
    switch (type) {
      case 'arrow':
        return 'M5 12h14m-7-7l7 7-7 7';
      case 'check':
        return 'M20 6L9 17l-5-5';
      case 'cross':
        return 'M18 6L6 18M6 6l12 12';
      case 'loading':
        return 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z';
      case 'play':
        return 'M8 5v14l11-7z';
      case 'pause':
        return 'M6 4h4v16H6zM14 4h4v16h-4z';
      default:
        return '';
    }
  };
  
  if (frame < delay) {
    return null;
  }
  
  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        ...getAnimationStyle(),
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={getIconPath()} />
      </svg>
    </div>
  );
};