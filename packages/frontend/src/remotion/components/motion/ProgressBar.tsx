import React from 'react';
import { 
  useCurrentFrame, 
  interpolate,
  spring,
  useVideoConfig
} from 'remotion';

interface ProgressBarProps {
  progress: number; // 0 to 1
  width?: number;
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
  animationType?: 'linear' | 'spring' | 'bounce';
  delay?: number;
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  width = 300,
  height = 8,
  backgroundColor = '#e5e7eb',
  fillColor = '#3b82f6',
  animationType = 'spring',
  delay = 0,
  showPercentage = false,
  className = ''
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const adjustedFrame = Math.max(0, frame - delay);
  
  const getAnimatedProgress = () => {
    switch (animationType) {
      case 'spring':
        return spring({
          frame: adjustedFrame,
          fps,
          config: {
            damping: 200,
            stiffness: 100,
            mass: 0.5,
          },
        }) * progress;
        
      case 'bounce':
        const bounceSpring = spring({
          frame: adjustedFrame,
          fps,
          config: {
            damping: 100,
            stiffness: 200,
            mass: 1,
          },
        });
        return bounceSpring * progress;
        
      default: // linear
        return interpolate(adjustedFrame, [0, 60], [0, progress]);
    }
  };
  
  const animatedProgress = Math.min(1, Math.max(0, getAnimatedProgress()));
  const fillWidth = animatedProgress * width;
  
  if (frame < delay) {
    return null;
  }
  
  return (
    <div className={`relative ${className}`}>
      {/* Background bar */}
      <div
        style={{
          width,
          height,
          backgroundColor,
          borderRadius: height / 2,
          overflow: 'hidden',
        }}
      >
        {/* Fill bar */}
        <div
          style={{
            width: fillWidth,
            height: '100%',
            backgroundColor: fillColor,
            borderRadius: height / 2,
            transition: 'width 0.1s ease-out',
          }}
        />
      </div>
      
      {/* Percentage text */}
      {showPercentage && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '12px',
            fontWeight: 'bold',
            color: animatedProgress > 0.5 ? 'white' : '#374151',
          }}
        >
          {Math.round(animatedProgress * 100)}%
        </div>
      )}
    </div>
  );
};